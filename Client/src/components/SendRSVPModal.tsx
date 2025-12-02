import React, { useEffect, useState } from "react";
import { Modal, SidePanel, Box, Text, Button } from "@wix/design-system";
import { Guest, User, SetGuestsList, WeddingDetails } from "../types";
import { httpRequests } from "../httpClient";
import WhatsAppPreview from "./WhatsAppPreview";
import "./css/WhatsAppMessage.css";

interface SendRSVPModalProps {
  setIsSendRSVPModalOpen: (value: boolean) => void;
  userID: User["userID"];
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
}

const SendRSVPModal: React.FC<SendRSVPModalProps> = ({
  setIsSendRSVPModalOpen,
  userID,
  guestsList,
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

  const handleSendRSVP = () => {
    httpRequests
      .sendMessage(userID)
      .then((response) => {
        if (response.ok) {
          setIsSendRSVPModalOpen(false);
          alert("RSVP sent successfully!");
        } else {
          alert("Failed to send messages. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error sending messages:", error);
        alert("Failed to send messages. Please try again.");
      });
  };

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsSendRSVPModalOpen(false)}
        height={"auto"}
        maxHeight={"800px"}
        width={"600px"}
      >
        <SidePanel.Header title="Send RSVP" />
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
            <Text>Are you sure you want to send the RSVP?</Text>
            <WhatsAppPreview
              weddingDetails={weddingDetails}
              imageUrl={imageUrl}
              isCollapsible={true}
              showAllMessages={false}
            />
            <Button onClick={handleSendRSVP}>
              Send to {guestsList.length} guests
            </Button>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default SendRSVPModal;
