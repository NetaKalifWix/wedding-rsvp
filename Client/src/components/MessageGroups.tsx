import React, { useState } from "react";
import { Box, Button, Card, Checkbox, Text } from "@wix/design-system";
import { Guest, SetGuestsList, User } from "../types";
import { httpRequests } from "../httpClient";
import { Send } from "lucide-react";

interface MessageGroupsProps {
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
  userID: User["userID"];
  onSendMessage: (selectedGroup: number) => void;
  messageType?: "rsvp" | "reminder" | "freeText";
  customText?: string;
}
export const maxPerDay = 250;

export const MessageGroups: React.FC<MessageGroupsProps> = ({
  guestsList,
  setGuestsList,
  userID,
  onSendMessage,
  messageType = "rsvp",
  customText = "",
}) => {
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
      await httpRequests.updateGuestsGroups(
        userID,
        updatedGuests,
        setGuestsList,
        guestsList
      );
    } catch (error) {
      console.error("Error assigning groups:", error);
    }
  };

  // Get guests in the selected group
  const getGuestsInGroup = (group: number | undefined) => {
    if (!group) return [];
    let guests = guestsList.filter((guest) => guest.messageGroup === group);

    // Filter by RSVP status for reminder messages
    if (messageType === "reminder") {
      guests = guests.filter(
        (guest) => guest.RSVP === null || guest.RSVP === undefined
      );
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
      <Card.Header
        title="Message Groups"
        suffix={
          <Button onClick={assignGroups} priority="secondary">
            Auto-Assign Groups
          </Button>
        }
      />
      <Card.Content>
        <Box direction="vertical" gap={3}>
          <Text>
            Divide guests into groups to stay within the 250 daily message
            limit.
          </Text>
          {messageType === "reminder" && (
            <Card>
              <Card.Content>
                <Text size="small" secondary>
                  ℹ️ Reminder mode: Only pending guests (who haven't responded)
                  will receive messages.
                </Text>
              </Card.Content>
            </Card>
          )}
          {messageType === "freeText" && (
            <Card>
              <Card.Content>
                <Text size="small" secondary>
                  ℹ️ Custom text mode: All guests in the selected group will
                  receive your custom message.
                </Text>
              </Card.Content>
            </Card>
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
                  Group {group} ({getGuestsInGroup(group).length} guests)
                </Checkbox>
              </Box>
            ))}
          </Box>

          {selectedGroup && (
            <Box>
              <Text weight="bold">
                Group {selectedGroup}: {getGuestsInGroup(selectedGroup).length}{" "}
                {messageType === "reminder" ? "pending guests" : "guests"}
              </Text>
            </Box>
          )}
          <Button
            disabled={
              !selectedGroup ||
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
            prefixIcon={<Send size={16} />}
          >
            {messageType === "reminder"
              ? `Send Reminders to Group ${selectedGroup}`
              : messageType === "freeText"
              ? `Send Custom Message to Group ${selectedGroup}`
              : `Send to Group ${selectedGroup}`}
          </Button>
        </Box>
      </Card.Content>
    </Card>
  );
};
