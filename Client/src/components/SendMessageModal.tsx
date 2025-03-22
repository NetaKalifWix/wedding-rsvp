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

  const rsvpCount = getRsvpCounts(guestsList);
  const guestsCombination = [
    {
      id: 0,
      prefix: <Users />,
      amount: guestsList.length,
      title: `All`,
      key: "all",
    },
    {
      id: 1,
      prefix: <Check color="green" />,
      amount: rsvpCount.confirmed,
      title: `Confirmed`,
      key: "approved",
    },
    {
      id: 2,
      prefix: <Clock color="orange" />,
      amount: rsvpCount.pending,
      title: `Pending reply`,
      key: "pending",
    },
    {
      id: 3,
      prefix: <X color="red" />,
      amount: rsvpCount.declined,
      title: `Declined`,
      key: "declined",
    },
  ];
  const toggleCheck = (id: number) => {
    if (id === 0 && !selectedOptions.includes(0)) {
      setSelectedOptions([0]);
      return;
    } else if (id !== 0 && selectedOptions.includes(0)) {
      setSelectedOptions(selectedOptions.filter((item) => item !== 0));
    }
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };
  const handleSend = () => {
    const whoToSend = guestsCombination
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
  const getNumberOfSelected = () =>
    selectedOptions.reduce(
      (acc, curr) => acc + guestsCombination[curr].amount,
      0
    );

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsEditMessageModalOpen(false)}
        height={"auto"}
      >
        <SidePanel.Header title="Send Message" />
        <SidePanel.Content>
          <Box direction="vertical" gap={7}>
            <FormField label="Who to send to">
              <Box direction="vertical">
                {guestsCombination.map((option) => (
                  <Checkbox
                    key={option.id}
                    checked={selectedOptions.includes(option.id)}
                    size="small"
                    onChange={() => toggleCheck(option.id)}
                  >
                    <Box gap={2}>
                      {option.prefix}
                      {`${option.title} (${option.amount})`}
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
            {getNumberOfSelected() > 0 && message.length > 0 && (
              <FormField>
                <Text size="small">
                  {`• ${
                    message.length
                  } characters Will be sent to ${getNumberOfSelected()} guests`}
                </Text>
              </FormField>
            )}
            <Box align="space-between">
              <Button
                priority="secondary"
                onClick={() => setIsEditMessageModalOpen(false)}
              >
                cancel
              </Button>
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
