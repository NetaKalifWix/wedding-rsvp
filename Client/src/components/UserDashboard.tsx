import React, { useEffect, useState } from "react";

import GuestList from "./GuestList";
import AddGuestModal from "./AddGuestModal";
import ControlPanel from "./ControlPanel";
import InfoModal from "./InfoModal";
import MessageGroupsModal from "./MessageGroupsModal";
import "@wix/design-system/styles.global.css";
import { Guest, User } from "../types";
import { httpRequests } from "../httpClient";
import { Button, PopoverMenu } from "@wix/design-system";
import { ChevronDown } from "@wix/wix-ui-icons-common";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
type UserDashboardProps = {
  handleLogout: () => void;
  user: User;
};
export const UserDashboard = (props: UserDashboardProps) => {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMessageGroupsModalOpen, setIsMessageGroupsModalOpen] =
    useState(false);
  const { user, handleLogout } = props;

  useEffect(() => {
    if (user) {
      httpRequests.fetchData(user.userID, setGuestsList);
    }
  }, [user]);
  if (!user) {
    return <></>;
  }
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  return (
    <div className="App">
      <div
        style={{
          marginLeft: "auto",
          paddingTop: "20px",
          paddingRight: "20px",
          display: "table",
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
            onClick={async () => {
              try {
                await httpRequests.deleteAllGuests(user.userID, setGuestsList);
                await httpRequests.deleteUser(user.userID);
                handleLogout();
              } catch (error) {
                console.error("Error deleting account:", error);
              }
            }}
          />
        </PopoverMenu>
      </div>

      <h1>Wedding RSVP Dashboard</h1>
      <Button
        size="small"
        onClick={() => httpRequests.fetchData(user.userID, setGuestsList)}
      >
        Refresh
      </Button>

      <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
        <ControlPanel
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          setGuestsList={setGuestsList}
          guestsList={guestsList}
          setIsInfoModalOpen={setIsInfoModalOpen}
          setIsMessageGroupsModalOpen={setIsMessageGroupsModalOpen}
          userID={user.userID}
        />
      </div>

      <GuestList
        userID={user.userID}
        guestsList={guestsList}
        setGuestsList={setGuestsList}
      />

      {isAddGuestModalOpen && (
        <AddGuestModal
          setGuestsList={setGuestsList}
          guestsList={guestsList}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          userID={user.userID}
        />
      )}

      {isInfoModalOpen && (
        <InfoModal
          setIsInfoModalOpen={setIsInfoModalOpen}
          userID={user.userID}
        />
      )}

      {isMessageGroupsModalOpen && (
        <MessageGroupsModal
          setIsMessageGroupsModalOpen={setIsMessageGroupsModalOpen}
          userID={user.userID}
          guestsList={guestsList}
          setGuestsList={setGuestsList}
        />
      )}
    </div>
  );
};
