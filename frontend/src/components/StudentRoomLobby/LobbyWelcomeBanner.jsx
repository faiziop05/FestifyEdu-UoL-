import React from "react";
import styles from "../../styles/components_css/StudentRoomLobby/LobbyWelcomeBanner.module.css";

const LobbyWelcomeBanner = ({ session }) => {
  return (
    <div className={styles.welcomeBanner}>
      <h2>Welcome, {session?.display_name}!</h2>
      <p>
        Stay connected to see live active quizzes. Review completed quizzes or start active ones below.
      </p>
    </div>
  );
};

export default LobbyWelcomeBanner;
