import React, { useEffect, useState } from "react";
import {
  Modal,
  SidePanel,
  Box,
  RadioGroup,
  InputArea,
  Card,
  Text,
} from "@wix/design-system";
import { Guest, User, SetGuestsList, WeddingDetails } from "../types";
import { MessageGroups } from "./MessageGroups";
import { httpRequests } from "../httpClient";
import WhatsAppPreview from "./WhatsAppPreview";
import "./css/WhatsAppMessage.css";

interface MessageGroupsModalProps {
  setIsMessageGroupsModalOpen: (value: boolean) => void;
  userID: User["userID"];
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
}

export type MessageType = "rsvp" | "reminder" | "freeText" | "weddingReminder";

const MessageGroupsModal: React.FC<MessageGroupsModalProps> = ({
  setIsMessageGroupsModalOpen,
  userID,
  guestsList,
  setGuestsList,
}) => {
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    bride_name: "",
    groom_name: "",
    wedding_date: "2025-01-01",
    hour: "",
    location_name: "",
    additional_information: "",
    waze_link: "",
    gift_link: "",
    thank_you_message: "",
    fileID: "",
  });
  const [imageUrl, setImageUrl] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("rsvp");
  const [customText, setCustomText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    httpRequests.getWeddingInfo(userID).then((weddingInfo) => {
      if (weddingInfo) {
        const { imageURL, ...rest } = weddingInfo;
        const date = weddingInfo.wedding_date;
        setWeddingDetails({
          ...rest,
          wedding_date: date,
        });
        setImageUrl(`${imageURL}?t=${Date.now()}`);
      }
    });
  }, [userID]);

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsMessageGroupsModalOpen(false)}
        height={"auto"}
        maxHeight={"800px"}
        width={"600px"}
      >
        <SidePanel.Header title="Message Groups" />
        <SidePanel.Content>
          <Box direction="vertical">
            <Card>
              <Card.Header title="Select Message Type" />
              <Card.Content>
                <Box direction="vertical" gap={3}>
                  <RadioGroup
                    value={messageType}
                    onChange={(value) => setMessageType(value as MessageType)}
                  >
                    <RadioGroup.Radio value="rsvp">
                      <Box direction="vertical" gap={1}>
                        <Text weight="bold">RSVP Invitation</Text>
                        <Text size="small" secondary>
                          Send the initial wedding invitation with RSVP buttons
                        </Text>
                      </Box>
                    </RadioGroup.Radio>
                    <RadioGroup.Radio value="reminder">
                      <Box direction="vertical" gap={1}>
                        <Text weight="bold">Resend to Pending</Text>
                        <Text size="small" secondary>
                          Send reminder only to guests who haven't responded yet
                        </Text>
                      </Box>
                    </RadioGroup.Radio>
                    <RadioGroup.Radio value="freeText">
                      <Box direction="vertical" gap={1}>
                        <Text weight="bold">Free Text Message</Text>
                        <Text size="small" secondary>
                          Send a custom text message to selected group
                        </Text>
                      </Box>
                    </RadioGroup.Radio>
                    <RadioGroup.Radio value="weddingReminder">
                      <Box direction="vertical" gap={1}>
                        <Text weight="bold">Wedding Reminder</Text>
                        <Text size="small" secondary>
                          Send reminder to confirmed guests on
                          {weddingDetails.reminder_day === "wedding_day"
                            ? "wedding day"
                            : "day before wedding"}
                          at {weddingDetails.reminder_time || "10:00"}
                        </Text>
                      </Box>
                    </RadioGroup.Radio>
                  </RadioGroup>

                  {messageType === "freeText" && (
                    <Box direction="vertical" gap={2}>
                      <Text weight="bold">Custom Message:</Text>
                      <InputArea
                        placeholder="Enter your custom message here..."
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        rows={5}
                      />
                      {(!customText || customText.trim() === "") && (
                        <Text size="small" secondary skin="error">
                          ⚠️ Please enter a message before sending
                        </Text>
                      )}
                    </Box>
                  )}
                </Box>
              </Card.Content>
            </Card>

            <MessageGroups
              guestsList={guestsList}
              setGuestsList={setGuestsList}
              userID={userID}
              messageType={messageType}
              customText={customText}
              isSending={isSending}
              onSendMessage={(group) => {
                setIsSending(true);
                httpRequests
                  .sendMessage(userID, {
                    messageGroup: group,
                    messageType,
                    customText:
                      messageType === "freeText" ? customText : undefined,
                  })
                  .then((response) => {
                    if (response.ok) {
                      alert("✅ Messages sent successfully.");
                      setIsMessageGroupsModalOpen(false);
                    } else {
                      alert("❌ Failed to send messages. Please try again.");
                    }
                  })
                  .catch((error) => {
                    console.error("Error sending messages:", error);
                    alert("Failed to send messages. Please try again.");
                  })
                  .finally(() => {
                    setIsSending(false);
                  });
              }}
            />
            <WhatsAppPreview
              weddingDetails={weddingDetails}
              imageUrl={imageUrl}
              isCollapsible={true}
              showAllMessages={false}
              messageType={messageType}
              customText={customText}
            />
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default MessageGroupsModal;
