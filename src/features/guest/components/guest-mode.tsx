"use client";
import { createContext, useContext } from "react";
const GuestMode = createContext(false);
export function GuestModeProvider({ children }: { children: React.ReactNode }) {
  return <GuestMode.Provider value={true}>{children}</GuestMode.Provider>;
}
export const useGuestMode = () => useContext(GuestMode);
