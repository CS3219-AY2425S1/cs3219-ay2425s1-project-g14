// maybe store  SAFE user info and wrap the relevant client components in it (like titlebar? matchmaking?)
// username, userid?, userstate (matching, idle, inmenu)

"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserInfoProviderProps {
  userid: string|undefined,
  children: ReactNode
}

interface UserInfoContextType {
  userid: string;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined
);

export function UserInfoProvider({ userid, children }: UserInfoProviderProps) {
  const val = userid ? userid : "";
  return (
    <UserInfoContext.Provider value={{ userid: val }}>
      {children}
    </UserInfoContext.Provider>
  );
};

export const useUserInfo = (): UserInfoContextType => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfo must be used within a UserInfoProvider");
  }
  return context;
};
