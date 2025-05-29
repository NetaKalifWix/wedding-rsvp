import React, { useEffect, useState } from "react";
import { Modal, SidePanel, Box, Text } from "@wix/design-system";
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

const MessageGroupsModal: React.FC<MessageGroupsModalProps> = ({
  setIsMessageGroupsModalOpen,
  userID,
  guestsList,
  setGuestsList,
}) => {
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    bride_name: "",
    groom_name: "",
    wedding_date: "",
    hour: "",
    location_name: "",
    additional_information: "",
    waze_link: "",
    gift_link: "",
    thank_you_message: "",
    fileID: "",
  });
  const [imageUrl, setImageUrl] = useState("");

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
        height={"800px"}
        width={"800px"}
      >
        <SidePanel.Header title="Message Groups" />
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
            <Text>
              Divide guests into groups to stay within the 250 daily message
              limit.
            </Text>
            <MessageGroups
              guestsList={guestsList}
              setGuestsList={setGuestsList}
              userID={userID}
              onSendMessage={(group) => {
                httpRequests.sendMessage(userID, group);
              }}
            />
            <WhatsAppPreview
              weddingDetails={weddingDetails}
              imageUrl={imageUrl}
              isCollapsible={true}
              showAllMessages={false}
            />
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default MessageGroupsModal;
