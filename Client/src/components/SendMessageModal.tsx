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
  FileUpload,
  AddItem,
} from "@wix/design-system";
import { Check, Clock, Users, X } from "lucide-react";
import { getRsvpCounts } from "./logic";
import { Guest, User } from "../types";
import { Attachment, UploadExport } from "@wix/wix-ui-icons-common";

interface SendMessageModalProps {
  setIsSendMessageModalOpen: (value: boolean) => void;
  guestsList: Guest[];
  userID: User["userID"];
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  setIsSendMessageModalOpen,
  guestsList,
  userID,
}) => {
  const [message, setMessage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([0]);
  const [limitChars, setLimitChars] = useState(134);
  const [file, setFile] = useState<File | undefined>(undefined);

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
  const handleSend = async () => {
    const whoToSend = guestsCombination
      .filter((option) => selectedOptions.includes(option.id))
      .map((option) => option.key);
    if (whoToSend.length === 0) {
      alert("Please select at least one option");
      return;
    }
    // const confirmed = window.confirm(
    //   "Are you sure you want to send messages? This action will send SMS to all the selected guests."
    // );

    // if (confirmed) {
    await httpRequests.sendMessage(userID, message, whoToSend, file);
    setIsSendMessageModalOpen(false);
    // }
  };
  const getNumberOfSelected = () =>
    selectedOptions.reduce(
      (acc, curr) => acc + guestsCombination[curr].amount,
      0
    );

  const charsLimitOptions = [
    { value: 134, label: "134 (1 SMS charge)" },
    { value: 201, label: "201 (2 SMS charge)" },
    {
      value: Number.MAX_VALUE,
      label: "No limit (charge according to character count)",
    },
  ];
  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsSendMessageModalOpen(false)}
        height={"auto"}
      >
        <SidePanel.Header title="Send Message" />
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
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
              <Box direction="vertical" gap={2}>
                <Text size="medium">Limit characters</Text>
                <Text size="small">
                  Keep message short – it will be sent as a single message and
                  charged by character count.
                </Text>
                <Text size="tiny">
                  make sure to compute the invitation names in your char count.
                  approximately 15 characters
                </Text>
              </Box>
              <Box direction="vertical" paddingTop={2}>
                {charsLimitOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    checked={limitChars === option.value}
                    size="small"
                    onChange={() => setLimitChars(option.value)}
                  >
                    {option.label || option.value}
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
              <div dir="rtl">
                <InputArea
                  placeholder="Get people excited about your wedding."
                  rows={4}
                  maxLength={
                    limitChars !== Number.MAX_VALUE ? limitChars : undefined
                  }
                  hasCounter
                  resizable
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
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
            <Box direction="vertical" gap={2}>
              <FileUpload
                multiple={false}
                accept=".png, .jpeg, .JPG"
                onChange={(files) => {
                  if (files) {
                    setFile(files[0]);
                  }
                }}
              >
                {({ openFileUploadDialog }) => (
                  <AddItem
                    icon={<UploadExport />}
                    size="small"
                    subtitle={"add your wedding invitation"}
                    onClick={openFileUploadDialog}
                  >
                    Upload Media
                  </AddItem>
                )}
              </FileUpload>
              {file && (
                <Box gap={2}>
                  <Attachment />
                  <Text secondary>{file.name}</Text>
                </Box>
              )}
            </Box>
            <Box align="space-between">
              <Button
                priority="secondary"
                onClick={() => setIsSendMessageModalOpen(false)}
              >
                cancel
              </Button>
              <Button
                disabled={!message || getNumberOfSelected() === 0}
                onClick={handleSend}
              >
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
