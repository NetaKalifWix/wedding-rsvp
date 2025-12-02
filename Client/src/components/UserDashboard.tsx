import React, { useEffect, useState } from "react";

import GuestList from "./GuestList";
import AddGuestModal from "./AddGuestModal";
import ControlPanel from "./ControlPanel";
import InfoModal from "./InfoModal";
import MessageGroupsModal from "./MessageGroupsModal";
import ViewLogsModal from "./ViewLogsModal";
import { SwitchUserModal } from "./SwitchUserModal";
import "@wix/design-system/styles.global.css";
import { Guest, User } from "../types";
import { httpRequests } from "../httpClient";
import { Button, Modal, PopoverMenu } from "@wix/design-system";
import { ChevronDown } from "@wix/wix-ui-icons-common";
import { Check } from "lucide-react";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
type UserDashboardProps = {
  handleLogout: () => void;
  user: User;
  isAdmin: boolean;
  switchUser: (targetUser: User) => void;
};
export const UserDashboard = (props: UserDashboardProps) => {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMessageGroupsModalOpen, setIsMessageGroupsModalOpen] =
    useState(false);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user, handleLogout, isAdmin, switchUser } = props;

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);
    try {
      await httpRequests.fetchData(user.userID, setGuestsList);
      setIsRefreshing(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

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
      <Button size="small" onClick={handleRefresh} loading={isRefreshing}>
        {showSuccess ? <Check size={16} /> : "Refresh"}
      </Button>
      <Button
        size="small"
        priority="secondary"
        onClick={() => setIsViewLogsModalOpen(true)}
        style={{ marginLeft: "10px" }}
      >
        View Logs
      </Button>

      {isAdmin && (
        <Button
          size="small"
          priority="secondary"
          onClick={() => setIsSwitchUserModalOpen(true)}
          style={{
            marginLeft: "10px",
            backgroundColor: "#ff6b35",
            color: "white",
          }}
        >
          Switch User
        </Button>
      )}

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

      <Modal isOpen={isAddGuestModalOpen}>
        <AddGuestModal
          guestsList={guestsList}
          setGuestsList={setGuestsList}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          userID={user.userID}
        />
      </Modal>
      <Modal isOpen={isInfoModalOpen}>
        <InfoModal
          setIsInfoModalOpen={setIsInfoModalOpen}
          userID={user.userID}
        />
      </Modal>

      <Modal isOpen={isMessageGroupsModalOpen}>
        <MessageGroupsModal
          setIsMessageGroupsModalOpen={setIsMessageGroupsModalOpen}
          userID={user.userID}
          guestsList={guestsList}
          setGuestsList={setGuestsList}
        />
      </Modal>

      <Modal isOpen={isViewLogsModalOpen}>
        <ViewLogsModal
          userID={user.userID}
          setIsViewLogsModalOpen={setIsViewLogsModalOpen}
        />
      </Modal>

      <Modal isOpen={isSwitchUserModalOpen}>
        <SwitchUserModal
          isOpen={isSwitchUserModalOpen}
          onClose={() => setIsSwitchUserModalOpen(false)}
          currentUserID={user.userID}
          onSwitchUser={switchUser}
        />
      </Modal>
    </div>
  );
};
