import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Setup WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  }
});

let isReady = false;
let currentQr = "";

client.on("qr", async (qr) => {
  console.log("QR RECEIVED");
  currentQr = qr;
  isReady = false;
  // Send Data URL to client
  try {
    const dataUrl = await qrcode.toDataURL(qr);
    io.emit("qr", dataUrl);
  } catch (err) {
    console.error("Failed to generate QR code data URL", err);
  }
});

client.on("ready", () => {
  console.log("Client is ready!");
  isReady = true;
  currentQr = "";
  io.emit("ready");
});

client.on("authenticated", () => {
  console.log("Authenticated");
  io.emit("authenticated");
});

client.on("auth_failure", (msg) => {
  console.error("Auth failure", msg);
  isReady = false;
  currentQr = "";
  io.emit("auth_failure", msg);
});

client.on("disconnected", (reason) => {
  console.log("Client was logged out", reason);
  isReady = false;
  currentQr = "";
  io.emit("disconnected", reason);
});

io.on("connection", (socket) => {
  console.log("Frontend connected to socket");
  
  // Send current state on connection
  socket.emit("status", { ready: isReady, qr: currentQr ? true : false });
  if (currentQr && !isReady) {
    qrcode.toDataURL(currentQr).then(url => socket.emit("qr", url));
  } else if (isReady) {
    socket.emit("ready");
  }

  // Handle messages from frontend
  socket.on("send_message", async (data: { phone: string; message: string; contactId: string }) => {
    if (!isReady) {
      socket.emit("message_failed", { contactId: data.contactId, error: "WhatsApp not ready" });
      return;
    }

    try {
      // whatsapp-web.js requires country code. Ensure it has no '+' and ends with '@c.us'
      let formattedPhone = data.phone.replace(/[^0-9]/g, "");
      const chatId = `${formattedPhone}@c.us`;

      // Check if number is registered and get the proper internal WhatsApp ID (LID)
      const numberId = await client.getNumberId(formattedPhone);
      
      if (!numberId) {
        throw new Error(`Number ${formattedPhone} is not registered on WhatsApp`);
      }

      // Send the message using the proper serialized ID
      await client.sendMessage(numberId._serialized, data.message);
      
      console.log(`Sent message to ${formattedPhone}`);
      socket.emit("message_sent", { contactId: data.contactId });
    } catch (err: any) {
      console.error(`Failed to send message to ${data.phone}`, err);
      socket.emit("message_failed", { contactId: data.contactId, error: err.message });
    }
  });

  socket.on("refresh_session", async () => {
    try {
      if (client.pupPage) {
        console.log("Refreshing WhatsApp session (reloading page)...");
        await client.pupPage.reload({ waitUntil: "networkidle0" });
        console.log("Page reloaded.");
      }
    } catch (err) {
      console.error("Failed to refresh session", err);
    }
  });

  socket.on("logout", async () => {
    try {
      await client.logout();
      isReady = false;
      currentQr = "";
      io.emit("disconnected", "User logged out");
    } catch (err) {
      console.error("Logout failed", err);
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
  client.initialize().catch(err => console.error("Client init error", err));
});
