import React from "react";

import "@wix/design-system/styles.global.css";
import { useAuth } from "../hooks/useAuth";
import { UserDashboard } from "./UserDashboard";
import WelcomePage from "./welcomePage/WelcomePage";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const HomePage = () => {
  const { user, isAdmin, handleLoginSuccess, handleLogout, switchUser } =
    useAuth();

  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  return user ? (
    <UserDashboard
      handleLogout={handleLogout}
      user={user}
      isAdmin={isAdmin}
      switchUser={switchUser}
    />
  ) : (
    <WelcomePage handleLoginSuccess={handleLoginSuccess} />
  );
};
