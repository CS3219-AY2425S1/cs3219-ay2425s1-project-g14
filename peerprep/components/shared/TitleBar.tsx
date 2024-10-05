import React from "react";
import styles from "@/style/layout.module.css";

function TitleBar() {
  return (
      // TODO: We probably need an AuthContext to wrap this in - we retrieve
      // user info to populate the values here.
      // I think NextJS handles the auth differently due to the server
      // context thing though - maybe can access from a cookie?
      // The thing is this component should only load in a few times,
      // so theoretically retrieval doesn't actually happen more than once or twice
      // in a lifetime
      <div className="flex justify-between items-center bg-gray-800 p-4">
        <h1 className="text-2xl font-bold text-white">PeerPrep</h1>
        <div className="w-10 h-10 flex items-center justify-center bg-blue-500 text-white rounded-full">
          PH
        </div>
      </div>
  );
}

export default TitleBar;
