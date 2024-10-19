"use client";
import React from "react";
import { useRouter } from "next/navigation";
import PeerprepButton from "../shared/PeerprepButton";

const Matchmaking = () => {
  const router = useRouter();
  return (
    <div className="p-4">
      <PeerprepButton onClick={() => router.push(`questions/new`)}>
        Add Question
      </PeerprepButton>
    </div>
  );
};

export default Matchmaking;
