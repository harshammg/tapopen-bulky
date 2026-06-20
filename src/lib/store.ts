// Lightweight reactive store backed by localStorage. Frontend-only mock for
// the WA Campaign Manager (no real WhatsApp connectivity).
import { useSyncExternalStore } from "react";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  status: "pending" | "sent" | "failed" | "sending";
};

export type LogEntry = {
  id: string;
  time: string;
  message: string;
  type: "success" | "waiting" | "failed" | "sending" | "info";
};

export type MessageMode = "personalized" | "common";

export type CampaignDraft = {
  name: string;
  contacts: Contact[];
  mode: MessageMode;
  personalizedTemplate: string;
  commonTemplate: string;
  batchMin: number;
  batchMax: number;
  delayMin: number;
  delayMax: number;
};

export type Campaign = CampaignDraft & {
  id: string;
  createdAt: string;
  durationSec: number;
  total: number;
  sent: number;
  failed: number;
};

export type Settings = {
  defaultBatchMin: number;
  defaultBatchMax: number;
  defaultDelayMin: number;
  defaultDelayMax: number;
};

export type AppState = {
  authedEmail: string | null;
  connected: boolean; // True when whatsapp client is authenticated
  qrUrl: string | null;
  socketConnected: boolean;
  draft: CampaignDraft;
  history: Campaign[];
  templates: { id: string; name: string; body: string; mode: MessageMode }[];
  settings: Settings;
  // execution
  running: boolean;
  paused: boolean;
  progress: { total: number; sent: number; failed: number; pending: number };
  logs: LogEntry[];
};

const defaultDraft = (s: Settings): CampaignDraft => ({
  name: "",
  contacts: [],
  mode: "personalized",
  personalizedTemplate:
    "Hello {name},\n\nWe would like to invite you to our healthcare awareness program.\n\nVenue : PESCE\nDate : 22 June\n\nRegards,\nHarsha",
  commonTemplate:
    "Hello Everyone,\n\nWe would like to invite you to our healthcare awareness program.\n\nVenue : PESCE\nDate : 22 June\n\nRegards,\nHarsha",
  batchMin: s.defaultBatchMin,
  batchMax: s.defaultBatchMax,
  delayMin: s.defaultDelayMin,
  delayMax: s.defaultDelayMax,
});

const defaultSettings: Settings = {
  defaultBatchMin: 3,
  defaultBatchMax: 5,
  defaultDelayMin: 8,
  defaultDelayMax: 20,
};

const STORAGE_KEY = "wa-campaign-manager:v1";

const initialState: AppState = {
  authedEmail: null,
  connected: false,
  qrUrl: null,
  socketConnected: false,
  draft: defaultDraft(defaultSettings),
  history: [],
  templates: [
    {
      id: "t1",
      name: "Medical Camp Invite",
      mode: "personalized",
      body:
        "Hello {name},\n\nWe would like to invite you to our healthcare awareness program.\n\nVenue : PESCE\nDate : 22 June\n\nRegards,\nHarsha",
    },
  ],
  settings: defaultSettings,
  running: false,
  paused: false,
  progress: { total: 0, sent: 0, failed: 0, pending: 0 },
  logs: [],
};

let state: AppState = load();
const listeners = new Set<() => void>();

function load(): AppState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed, running: false, paused: false };
  } catch {
    return initialState;
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    const { running, paused, ...rest } = state;
    void running; void paused;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {}
}

export function getState() {
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(initialState),
  );
}

export const actions = {
  login(email: string) {
    setState((s) => ({ ...s, authedEmail: email }));
  },
  logout() {
    setState((s) => ({ ...s, authedEmail: null }));
  },
  setConnected(connected: boolean) {
    setState((s) => ({ ...s, connected }));
  },
  setQrUrl(qrUrl: string | null) {
    setState((s) => ({ ...s, qrUrl }));
  },
  setSocketConnected(socketConnected: boolean) {
    setState((s) => ({ ...s, socketConnected }));
  },
  toggleConnected() {
    setState((s) => ({ ...s, connected: !s.connected }));
  },
  updateDraft(patch: Partial<CampaignDraft>) {
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  },
  resetDraft() {
    setState((s) => ({ ...s, draft: defaultDraft(s.settings) }));
  },
  setContacts(contacts: Contact[]) {
    setState((s) => ({ ...s, draft: { ...s.draft, contacts } }));
  },
  addContact(c: Omit<Contact, "id" | "status">) {
    setState((s) => ({
      ...s,
      draft: {
        ...s.draft,
        contacts: [
          ...s.draft.contacts,
          { ...c, id: crypto.randomUUID(), status: "pending" },
        ],
      },
    }));
  },
  removeContact(id: string) {
    setState((s) => ({
      ...s,
      draft: { ...s.draft, contacts: s.draft.contacts.filter((c) => c.id !== id) },
    }));
  },
  updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },
  log(entry: Omit<LogEntry, "id" | "time">) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setState((s) => ({ ...s, logs: [{ ...entry, id: crypto.randomUUID(), time }, ...s.logs].slice(0, 200) }));
  },
  clearLogs() {
    setState((s) => ({ ...s, logs: [] }));
  },
  saveCampaignToHistory(c: Omit<Campaign, "id" | "createdAt">) {
    setState((s) => ({
      ...s,
      history: [
        { ...c, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ...s.history,
      ],
    }));
  },
  deleteHistory(id: string) {
    setState((s) => ({ ...s, history: s.history.filter((h) => h.id !== id) }));
  },
  clearHistory() {
    setState((s) => ({ ...s, history: [] }));
  },
  setRunning(running: boolean, paused = false) {
    setState((s) => ({ ...s, running, paused }));
  },
  setProgress(p: AppState["progress"]) {
    setState((s) => ({ ...s, progress: p }));
  },
  updateContactStatus(id: string, status: Contact["status"]) {
    setState((s) => ({
      ...s,
      draft: {
        ...s.draft,
        contacts: s.draft.contacts.map((c) => (c.id === id ? { ...c, status } : c)),
      },
    }));
  },
  saveTemplate(name: string, body: string, mode: MessageMode) {
    setState((s) => ({
      ...s,
      templates: [{ id: crypto.randomUUID(), name, body, mode }, ...s.templates],
    }));
  },
  deleteTemplate(id: string) {
    setState((s) => ({ ...s, templates: s.templates.filter((t) => t.id !== id) }));
  },
};

export function renderTemplate(tpl: string, c: Contact) {
  return tpl.replaceAll("{name}", c.name).replaceAll("{number}", c.phone);
}

export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
