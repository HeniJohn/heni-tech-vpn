import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { EMPTY_CONNECTION, type ConnectionSnapshot, type LogEvent, type TunnelProfile } from "./domain";
import { deleteProfile, loadProfiles, saveProfiles, upsertProfile } from "./profile-service";

const LOGS_KEY = "heni-tech-independent.logs.v1";

type AppStateValue = {
  profiles: TunnelProfile[];
  connection: ConnectionSnapshot;
  logs: LogEvent[];
  ready: boolean;
  setProfiles: React.Dispatch<React.SetStateAction<TunnelProfile[]>>;
  setConnection: React.Dispatch<React.SetStateAction<ConnectionSnapshot>>;
  addLog: (level: LogEvent["level"], title: string, detail: string) => void;
  saveProfile: (profile: TunnelProfile) => Promise<void>;
  removeProfile: (id: string) => Promise<void>;
  clearLogs: () => Promise<void>;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<TunnelProfile[]>([]);
  const [connection, setConnection] = useState<ConnectionSnapshot>(EMPTY_CONNECTION);
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([loadProfiles(), AsyncStorage.getItem(LOGS_KEY)])
      .then(([savedProfiles, rawLogs]) => {
        setProfiles(savedProfiles);
        if (rawLogs) {
          try {
            const parsed = JSON.parse(rawLogs) as unknown;
            if (Array.isArray(parsed)) setLogs(parsed as LogEvent[]);
          } catch {
            setLogs([]);
          }
        }
      })
      .finally(() => setReady(true));
  }, []);

  const addLog = useCallback((level: LogEvent["level"], title: string, detail: string) => {
    const event: LogEvent = { id: `log-${Date.now()}-${Math.random()}`, at: new Date().toISOString(), level, title, detail };
    setLogs((current) => {
      const next = [event, ...current].slice(0, 300);
      void AsyncStorage.setItem(LOGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveProfile = useCallback(async (profile: TunnelProfile) => {
    const next = await upsertProfile(profile);
    setProfiles(next);
  }, []);

  const removeProfile = useCallback(async (id: string) => {
    const next = await deleteProfile(id);
    setProfiles(next);
  }, []);

  const clearLogs = useCallback(async () => {
    setLogs([]);
    await AsyncStorage.removeItem(LOGS_KEY);
  }, []);

  const value = useMemo(() => ({ profiles, connection, logs, ready, setProfiles, setConnection, addLog, saveProfile, removeProfile, clearLogs }), [profiles, connection, logs, ready, addLog, saveProfile, removeProfile, clearLogs]);
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
