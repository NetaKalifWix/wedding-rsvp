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
import { Button, Loader, Modal, Box } from "@wix/design-system";
import { Check } from "lucide-react";
import Header from "../global/Header";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export const RSVPDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, switchUser } = useAuth();
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
    if (user) {
      const fetchData = async () => {
        const guestsList = await httpRequests.getGuestsList(user.userID);
        setGuestsList(guestsList);
      };
      fetchData();
    }
  }, [user]);

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

  if (!user) {
    return null;
  }
  if (!CLIENT_ID) {
    throw new Error("REACT_APP_GOOGLE_CLIENT_ID is not set in .env file");
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setShowSuccess(false);
    try {
      const guestsList = await httpRequests.getGuestsList(user.userID);
      setGuestsList(guestsList);
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
    <Box direction="vertical" gap="20px" align="center">
      <Header showBackToDashboardButton={true} />

      <h1>ניהול אישורי הגעה</h1>
      <Box direction="horizontal" gap="10px">
        <Button size="small" onClick={handleRefresh}>
          {isRefreshing ? (
            <Loader size="tiny" />
          ) : showSuccess ? (
            <Check size={16} />
          ) : (
            "רענון"
          )}
        </Button>
        <Button
          size="small"
          priority="secondary"
          onClick={() => setIsViewLogsModalOpen(true)}
          style={{ marginLeft: "10px" }}
        >
          צפייה ביומן
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
            החלפת משתמש
          </Button>
        )}
      </Box>

      <Box direction="horizontal" gap="20px" padding="20px">
        <ControlPanel
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          setGuestsList={setGuestsList}
          guestsList={guestsList}
          setIsInfoModalOpen={setIsInfoModalOpen}
          setIsMessageGroupsModalOpen={setIsMessageGroupsModalOpen}
          userID={user.userID}
        />
      </Box>

      {guestsList.length > 0 ? (
        <GuestList
          userID={user.userID}
          guestsList={guestsList}
          setGuestsList={setGuestsList}
        />
      ) : (
        <Box
          direction="vertical"
          align="center"
          background={"WHITE"}
          padding="20px"
          borderRadius="10px"
          gap="20px"
        >
          <h3>אין אורחים ברשימה</h3>
          <Button size="small" onClick={() => setIsAddGuestModalOpen(true)}>
            הוספת אורח
          </Button>
        </Box>
      )}
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
    </Box>
  );
};
