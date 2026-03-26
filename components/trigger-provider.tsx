"use client";

import { TriggerAuthContext } from "@trigger.dev/react-hooks";

export function TriggerProvider({ children }: { children: React.ReactNode }) {
  return (
    <TriggerAuthContext.Provider
      value={{
        accessToken: process.env.NEXT_PUBLIC_TRIGGER_API_KEY!,
      }}
    >
      {children}
    </TriggerAuthContext.Provider>
  );
}
