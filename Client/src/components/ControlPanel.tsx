import "./css/ControlPanel.css";
import { Card, Button } from "@wix/design-system";
import { httpRequests } from "../httpClient";
import {
  getNumberOfGuests,
  getNumberOfGuestsDeclined,
  getNumberOfGuestsRSVP,
  getRsvpCounts,
  handleExport,
} from "./logic";
import {
  UserPlus,
  Trash2,
  FileSpreadsheet,
  Users,
  Check,
  Clock,
  X,
  MessageSquare,
} from "lucide-react";
import { Guest, User } from "../types";
import React from "react";
import { Edit, Send } from "@wix/wix-ui-icons-common";

interface ControlPanelProps {
  setIsAddGuestModalOpen: (value: boolean) => void;
  setIsInfoModalOpen: (value: boolean) => void;
  setIsMessageGroupsModalOpen: (value: boolean) => void;
  setIsSendRSVPModalOpen: (value: boolean) => void;
  setIsResendToPendingModalOpen: (value: boolean) => void;
  setGuestsList: (value: any) => void;
  guestsList: Guest[];
  userID: User["userID"];
}
const ControlPanel: React.FC<ControlPanelProps> = ({
  setIsAddGuestModalOpen,
  setGuestsList,
  guestsList,
  setIsInfoModalOpen,
  setIsMessageGroupsModalOpen,
  setIsSendRSVPModalOpen,
  setIsResendToPendingModalOpen,
  userID,
}) => {
  const rsvpCounts = getRsvpCounts(guestsList);

  const handleResendToPending = async () => {
    const info = await httpRequests.getWeddingInfo(userID);
    if (info) {
      setIsResendToPendingModalOpen(true);
    } else {
      alert(
        "No wedding info found. Please add wedding info before sending reminders."
      );
    }
  };

  return (
    <div className="control-panel">
      <Card>
        <Card.Header title="Guests Count" />
        <Card.Content>
          <div className="guest-summary">
            <div className="guest-summary-item">
              <span className="summary-label">Total Invited</span>
              <div className="guest-count">
                <Users className="guest-icon" />
                <span>{getNumberOfGuests(guestsList)}</span>
              </div>
            </div>

            <div className="guest-summary-item">
              <span className="summary-label">Total RSVP</span>
              <div className="guest-count">
                <Users className="guest-icon" />
                <span>{getNumberOfGuestsRSVP(guestsList)}</span>
              </div>
            </div>
            <div className="guest-summary-item">
              <span className="summary-label">Total Declined</span>
              <div className="guest-count">
                <Users className="guest-icon" />
                <span>{getNumberOfGuestsDeclined(guestsList)}</span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="Current Response Rates"></Card.Header>
        <Card.Content>
          <div className="rsvp-summary">
            <div className="rsvp-status confirmed">
              <div className="status-label">
                <Check className="status-icon" />
                <span>Confirmed</span>
              </div>
              <span className="status-count">{rsvpCounts.confirmed}</span>
            </div>

            <div className="rsvp-status pending">
              <div className="status-label">
                <Clock className="status-icon" />
                <span>Pending</span>
              </div>
              <span className="status-count">{rsvpCounts.pending}</span>
            </div>

            <div className="rsvp-status declined">
              <div className="status-label">
                <X className="status-icon" />
                <span>Declined</span>
              </div>
              <span className="status-count">{rsvpCounts.declined}</span>
            </div>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="Quick Actions"></Card.Header>
        <Card.Content>
          <div className="quick-actions">
            <Button
              prefixIcon={<UserPlus />}
              onClick={() => setIsAddGuestModalOpen(true)}
              priority="secondary"
            >
              Add
            </Button>
            <Button
              prefixIcon={<Edit />}
              onClick={() => setIsInfoModalOpen(true)}
              priority="secondary"
            >
              Edit Info
            </Button>

            <Button
              prefixIcon={<FileSpreadsheet />}
              onClick={() => handleExport(guestsList)}
              priority="secondary"
            >
              Export
            </Button>
            <Button
              prefixIcon={<Trash2 />}
              onClick={() =>
                httpRequests.deleteAllGuests(userID, setGuestsList)
              }
              priority="secondary"
            >
              Remove All
            </Button>
            <Button
                prefixIcon={<MessageSquare />}
                onClick={async () => {
                  const info = await httpRequests.getWeddingInfo(userID);
                  if (info) {
                    setIsSendRSVPModalOpen(true);
                  } else {
                    alert(
                      "No wedding info found. Please add wedding info before sending message groups."
                    );
                  }
                }}
                priority="secondary"
              >
                Send RSVP
            </Button>
            <Button
                prefixIcon={<MessageSquare />}
                onClick={async () => {
                  const info = await httpRequests.getWeddingInfo(userID);
                  if (info) {
                    setIsMessageGroupsModalOpen(true);
                  } else {
                    alert(
                      "No wedding info found. Please add wedding info before sending message groups."
                    );
                  }
                }}
                priority="secondary"
              >
                Message Groups
            </Button>
            <Button
              prefixIcon={<Send />}
              onClick={handleResendToPending}
              priority="secondary"
            >
              Resend To Pending
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ControlPanel;
