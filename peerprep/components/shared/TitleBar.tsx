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
    <div className={styles.bar}>
      <h1 className={styles.title}>PeerPrep</h1>
      <div className={styles.circle}>PH</div>
    </div>
  );
}

export default TitleBar;
