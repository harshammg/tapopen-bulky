// Simulated campaign runner. Cycles through contacts in random batches with
// random delays, updating progress + logs on the store. Replace with real
// REST/WebSocket integration when a backend is available.
import { actions, getState, randInt, renderTemplate, type Contact } from "./store";
import { socket } from "./socket";

let cancelled = false;
let pauseRef = { paused: false };
let activeTimers: { id: ReturnType<typeof setTimeout>; resolve: () => void }[] = [];

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    const id = setTimeout(() => {
      activeTimers = activeTimers.filter((x) => x.id !== id);
      resolve();
    }, ms);
    activeTimers.push({ id, resolve });
  });
}

async function waitWhilePaused() {
  while (pauseRef.paused && !cancelled) {
    await sleep(300);
  }
}

export async function startCampaign() {
  const s = getState();
  if (s.draft.contacts.length === 0) return;
  cancelled = false;
  pauseRef.paused = false;
  actions.setRunning(true);

  // reset contact statuses to pending
  actions.setContacts(s.draft.contacts.map((c) => ({ ...c, status: "pending" as const })));
  actions.clearLogs();
  actions.log({ message: `Campaign "${s.draft.name || "Untitled"}" started`, type: "info" });

  const startedAt = Date.now();
  const total = s.draft.contacts.length;
  let sent = 0;
  let failed = 0;
  actions.setProgress({ total, sent: 0, failed: 0, pending: total });

  // shuffle queue
  const queue = [...getState().draft.contacts].sort(() => Math.random() - 0.5);

  while (queue.length && !cancelled) {
    await waitWhilePaused();
    if (cancelled) break;

    const { draft } = getState();
    const batchSize = Math.min(queue.length, randInt(draft.batchMin, draft.batchMax));
    const batch = queue.splice(0, batchSize);

    for (const contact of batch) {
      if (cancelled) break;
      await waitWhilePaused();

      actions.updateContactStatus(contact.id, "sending");
      actions.log({ message: `Sending to ${contact.name}`, type: "sending" });

      // simulate human pacing
      await sleep(randInt(400, 900));

      const message = draft.mode === "personalized" ? renderTemplate(draft.personalizedTemplate, contact) : draft.commonTemplate;

      const success = await new Promise<boolean>((resolve) => {
        let timeout: ReturnType<typeof setTimeout>;

        const cleanup = () => {
          clearTimeout(timeout);
          socket.off("message_sent", onSent);
          socket.off("message_failed", onFailed);
        };

        const onSent = (data: { contactId: string }) => {
          if (data.contactId === contact.id) {
            cleanup();
            resolve(true);
          }
        };

        const onFailed = (data: { contactId: string, error: string }) => {
          if (data.contactId === contact.id) {
            cleanup();
            resolve(false);
          }
        };

        timeout = setTimeout(() => {
          cleanup();
          actions.log({ message: `Timeout waiting for response from ${contact.name}`, type: "failed" });
          resolve(false);
        }, 30000);

        socket.on("message_sent", onSent);
        socket.on("message_failed", onFailed);
        socket.emit("send_message", { phone: contact.phone, message, contactId: contact.id });
      });

      if (success) {
        actions.updateContactStatus(contact.id, "sent");
        sent += 1;
        actions.log({ message: `Sent to ${contact.name}`, type: "success" });
      } else {
        actions.updateContactStatus(contact.id, "failed");
        failed += 1;
        actions.log({ message: `Failed to send to ${contact.name}`, type: "failed" });
      }
      actions.setProgress({ total, sent, failed, pending: total - sent - failed });
    }

    if (queue.length && !cancelled) {
      const { draft: d2 } = getState();
      const delay = randInt(d2.delayMin, d2.delayMax);
      actions.log({ message: `Waiting ${delay} sec before next batch`, type: "waiting" });
      await sleep(delay * 1000);
    }
  }

  const durationSec = Math.round((Date.now() - startedAt) / 1000);
  if (!cancelled) {
    const d = getState().draft;
    actions.saveCampaignToHistory({
      ...d,
      total,
      sent,
      failed,
      durationSec,
    });
    actions.log({ message: `Campaign finished - ${sent}/${total} sent`, type: "info" });
  } else {
    actions.log({ message: `Campaign stopped`, type: "info" });
  }
  actions.setRunning(false);
}

export function pauseCampaign() {
  pauseRef.paused = true;
  actions.setRunning(true, true);
  actions.log({ message: "Paused", type: "waiting" });
}

export function resumeCampaign() {
  pauseRef.paused = false;
  actions.setRunning(true, false);
  actions.log({ message: "Resumed", type: "info" });
}

export function stopCampaign() {
  cancelled = true;
  pauseRef.paused = false;
  activeTimers.forEach((t) => {
    clearTimeout(t.id);
    t.resolve(); // Unblock pending sleep promises
  });
  activeTimers = [];
  
  // Immediately update UI to feel responsive
  actions.setRunning(false);
}

export function previewMessage(tpl: string, sample: Contact) {
  return renderTemplate(tpl, sample);
}
