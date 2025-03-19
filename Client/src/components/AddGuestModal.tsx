import { useState } from "react";
import "./css/AddGuestModal.css";
import * as XLSX from "xlsx";
import { validatePhoneNumber } from "./logic";
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

  const handleSubmitManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (formFields.some((field) => field.mandatory && field.isEmpty())) {
      alert("Not all mandatory fields are filled!");
      return;
    }
    const formattedPhone = validatePhoneNumber(phone, guestsList);
    if (!formattedPhone) {
      return;
    }
    httpRequests.addGuest(
      {
        Name: name,
        InvitationName: invitationName,
        Phone: formattedPhone,
        Whose: whose,
        Circle: circle,
        RSVP: rsvp,
        NumberOfGuests: numberOfGuests,
      },
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

    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;
      const data = new Uint8Array(event.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Guest[] = XLSX.utils.sheet_to_json(worksheet);

      json.forEach((row) => {
        if (!row.Name) {
          return;
        }
        const formattedPhone = validatePhoneNumber(row.Phone, guestsList);
        if (!formattedPhone) {
          return;
        }
        httpRequests.addGuest({ ...row, Phone: formattedPhone }, setGuestsList);
      });
    };

    reader.readAsArrayBuffer(file);
    setIsAddGuestModalOpen(false);
  };

  return (
    <Modal isOpen>
      <SidePanel
        onCloseButtonClick={() => setIsAddGuestModalOpen(false)}
        skin="floating"
        width="500px"
        height="700px"
      >
        <SidePanel.Header title="Add Guest">
          <Tabs
            items={[
              { id: "1", title: "Fill manually" },
              { id: "2", title: "Upload file" },
            ]}
            activeId={activeTabId}
            type="uniformSide"
            width="174px"
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
              <Button onClick={handleSubmitManually}>Add Guest</Button>
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
                      "Please make sure that your Excel file has exactly 7 columns: \n Name, InvitationName, Phone, Whose, Circle, RSVP, NumberOfGuests"
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
              <Button disabled={!file} onClick={handleFileUpload}>
                Add Guests
              </Button>
            </Box>
          )}
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default AddGuestModal;
