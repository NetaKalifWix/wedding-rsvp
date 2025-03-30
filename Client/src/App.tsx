import React, { useEffect, useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  googleLogout,
} from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

import "./App.css";
import GuestList from "./components/GuestList";
import AddGuestModal from "./components/AddGuestModal";
import ControlPanel from "./components/ControlPanel";
import SendMessageModal from "./components/SendMessageModal";
import "@wix/design-system/styles.global.css";
import { Guest, User } from "./types";
import { httpRequests } from "./httpClient";
import { Button } from "@wix/design-system";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Replace with your actual Google Client ID

function App() {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isEditMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    user && httpRequests.fetchData(user?.userID, setGuestsList);
  }, [user]);
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  const handleLoginSuccess = (response: any) => {
    const decoded: any = jwtDecode(response.credential);

    setUser({
      name: decoded.name,
      email: decoded.email,
      userID: decoded.sub,
    });

    httpRequests.addUser(
      {
        name: decoded.name,
        email: decoded.email,
        userID: decoded.sub,
      },
      setGuestsList
    );
  };

  const handleLogout = () => {
    googleLogout();
    setUser(undefined);
  };

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="App">
        <h1 style={{ padding: "20px" }}>Wedding RSVP Dashboard</h1>

        {user ? (
          <>
            <div>
              <p>Welcome, {user.name}</p>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
            {isAddGuestModalOpen && (
              <AddGuestModal
                userID={user?.userID}
                setGuestsList={setGuestsList}
                setIsAddGuestModalOpen={setIsAddGuestModalOpen}
                guestsList={guestsList}
              />
            )}

            {isEditMessageModalOpen && (
              <SendMessageModal
                userID={user?.userID}
                setIsSendMessageModalOpen={setIsSendMessageModalOpen}
                guestsList={guestsList}
              />
            )}

            <ControlPanel
              userID={user.userID}
              setIsAddGuestModalOpen={setIsAddGuestModalOpen}
              setGuestsList={setGuestsList}
              guestsList={guestsList}
              setIsSendMessageModalOpen={setIsSendMessageModalOpen}
            />

            <GuestList
              userID={user.userID}
              guestsList={guestsList}
              setGuestsList={setGuestsList}
            />
          </>
        ) : (
          <div className="google-login-container">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Login Failed")}
            />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
