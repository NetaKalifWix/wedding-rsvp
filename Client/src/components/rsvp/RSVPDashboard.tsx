import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import GuestList from "./GuestList";
import AddGuestModal from "./AddGuestModal";
import ControlPanel from "./ControlPanel";
import InfoModal from "./InfoModal";
import MessageGroupsModal from "./MessageGroupsModal";
import ViewLogsModal from "./ViewLogsModal";
import { SwitchUserModal } from "./SwitchUserModal";
import "@wix/design-system/styles.global.css";
import { Guest } from "../../types";
import { httpRequests } from "../../httpClient";
import { useAuth } from "../../hooks/useAuth";
import { Button, Modal } from "@wix/design-system";
import { Check } from "lucide-react";
import Header from "../global/Header";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const RSVPDashboard = () => {
  const navigate = useNavigate();
  const { user, effectiveUserID, isAdmin, isLoading, switchUser } = useAuth();
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isMessageGroupsModalOpen, setIsMessageGroupsModalOpen] =
    useState(false);
  const [isViewLogsModalOpen, setIsViewLogsModalOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (effectiveUserID) {
      httpRequests.fetchData(effectiveUserID, setGuestsList);
    }
  }, [effectiveUserID]);

  useEffect(() => {
    // Only redirect after loading is complete and user is not logged in
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  // Show nothing while checking auth
  if (isLoading) {
    return null;
  }

  if (!user || !effectiveUserID) {
    return null;
  }
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);
    try {
      await httpRequests.fetchData(effectiveUserID, setGuestsList);
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
    <div>
      <Header showBackToDashboardButton={true} />

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
          userID={effectiveUserID}
        />
      </div>

      <GuestList
        userID={effectiveUserID}
        guestsList={guestsList}
        setGuestsList={setGuestsList}
      />

      <Modal isOpen={isAddGuestModalOpen}>
        <AddGuestModal
          guestsList={guestsList}
          setGuestsList={setGuestsList}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          userID={effectiveUserID}
        />
      </Modal>
      <Modal isOpen={isInfoModalOpen}>
        <InfoModal
          setIsInfoModalOpen={setIsInfoModalOpen}
          userID={effectiveUserID}
        />
      </Modal>

      <Modal isOpen={isMessageGroupsModalOpen}>
        <MessageGroupsModal
          setIsMessageGroupsModalOpen={setIsMessageGroupsModalOpen}
          userID={effectiveUserID}
          guestsList={guestsList}
          setGuestsList={setGuestsList}
        />
      </Modal>

      <Modal isOpen={isViewLogsModalOpen}>
        <ViewLogsModal
          userID={effectiveUserID}
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
