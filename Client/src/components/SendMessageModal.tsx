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
  Tabs,
  Input,
  Card,
  Accordion,
} from "@wix/design-system";
import { Check, Clock, Users, X } from "lucide-react";
import { getRsvpCounts } from "./logic";
import { Guest, User, WeddingDetails } from "../types";
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
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [message, setMessage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<number[]>([0]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    bride_name: "נטע כליף",
    groom_name: "יואב כהנא",
    date: "03.07.2025",
    location: "האחוזה בבית חנן",
    additional_data: "הנה לינק להסעה:",
  });

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

    await httpRequests.sendMessage(
      userID,
      activeTabId === "1"
        ? {
            type: "template",
            data: weddingDetails,
          }
        : {
            type: "freeText",
            text: message,
          },
      whoToSend,
      file
    );
    setIsSendMessageModalOpen(false);
  };

  const getNumberOfSelected = () =>
    selectedOptions.reduce(
      (acc, curr) => acc + guestsCombination[curr].amount,
      0
    );

  const renderMessagePreview = () => {
    const template = `אורחים וחברים יקרים,
הנכם מוזמנים לחתונה של ${weddingDetails.bride_name || "{{bride_name}}"} ו${
      weddingDetails.groom_name || "{{groom_name}}"
    }!
האירוע יתקיים בתאריך ${weddingDetails.date || "{{date}}"} ב${
      weddingDetails.location || "{{location}}"
    }.

${weddingDetails.additional_data || "{{additional_details}}"}`;

    return (
      <Box direction="vertical" gap={2}>
        <Accordion
          items={[
            {
              title: "Message Preview",
              children: (
                <Card>
                  <Card.Content>
                    <div dir="rtl">
                      <Text style={{ whiteSpace: "pre-line" }}>{template}</Text>
                    </div>
                  </Card.Content>
                </Card>
              ),
              open: isPreviewOpen,
              onToggle: () => setIsPreviewOpen(!isPreviewOpen),
            },
          ]}
        />
      </Box>
    );
  };

  const renderWeddingDetailsTab = () => (
    <Box direction="vertical" gap={4}>
      <Box gap={4}>
        <Box direction="vertical" gap={4} width="50%">
          <FormField label="Bride's Name">
            <Input
              value={weddingDetails.bride_name}
              onChange={(e) =>
                setWeddingDetails((prev) => ({
                  ...prev,
                  bride_name: e.target.value,
                }))
              }
              placeholder="Enter bride's name"
            />
          </FormField>
          <FormField label="Groom's Name">
            <Input
              value={weddingDetails.groom_name}
              onChange={(e) =>
                setWeddingDetails((prev) => ({
                  ...prev,
                  groom_name: e.target.value,
                }))
              }
              placeholder="Enter groom's name"
            />
          </FormField>
          <FormField label="Wedding Date">
            <Input
              value={weddingDetails.date}
              onChange={(e) =>
                setWeddingDetails((prev) => ({ ...prev, date: e.target.value }))
              }
              placeholder="Enter wedding date"
            />
          </FormField>
          <FormField label="Location">
            <Input
              value={weddingDetails.location}
              onChange={(e) =>
                setWeddingDetails((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="Enter wedding location"
            />
          </FormField>
        </Box>
        <Box direction="vertical" gap={4} width="50%">
          <FormField label="Additional Information">
            <InputArea
              value={weddingDetails.additional_data}
              onChange={(e) =>
                setWeddingDetails((prev) => ({
                  ...prev,
                  additional_data: e.target.value,
                }))
              }
              placeholder="Enter any additional information"
              rows={3}
            />
          </FormField>
          <FormField label="Wedding Invitation" required>
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
                  subtitle={
                    file
                      ? "Change invitation image"
                      : "Upload your wedding invitation (required)"
                  }
                  onClick={openFileUploadDialog}
                >
                  {file ? "Change Media" : "Upload Media"}
                </AddItem>
              )}
            </FileUpload>
            {file && (
              <Box gap={2} marginTop={2}>
                <Attachment />
                <Text secondary>{file.name}</Text>
              </Box>
            )}
          </FormField>
        </Box>
      </Box>
      {renderMessagePreview()}
    </Box>
  );

  const renderCustomMessageTab = () => (
    <>
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
      </Box>

      <FormField>
        <div dir="rtl">
          <InputArea
            placeholder="Get people excited about your wedding."
            rows={4}
            hasCounter
            resizable
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </FormField>
    </>
  );

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsSendMessageModalOpen(false)}
        height={"700px"}
      >
        <SidePanel.Header title="Send Message">
          <Tabs
            items={[
              { id: "1", title: "Wedding Details" },
              { id: "2", title: "Custom Message" },
            ]}
            activeId={activeTabId}
            type="uniformSide"
            minWidth={100}
            width="100%"
            onClick={(tab) => setActiveTabId("" + tab.id)}
          />
        </SidePanel.Header>
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
            {activeTabId === "1"
              ? renderWeddingDetailsTab()
              : renderCustomMessageTab()}

            {getNumberOfSelected() > 0 && (
              <Box align="space-between">
                <Text size="small">
                  {`• Will be sent to ${getNumberOfSelected()} guests`}
                </Text>
                <Box>
                  <Button
                    priority="secondary"
                    onClick={() => setIsSendMessageModalOpen(false)}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Box marginLeft={2} display="inline-block">
                    <Button
                      size="small"
                      disabled={
                        !getNumberOfSelected() ||
                        (activeTabId === "1"
                          ? !weddingDetails.bride_name ||
                            !weddingDetails.groom_name ||
                            !weddingDetails.date ||
                            !weddingDetails.location ||
                            !file
                          : !message)
                      }
                      onClick={handleSend}
                    >
                      Send
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default SendMessageModal;
