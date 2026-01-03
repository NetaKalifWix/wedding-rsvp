import React, { useState } from "react";
import { Box, Button, Card, Checkbox, Text } from "@wix/design-system";
import { Guest, SetGuestsList, User, WeddingDetails } from "../../types";
import { httpRequests } from "../../httpClient";
import { Send, Loader2 } from "lucide-react";
import { MessageType } from "./MessageGroupsModal";

interface MessageGroupsProps {
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
  userID: User["userID"];
  onSendMessage: (selectedGroup: number) => void;
  messageType?: MessageType;
  customText?: string;
  isSending?: boolean;
  weddingDetails: WeddingDetails;
}

// Check if all required wedding details are filled
const isWeddingDetailsComplete = (details: WeddingDetails): boolean => {
  const requiredFields: (keyof WeddingDetails)[] = [
    "bride_name",
    "groom_name",
    "wedding_date",
    "hour",
    "location_name",
    "waze_link",
    "fileID",
  ];

  return requiredFields.every((field) => {
    const value = details[field];
    return (
      value !== undefined && value !== null && value.toString().trim() !== ""
    );
  });
};
export const maxPerDay = 250;

export const MessageGroups: React.FC<MessageGroupsProps> = ({
  guestsList,
  setGuestsList,
  userID,
  onSendMessage,
  messageType = "rsvp",
  customText = "",
  isSending = false,
  weddingDetails,
}) => {
  const weddingDetailsComplete = isWeddingDetailsComplete(weddingDetails);
  const [selectedGroup, setSelectedGroup] = useState<number | undefined>(
    undefined
  );

  // Automatically assign guests to groups
  const assignGroups = async () => {
    // Group guests by who invited them
    const guestsByInviter = guestsList.reduce((acc, guest) => {
      if (!acc[guest.whose]) {
        acc[guest.whose] = [];
      }
      acc[guest.whose].push(guest);
      return acc;
    }, {} as Record<string, Guest[]>);

    // Sort inviters by number of guests (descending) to optimize group distribution
    const sortedInviters = Object.entries(guestsByInviter).sort(
      ([, guestsA], [, guestsB]) => guestsB.length - guestsA.length
    );

    // Initialize groups
    const groups: Guest[][] = [[]];
    let currentGroupSize = 0;
    let currentGroupIndex = 0;

    // Distribute guests by inviter
    for (const [, inviterGuests] of sortedInviters) {
      // If adding these guests would exceed the limit, start a new group
      if (currentGroupSize + inviterGuests.length > maxPerDay) {
        currentGroupIndex++;
        groups[currentGroupIndex] = [];
        currentGroupSize = 0;
      }

      // Add all guests from this inviter to the current group
      groups[currentGroupIndex].push(...inviterGuests);
      currentGroupSize += inviterGuests.length;
    }

    // Create final guest list with assigned groups
    const updatedGuests = guestsList.map((guest) => {
      // Find which group contains this guest
      const groupIndex = groups.findIndex((group) =>
        group.some((g) => g.name === guest.name && g.phone === guest.phone)
      );
      return {
        ...guest,
        messageGroup: groupIndex + 1, // Groups are 1-indexed
      };
    });

    try {
      const updatedGuestsList = await httpRequests.updateGuestsGroups(
        userID,
        updatedGuests,
        guestsList
      );
      setGuestsList(updatedGuestsList);
    } catch (error) {
      console.error("Error assigning groups:", error);
    }
  };

  // Get guests in the selected group
  const getGuestsInGroup = (group: number | undefined) => {
    if (!group) return [];
    let guests = guestsList.filter((guest) => guest.messageGroup === group);

    // Filter by RSVP status for reminder messages
    if (messageType === "rsvpReminder") {
      guests = guests.filter(
        (guest) => guest.RSVP === null || guest.RSVP === undefined
      );
    }

    // Filter for confirmed guests only (wedding reminder)
    if (messageType === "weddingReminder") {
      guests = guests.filter((guest) => guest.RSVP && guest.RSVP > 0);
    }

    return guests;
  };

  // Get all available groups
  const getAvailableGroups = () => {
    const groups = new Set(
      guestsList.map((guest) => guest.messageGroup).filter(Boolean)
    );
    return Array.from(groups).sort((a, b) => (a || 0) - (b || 0));
  };

  const availableGroups = getAvailableGroups();

  return (
    <Card>
      <Card.Content>
        <Box direction="vertical" gap={2}>
          <Text>חלקו אורחים לקבוצות כדי להישאר במגבלת 250 ההודעות היומית.</Text>
          <Button dataHook="hello" onClick={assignGroups} priority="secondary">
            שיוך אוטומטי לקבוצות
          </Button>
          {messageType === "rsvpReminder" && (
            <Box direction="vertical" gap={2}>
              <Text size="small" secondary>
                ℹ️ מצב תזכורת: רק אורחים ממתינים (שלא הגיבו) יקבלו הודעות.
              </Text>
            </Box>
          )}
          {messageType === "freeText" && (
            <Text size="small" secondary>
              ℹ️ מצב טקסט חופשי: כל האורחים בקבוצה הנבחרת יקבלו את ההודעה
              המותאמת שלכם.
            </Text>
          )}
          {messageType === "weddingReminder" && (
            <Text size="small" secondary>
              ℹ️ מצב תזכורת לחתונה: רק אורחים שאישרו הגעה יקבלו הודעות.
            </Text>
          )}
          <Box direction="vertical" gap={2}>
            {availableGroups.map((group) => (
              <Box direction="horizontal" gap={2}>
                <Checkbox
                  key={group}
                  checked={selectedGroup === group}
                  onChange={() =>
                    setSelectedGroup(
                      selectedGroup === group ? undefined : group
                    )
                  }
                >
                  קבוצה {group} ({getGuestsInGroup(group).length} אורחים)
                </Checkbox>
              </Box>
            ))}
          </Box>

          {selectedGroup && (
            <Box>
              <Text weight="bold">
                קבוצה {selectedGroup}: {getGuestsInGroup(selectedGroup).length}{" "}
                {messageType === "rsvpReminder"
                  ? "אורחים ממתינים"
                  : messageType === "weddingReminder"
                  ? "אורחים שאישרו"
                  : "אורחים"}
              </Text>
            </Box>
          )}
          {!weddingDetailsComplete && (
            <Text size="small" skin="error">
              ⚠️ אנא מלאו את כל פרטי החתונה לפני שליחת הודעות (שמות כלה/חתן,
              תאריך, שעה, מיקום, קישור לוויז ותמונה).
            </Text>
          )}
          <Button
            disabled={
              isSending ||
              !selectedGroup ||
              !weddingDetailsComplete ||
              getGuestsInGroup(selectedGroup).length === 0 ||
              getGuestsInGroup(selectedGroup).length > maxPerDay ||
              (messageType === "freeText" &&
                (!customText || customText.trim() === ""))
            }
            onClick={() => {
              if (selectedGroup) {
                onSendMessage(selectedGroup);
              }
            }}
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            <span style={{ marginRight: "8px" }}>
              {isSending
                ? "שולח..."
                : !selectedGroup
                ? "בחר קבוצה"
                : messageType === "rsvpReminder"
                ? `שליחת תזכורות לקבוצה ${selectedGroup}`
                : messageType === "freeText"
                ? `שליחת הודעה מותאמת לקבוצה ${selectedGroup}`
                : messageType === "weddingReminder"
                ? `שליחת תזכורת חתונה לקבוצה ${selectedGroup}`
                : selectedGroup
                ? `שליחה לקבוצה ${selectedGroup}`
                : "בחר קבוצה"}
            </span>
          </Button>
        </Box>
      </Card.Content>
    </Card>
  );
};
