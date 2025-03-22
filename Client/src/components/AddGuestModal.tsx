import { useState } from "react";
import "./css/AddGuestModal.css";
import { handleImport, validatePhoneNumber } from "./logic";
import {
  AddItem,
  Box,
  Button,
  FileUpload,
  FormField,
  Input,
  Modal,
  SidePanel,
  Tabs,
  Text,
} from "@wix/design-system";
import { Guest, SetGuestsList } from "../types";
import React from "react";
import { httpRequests } from "../httpClient";
import { Attachment, UploadExport } from "@wix/wix-ui-icons-common";

interface AddGuestModalProps {
  setGuestsList: SetGuestsList;
  guestsList: Guest[];
  setIsAddGuestModalOpen: (isOpen: boolean) => void;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({
  setGuestsList,
  guestsList,
  setIsAddGuestModalOpen,
}) => {
  const [name, setName] = useState<string>("");
  const [invitationName, setInvitationName] = useState<string>("");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [whose, setWhose] = useState<string>("");
  const [circle, setCircle] = useState<string>("");
  const [rsvp, setRsvp] = useState<number>();
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [file, setFile] = useState<File | null>(null);

  const formFields = [
    {
      fieldId: 1,
      label: "Name",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setName(e.target.value),
      placeholder: "נטע כליף",
      mandatory: true,
      isEmpty: () => name.length === 0,
    },
    {
      fieldId: 2,
      label: "Invitation Name",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setInvitationName(e.target.value),
      placeholder: "נטע ויואב",
      mandatory: true,
      isEmpty: () => invitationName.length === 0,
    },
    {
      fieldId: 3,
      label: "Phone",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPhone(e.target.value),
      placeholder: "0545541120",
      mandatory: true,
      isEmpty: () => phone.length === 0,
    },
    {
      fieldId: 4,
      label: "Whose",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setWhose(e.target.value),
      placeholder: "כלה",
      mandatory: true,
      isEmpty: () => whose.length === 0,
    },
    {
      fieldId: 5,
      label: "Circle",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCircle(e.target.value),
      placeholder: "חברים מהצבא",
      mandatory: true,
      isEmpty: () => circle.length === 0,
    },
    {
      fieldId: 6,
      label: "Number Of Guests",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setNumberOfGuests(parseInt(e.target.value, 10)),
      placeholder: "2",
      mandatory: true,
      isEmpty: () => numberOfGuests === 0,
    },
    {
      fieldId: 7,
      label: "RSVP?",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setRsvp(parseInt(e.target.value, 10)),
      placeholder: "",
      mandatory: false,
      isEmpty: () => rsvp === undefined,
    },
  ];

  const shouldAddGuestBeDisabled = () =>
    formFields.some((field) => field.mandatory && field.isEmpty());

  const handleSubmitManually = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPhone = validatePhoneNumber(phone, guestsList, name, true);
    if (!formattedPhone) {
      return;
    }
    httpRequests.addGuests(
      [
        {
          Name: name,
          InvitationName: invitationName,
          Phone: formattedPhone,
          Whose: whose,
          Circle: circle,
          NumberOfGuests: numberOfGuests,
          RSVP: rsvp,
        },
      ],
      setGuestsList
    );
    setIsAddGuestModalOpen(false);
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Must choose a file!");
      return;
    }
    handleImport(file, guestsList, setGuestsList);
    setIsAddGuestModalOpen(false);
  };

  return (
    <Modal isOpen>
      <SidePanel
        onCloseButtonClick={() => setIsAddGuestModalOpen(false)}
        skin="floating"
      >
        <SidePanel.Header title="Add Guest">
          <Tabs
            items={[
              { id: "1", title: "Fill manually" },
              { id: "2", title: "Upload file" },
            ]}
            activeId={activeTabId}
            type="uniformSide"
            minWidth={100}
            width="100%"
            onClick={(tab) => setActiveTabId("" + tab.id)}
          />
        </SidePanel.Header>
        <SidePanel.Content>
          {activeTabId === "1" && (
            <>
              {formFields.map((field) => (
                <div style={{ padding: "6px 0px" }}>
                  <FormField
                    labelPlacement="top"
                    label={field.mandatory ? "*  " + field.label : field.label}
                    id={"" + field.fieldId}
                  >
                    <Input
                      onChange={field.onChange}
                      placeholder={field.placeholder}
                    />
                  </FormField>
                </div>
              ))}
              <Box align="space-between">
                <Button
                  priority="secondary"
                  onClick={() => setIsAddGuestModalOpen(false)}
                >
                  cancel
                </Button>
                <Button
                  disabled={shouldAddGuestBeDisabled()}
                  onClick={handleSubmitManually}
                >
                  Add Guest
                </Button>
              </Box>
            </>
          )}
          {activeTabId === "2" && (
            <Box direction="vertical" gap={10}>
              <FileUpload
                multiple={false}
                accept=".xlsx, .xls"
                onChange={(files) => {
                  if (files) {
                    setFile(files[0]);
                  }
                }}
              >
                {({ openFileUploadDialog }) => (
                  <AddItem
                    icon={<UploadExport />}
                    size="large"
                    subtitle={
                      "Please make sure that your Excel file has exactly 7 columns: \n Name, InvitationName, Phone, Whose, Circle, NumberOfGuests, RSVP"
                    }
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
              <Box align="space-between">
                <Button
                  priority="secondary"
                  onClick={() => setIsAddGuestModalOpen(false)}
                >
                  cancel
                </Button>
                <Button disabled={!file} onClick={handleFileUpload}>
                  Add Guests
                </Button>
              </Box>
            </Box>
          )}
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default AddGuestModal;
