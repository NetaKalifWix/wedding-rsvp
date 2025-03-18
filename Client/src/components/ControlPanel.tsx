import "./css/ControlPanel.css";
import { Card, Button } from "@wix/design-system";
import { handleDeleteAllGuests } from "./httpClient";
import { getRsvpCounts, handleExport } from "./logic";
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
import { Guest } from "../types";
import React from "react";

interface ControlPanelProps {
  setIsAddGuestModalOpen: (value: boolean) => void;
  url: string;
  setGuestsList: (value: any) => void;
  guestsList: Guest[];
  setIsEditMessageModalOpen: (value: boolean) => void;
}
const ControlPanel: React.FC<ControlPanelProps> = ({
  setIsAddGuestModalOpen,
  url,
  setGuestsList,
  guestsList,
  setIsEditMessageModalOpen,
}) => {
  const rsvpCounts = getRsvpCounts(guestsList);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        padding: "20px",
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
                <span>{guestsList.length}</span>
              </div>
            </div>

            <div className="guest-summary-item">
              <span className="summary-label">Total RSVP</span>
              <div className="guest-count">
                <Users className="guest-icon" />
                <span>
                  {guestsList.reduce(
                    (total, guest) => (guest.RSVP ? total + guest.RSVP : total),
                    0
                  )}
                </span>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="Current response rates"></Card.Header>
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
          <div
            style={{
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <Button
              prefixIcon={<UserPlus />}
              onClick={() => setIsAddGuestModalOpen(true)}
            >
              Add
            </Button>
            <Button
              prefixIcon={<Send />}
              onClick={() => setIsEditMessageModalOpen(true)}
            >
              Message
            </Button>
            <Button
              prefixIcon={<FileSpreadsheet />}
              onClick={() => handleExport(guestsList)}
            >
              Export
            </Button>
            <Button
              prefixIcon={<Trash2 />}
              onClick={() => handleDeleteAllGuests(url, setGuestsList)}
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
