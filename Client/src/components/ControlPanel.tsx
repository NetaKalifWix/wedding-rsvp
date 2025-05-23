import "./css/ControlPanel.css";
import { Card, Button } from "@wix/design-system";
import { httpRequests } from "../httpClient";
import {
  getNumberOfGuests,
  getNumberOfGuestsRSVP,
  getRsvpCounts,
  handleExport,
} from "./logic";
import {
  UserPlus,
  Trash2,
  Send,
  FileSpreadsheet,
  Users,
  Check,
  Clock,
  X,
} from "lucide-react";
import { Guest, User } from "../types";
import React from "react";

interface ControlPanelProps {
  setIsAddGuestModalOpen: (value: boolean) => void;
  setGuestsList: (value: any) => void;
  guestsList: Guest[];
  setIsSendMessageModalOpen: (value: boolean) => void;
  userID: User["userID"];
}
const ControlPanel: React.FC<ControlPanelProps> = ({
  setIsAddGuestModalOpen,
  setGuestsList,
  guestsList,
  setIsSendMessageModalOpen,
  userID,
}) => {
  const rsvpCounts = getRsvpCounts(guestsList);

  return (
    <div
      className="control-panel"
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        padding: "20px",
        flexWrap: "wrap",
      }}
    >
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
              prefixIcon={<Send />}
              onClick={() => setIsSendMessageModalOpen(true)}
              priority="secondary"
            >
              Message
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
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ControlPanel;
