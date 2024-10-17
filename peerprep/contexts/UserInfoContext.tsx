// maybe store  SAFE user info and wrap the whole damn app in it
// username, userid?, userstate (matching, idle, inmenu)

"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserInfoContextType {
  userid: string;
  setUserid: (userid: string) => void;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(
  undefined
);

export const UserInfoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userid, setUserid] = useState<string>("dummy-user");

  return (
    <UserInfoContext.Provider value={{ userid, setUserid }}>
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
