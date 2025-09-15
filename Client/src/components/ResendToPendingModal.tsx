import React, { useState } from "react";
import {
  Modal,
  SidePanel,
  Box,
  Text,
  Button,
  RadioGroup,
  Card,
} from "@wix/design-system";
import { Guest, User } from "../types";
import { httpRequests } from "../httpClient";
import { Send, Users } from "lucide-react";

interface ResendToPendingModalProps {
  setIsResendToPendingModalOpen: (value: boolean) => void;
  userID: User["userID"];
  guestsList: Guest[];
}

const ResendToPendingModal: React.FC<ResendToPendingModalProps> = ({
  setIsResendToPendingModalOpen,
  userID,
  guestsList,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Get all available groups
  const getAvailableGroups = () => {
    const groups = new Set(
      guestsList.map((guest) => guest.messageGroup).filter(Boolean)
    );
    return Array.from(groups).sort((a, b) => (a || 0) - (b || 0));
  };

  // Get pending guests for a specific group or all
  const getPendingGuests = (groupNumber?: number) => {
    const pendingGuests = guestsList.filter(
      (guest) => guest.RSVP === null || guest.RSVP === undefined
    );

    if (groupNumber === undefined) {
      return pendingGuests;
    }

    return pendingGuests.filter((guest) => guest.messageGroup === groupNumber);
  };

  const availableGroups = getAvailableGroups();
  const allPendingGuests = getPendingGuests();

  const handleSendReminder = async () => {
    setIsLoading(true);

    try {
      const groupNumber =
        selectedOption === "all" ? undefined : parseInt(selectedOption);

      const response = await httpRequests.sendReminder(userID, groupNumber);

      if (response.ok) {
        alert("Reminders sent successfully!");
        setIsResendToPendingModalOpen(false);
      } else {
        alert("Failed to send reminders. Please try again.");
      }
    } catch (error) {
      console.error("Error sending reminders:", error);
      alert("Failed to send reminders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getGuestCountText = () => {
    if (selectedOption === "all") {
      return `${allPendingGuests.length} pending guests`;
    }

    const groupNumber = parseInt(selectedOption);
    const groupPendingGuests = getPendingGuests(groupNumber);
    return `${groupPendingGuests.length} pending guests in group ${groupNumber}`;
  };

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsResendToPendingModalOpen(false)}
        height="auto"
        maxHeight="600px"
        width="500px"
      >
        <SidePanel.Header title="Resend Reminders" />
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
            <Text>
              Select which group you want to send reminder messages to. Only
              pending guests will receive reminders.
            </Text>

            <Card>
              <Card.Content>
                <RadioGroup
                  value={selectedOption}
                  onChange={(value) => setSelectedOption(value as string)}
                  name="groupSelection"
                >
                  <RadioGroup.Radio value="all">
                    <Box align="space-between" width="100%">
                      <Box gap={2} align="center">
                        <Users size={16} />
                        <Text>All Groups</Text>
                      </Box>
                      <Text size="small" secondary>
                        {allPendingGuests.length} pending guests
                      </Text>
                    </Box>
                  </RadioGroup.Radio>

                  {availableGroups.map((groupNumber) => {
                    const groupPendingGuests = getPendingGuests(groupNumber);
                    return (
                      <RadioGroup.Radio
                        key={groupNumber}
                        value={groupNumber!.toString()}
                      >
                        <Box align="space-between" width="100%">
                          <Box gap={2} align="center">
                            <Users size={16} />
                            <Text>Group {groupNumber}</Text>
                          </Box>
                          <Text size="small" secondary>
                            {groupPendingGuests.length} pending guests
                          </Text>
                        </Box>
                      </RadioGroup.Radio>
                    );
                  })}
                </RadioGroup>
              </Card.Content>
            </Card>

            {allPendingGuests.length === 0 ? (
              <Card>
                <Card.Content>
                  <Text align="center" secondary>
                    No pending guests found. All guests have already responded.
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <Box gap={3} align="center">
                <Text size="small" secondary>
                  Will send to: {getGuestCountText()}
                </Text>
                <Button
                  prefixIcon={<Send />}
                  onClick={handleSendReminder}
                  disabled={isLoading || allPendingGuests.length === 0}
                  priority="primary"
                >
                  {isLoading ? "Sending..." : "Send Reminders"}
                </Button>
              </Box>
            )}
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default ResendToPendingModal;
