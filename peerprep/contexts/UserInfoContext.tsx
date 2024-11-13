// maybe store  SAFE user info and wrap the relevant client components in it (like titlebar? matchmaking?)
"use client";
import React, { createContext, ReactNode, useContext } from "react";
import { UserData } from "@/api/structs";

interface UserInfoProviderProps {
  userData: UserData;
  children: ReactNode;
}

const UserInfoContext = createContext<UserData | undefined>(undefined);

export function UserInfoProvider({
  userData,
  children,
}: UserInfoProviderProps) {
  return (
    <UserInfoContext.Provider value={userData}>
      {children}
    </UserInfoContext.Provider>
  );
}

/**
 * This should not be used to validate data!
 */
export const useUserInfo = (): UserData => {
  const context = useContext(UserInfoContext);
  if (!context) {
    throw new Error("useUserInfo must be used within a UserInfoProvider");
  }
  return context;
};
