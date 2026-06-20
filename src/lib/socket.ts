import { io } from "socket.io-client";
import { actions } from "./store";

// Connect to the backend server (Vite proxies /socket.io to backend)
export const socket = io("/", {
  path: "/socket.io",
  autoConnect: false, // We'll connect manually or automatically based on logic
});

socket.on("connect", () => {
  actions.setSocketConnected(true);
});

socket.on("disconnect", () => {
  actions.setSocketConnected(false);
  actions.setConnected(false);
  actions.setQrUrl(null);
});

socket.on("status", (data: { ready: boolean; qr: boolean }) => {
  if (data.ready) {
    actions.setConnected(true);
    actions.setQrUrl(null);
  } else {
    actions.setConnected(false);
  }
});

socket.on("qr", (qrUrl: string) => {
  actions.setQrUrl(qrUrl);
  actions.setConnected(false);
});

socket.on("ready", () => {
  actions.setConnected(true);
  actions.setQrUrl(null);
});

socket.on("authenticated", () => {
  actions.setQrUrl(null);
});

socket.on("auth_failure", () => {
  actions.setConnected(false);
  actions.setQrUrl(null);
});

socket.on("disconnected", () => {
  actions.setConnected(false);
  actions.setQrUrl(null);
});

export function initSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}
