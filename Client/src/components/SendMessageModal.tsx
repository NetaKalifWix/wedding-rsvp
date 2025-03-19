import React, { useState } from "react";
import "./css/SendMessageModal.css";
import { httpRequests } from "../httpClient";
import {
  Checkbox,
  FormField,
  Modal,
  SidePanel,
  Box,
  InputArea,
  Text,
  Button,
} from "@wix/design-system";
import { Check, Clock, Users, X } from "lucide-react";
import { getRsvpCounts } from "./logic";
import { Guest } from "../types";

interface SendMessageModalProps {
  setIsEditMessageModalOpen: (value: boolean) => void;
  guestsList: Guest[];
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  setIsEditMessageModalOpen,
  guestsList,
}) => {
  const [message, setMessage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  console.log(selectedOptions);

  const rsvpCount = getRsvpCounts(guestsList);
  const ddOptions = [
    {
      id: 0,
      prefix: <Users />,
      title: `All (${guestsList.length})`,
      key: "all",
    },
    {
      id: 1,
      prefix: <Check color="green" />,
      title: `Confirmed (${rsvpCount.confirmed})`,
      key: "approved",
    },
    {
      id: 2,
      prefix: <Clock color="orange" />,
      title: `Pending reply (${rsvpCount.pending})`,
      key: "pending",
    },
    {
      id: 3,
      prefix: <X color="red" />,
      title: `Declined (${rsvpCount.declined})`,
      key: "declined",
    },
  ];
  const toggleCheck = (id: number) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const handleSend = () => {
    const whoToSend = ddOptions
      .filter((option) => selectedOptions.includes(option.id))
      .map((option) => option.key);
    if (whoToSend.length === 0) {
      alert("Please select at least one option");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to send messages? This action will send WhatsApp messages to all of the guests."
    );

    if (confirmed) {
      httpRequests.sendMessage(message, whoToSend);
    }
  };

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        width="500px"
        height="600px"
        onCloseButtonClick={() => setIsEditMessageModalOpen(false)}
      >
        <SidePanel.Header title="Send Message" />
        <SidePanel.Content>
          <Box direction="vertical" gap={7}>
            <FormField label="Who to send to">
              <Box direction="vertical">
                {ddOptions.map((option) => (
                  <Checkbox
                    key={option.id}
                    checked={selectedOptions.includes(option.id)}
                    size="small"
                    onChange={() => toggleCheck(option.id)}
                  >
                    <Box gap={2}>
                      {option.prefix}
                      {option.title}
                    </Box>
                  </Checkbox>
                ))}
              </Box>
            </FormField>
            <FormField>
              <Box
                direction="vertical"
                padding="6px"
                border="2px dotted"
                borderColor="D40"
                borderRadius={6}
              >
                <Text size="small">
                  please enter "***" where you want your guest name to appear
                  For example: Dear ***, please RSVP to my wedding. love, Neta
                </Text>
              </Box>
            </FormField>
            <FormField>
              <InputArea
                placeholder="Get people excited about your wedding."
                rows={4}
                maxLength={300}
                hasCounter
                resizable
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </FormField>
            <FormField></FormField>
            <Box align="space-between">
              <Button priority="secondary">cancel</Button>
              <Button disabled={!message} onClick={handleSend}>
                Send
              </Button>
            </Box>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default SendMessageModal;
