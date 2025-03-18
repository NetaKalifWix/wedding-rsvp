import "./css/TopBar.css";
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
        <Card.Header title="Total Guests" />
        <Card.Content>
          <div>
            <Users />
            <span>{guestsList.length}</span>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="Current response rates"></Card.Header>
        <Card.Content>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <div className="flex items-center text-emerald-600">
                <Check className="h-4 w-4 mr-1" />
                <span className="text-sm">Confirmed</span>
              </div>
              <span className="text-2xl font-semibold">
                {rsvpCounts.confirmed}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-amber-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="text-2xl font-semibold">
                {rsvpCounts.pending}
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center text-rose-600">
                <X className="h-4 w-4 mr-1" />
                <span className="text-sm">Declined</span>
              </div>
              <span className="text-2xl font-semibold">
                {rsvpCounts.declined}
              </span>
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
            <Button onClick={() => setIsAddGuestModalOpen(true)}>
              <UserPlus />
              Add
            </Button>
            <Button onClick={() => setIsEditMessageModalOpen(true)}>
              <Send />
              Message
            </Button>
            <Button onClick={() => handleExport(guestsList)}>
              <FileSpreadsheet />
              Export
            </Button>
            <Button onClick={() => handleDeleteAllGuests(url, setGuestsList)}>
              <Trash2 />
              remove all guests
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ControlPanel;
