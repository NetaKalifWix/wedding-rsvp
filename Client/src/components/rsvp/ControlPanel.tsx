import "./css/ControlPanel.css";
import { Card, Button, Box } from "@wix/design-system";
import { httpRequests } from "../../httpClient";
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
  Check,
  Clock,
  X,
  MessageSquare,
} from "lucide-react";
import { Guest, User } from "../../types";
import React from "react";
import { Edit } from "@wix/wix-ui-icons-common";

interface ControlPanelProps {
  setIsAddGuestModalOpen: (value: boolean) => void;
  setIsInfoModalOpen: (value: boolean) => void;
  setIsMessageGroupsModalOpen: (value: boolean) => void;
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
  userID,
}) => {
  const rsvpCounts = getRsvpCounts(guestsList);

  return (
    <div className="control-panel">
      <Card>
        <Card.Header title="ספירת אורחים" />
        <Card.Content>
          <Box gap="16px" className="guest-summary">
            <Box direction="vertical" gap="4px">
              <span>סה״כ מוזמנים</span>
              <span className="pending">{getNumberOfGuests(guestsList)}</span>
            </Box>

            <Box direction="vertical" gap="4px">
              <span>סה״כ אישרו</span>
              <span className="confirmed">
                {getNumberOfGuestsRSVP(guestsList)}
              </span>
            </Box>

            <Box direction="vertical" gap="4px">
              <span>סה״כ סירבו</span>
              <span className="declined">
                {getNumberOfGuestsDeclined(guestsList)}
              </span>
            </Box>
          </Box>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="שיעורי תגובה נוכחיים"></Card.Header>
        <Card.Content>
          <div className="rsvp-summary">
            <Box
              direction="horizontal"
              verticalAlign="middle"
              className="confirmed"
              gap="8px"
            >
              <Check />
              <span>אישרו</span>
              <span>{rsvpCounts.confirmed}</span>
            </Box>

            <Box
              direction="horizontal"
              verticalAlign="middle"
              className="pending"
              gap="8px"
            >
              <Clock />
              <span>ממתינים</span>
              <span>{rsvpCounts.pending}</span>
            </Box>

            <Box
              direction="horizontal"
              verticalAlign="middle"
              className="declined"
              gap="8px"
            >
              <X />
              <span>סירבו</span>
              <span>{rsvpCounts.declined}</span>
            </Box>
          </div>
        </Card.Content>
      </Card>
      <Card>
        <Card.Header title="פעולות מהירות"></Card.Header>
        <Card.Content>
          <div className="quick-actions">
            <Button
              onClick={() => setIsAddGuestModalOpen(true)}
              priority="secondary"
            >
              <UserPlus />
              <span style={{ marginRight: "8px" }}>הוספה</span>
            </Button>
            <Button
              onClick={() => setIsInfoModalOpen(true)}
              priority="secondary"
            >
              <Edit />
              <span style={{ marginRight: "8px" }}>עריכת פרטים</span>
            </Button>

            <Button
              onClick={() => handleExport(guestsList)}
              priority="secondary"
            >
              <FileSpreadsheet />
              <span style={{ marginRight: "8px" }}>ייצוא</span>
            </Button>
            <Button
              onClick={async () => {
                const confirmed = window.confirm(
                  "האם אתם בטוחים שברצונכם לאפס את רשימת האורחים? פעולה זו תמחק את כל האורחים"
                );
                if (confirmed) {
                  const updatedGuestsList = await httpRequests.deleteAllGuests(
                    userID
                  );
                  setGuestsList(updatedGuestsList);
                }
              }}
              priority="secondary"
            >
              <Trash2 />
              <span style={{ marginRight: "8px" }}>מחיקת הכל</span>
            </Button>
            <Button
              onClick={async () => {
                const info = await httpRequests.getWeddingInfo(userID);
                if (info) {
                  setIsMessageGroupsModalOpen(true);
                } else {
                  alert(
                    "לא נמצאו פרטי חתונה. אנא הוסיפו פרטי חתונה לפני שליחת הודעות."
                  );
                }
              }}
              priority="secondary"
            >
              <MessageSquare />
              <span style={{ marginRight: "8px" }}>שליחת הודעות</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ControlPanel;
