import React, { useEffect, useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

// import "./App.css";
import GuestList from "../components/GuestList";
import AddGuestModal from "../components/AddGuestModal";
import ControlPanel from "../components/ControlPanel";
import SendMessageModal from "../components/SendMessageModal";
import "@wix/design-system/styles.global.css";
import { Guest } from "../types";
import { httpRequests } from "../httpClient";
import { Button, PopoverMenu } from "@wix/design-system";
import { useAuth } from "../hooks/useAuth";
import { ChevronDown } from "@wix/wix-ui-icons-common";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const HomePage = () => {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isEditMessageModalOpen, setIsSendMessageModalOpen] = useState(false);

  const { user, handleLoginSuccess, handleLogout } = useAuth();

  useEffect(() => {
    if (user) {
      httpRequests.fetchData(user.userID, setGuestsList);
    }
  }, [user]);

  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div className="App">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {user && (
            <div
              style={{
                marginLeft: "auto",
                paddingTop: "20px",
                paddingRight: "20px",
              }}
            >
              <PopoverMenu
                triggerElement={
                  <Button priority="secondary" suffixIcon={<ChevronDown />}>
                    Account
                  </Button>
                }
              >
                <PopoverMenu.MenuItem text="Logout" onClick={handleLogout} />
                <PopoverMenu.MenuItem
                  text="Delete Account"
                  onClick={() => {
                    httpRequests.deleteAllGuests(user.userID, setGuestsList);
                    httpRequests.deleteUser(user.userID);
                    handleLogout();
                  }}
                />
              </PopoverMenu>
            </div>
          )}
          <h1>Wedding RSVP Dashboard</h1>
        </div>

        {user ? (
          <>
            <p>Welcome, {user.name}</p>

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
              onSuccess={(res) => handleLoginSuccess(res, setGuestsList)}
              onError={() => alert("Login Failed")}
            />
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};
