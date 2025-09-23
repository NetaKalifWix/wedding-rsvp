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
}
export const maxPerDay = 250;

export const MessageGroups: React.FC<MessageGroupsProps> = ({
  guestsList,
  setGuestsList,
  userID,
  onSendMessage,
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
    return guestsList.filter((guest) => guest.messageGroup === group);
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
                guests
              </Text>
            </Box>
          )}
          <Button
            disabled={
              !selectedGroup ||
              getGuestsInGroup(selectedGroup).length === 0 ||
              getGuestsInGroup(selectedGroup).length > maxPerDay
            }
            onClick={() => {
              if (selectedGroup) {
                onSendMessage(selectedGroup);
              }
            }}
            prefixIcon={<Send size={16} />}
          >
            Send to Group {selectedGroup}
          </Button>
        </Box>
      </Card.Content>
    </Card>
  );
};
