import { useState } from "react";
import "./css/AddGuestModal.css";
import {
  formFieldsData,
  handleEmptyTableTemplate,
  handleImport,
  validateGuestsInfo,
} from "./logic";
import {
  AddItem,
  Box,
  Button,
  FileUpload,
  FormField,
  Input,
  SidePanel,
  Tabs,
  Text,
  NumberInput,
  IconButton,
} from "@wix/design-system";
import { Guest, SetGuestsList, User } from "../../types";
import React from "react";
import { httpRequests } from "../../httpClient";
import { Attachment, UploadExport } from "@wix/wix-ui-icons-common";
import { DocDownload } from "@wix/wix-ui-icons-common";
interface AddGuestModalProps {
  setGuestsList: SetGuestsList;
  guestsList: Guest[];
  setIsAddGuestModalOpen: (isOpen: boolean) => void;
  userID: User["userID"];
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({
  setGuestsList,
  guestsList,
  setIsAddGuestModalOpen,
  userID,
}) => {
  const [name, setName] = useState<string>("");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [whose, setWhose] = useState<string>("");
  const [circle, setCircle] = useState<string>("");
  const [rsvp, setRsvp] = useState<number>();
  const [messageGroup, setMessageGroup] = useState<number>();
  const [activeTabId, setActiveTabId] = useState<string>("1");
  const [file, setFile] = useState<File | null>(null);

  const formFields = [
    {
      fieldId: formFieldsData["name"].fieldId,
      label: "שם",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setName(e.target.value),
      placeholder: "נטע כליף",
      mandatory: formFieldsData["name"].mandatory,
      isEmpty: () => name.length === 0,
    },
    {
      fieldId: formFieldsData["phone"].fieldId,
      label: "טלפון",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setPhone(e.target.value),
      placeholder: "0545541120",
      mandatory: formFieldsData["phone"].mandatory,
      isEmpty: () => phone.length === 0,
    },
    {
      fieldId: formFieldsData["whose"].fieldId,
      label: "מוזמן ע״י",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setWhose(e.target.value),
      placeholder: "כלה",
      mandatory: formFieldsData["whose"].mandatory,
      isEmpty: () => whose.length === 0,
    },
    {
      fieldId: formFieldsData["circle"].fieldId,
      label: "מעגל",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setCircle(e.target.value),
      placeholder: "חברים מהצבא",
      mandatory: formFieldsData["circle"].mandatory,
      isEmpty: () => circle.length === 0,
    },
    {
      fieldId: formFieldsData["numberOfGuests"].fieldId,
      label: "מספר אורחים",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setNumberOfGuests(parseInt(e.target.value, 10)),
      placeholder: "2",
      mandatory: formFieldsData["numberOfGuests"].mandatory,
      isEmpty: () => numberOfGuests === 0,
    },
    {
      fieldId: formFieldsData["RSVP"].fieldId,
      label: "אישור הגעה?",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setRsvp(parseInt(e.target.value, 10)),
      placeholder: "",
      mandatory: formFieldsData["RSVP"].mandatory,
      isEmpty: () => rsvp === undefined,
    },
    {
      fieldId: "messageGroup",
      label: "קבוצת הודעות (אם יש יותר מ-250 רשומות)",
      component: (
        <NumberInput
          value={messageGroup}
          onChange={(value) =>
            setMessageGroup(value === null ? undefined : value)
          }
          placeholder="אופציונלי"
        />
      ),
      mandatory: false,
      isEmpty: () => messageGroup === undefined,
    },
  ];

  const shouldAddGuestBeDisabled = () =>
    formFields.some((field) => field.mandatory && field.isEmpty());

  const handleSubmitManually = async (e: React.FormEvent) => {
    e.preventDefault();
    const goodGuest = validateGuestsInfo(
      [
        {
          name: name,
          phone: phone,
          whose: whose,
          circle: circle,
          numberOfGuests: numberOfGuests,
          RSVP: rsvp,
          messageGroup: messageGroup,
        },
      ],
      guestsList
    );
    if (goodGuest.length > 0) {
      const updatedGuestsList = await httpRequests.addGuests(userID, goodGuest);
      setGuestsList(updatedGuestsList);
    }
    setIsAddGuestModalOpen(false);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("יש לבחור קובץ!");
      return;
    }
    await handleImport(userID, file, guestsList, setGuestsList);
    setIsAddGuestModalOpen(false);
  };

  return (
    <SidePanel
      onCloseButtonClick={() => setIsAddGuestModalOpen(false)}
      skin="floating"
    >
      <SidePanel.Header title="הוספת אורח">
        <Tabs
          items={[
            { id: "1", title: "מילוי ידני" },
            { id: "2", title: "העלאת קובץ" },
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
              <div style={{ padding: "6px 0px" }} key={field.fieldId}>
                <FormField
                  labelPlacement="top"
                  label={field.mandatory ? "*  " + field.label : field.label}
                  id={"" + field.fieldId}
                >
                  {field.component || (
                    <Input
                      onChange={field.onChange}
                      placeholder={field.placeholder}
                    />
                  )}
                </FormField>
              </div>
            ))}
            <Box align="space-between">
              <Button
                priority="secondary"
                onClick={() => setIsAddGuestModalOpen(false)}
              >
                ביטול
              </Button>
              <Button
                disabled={shouldAddGuestBeDisabled()}
                onClick={handleSubmitManually}
              >
                הוספת אורח
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
                  size="small"
                  subtitle={
                    file ? "החלפת קובץ" : "העלו קובץ אקסל עם רשימת האורחים שלכם"
                  }
                  onClick={openFileUploadDialog}
                >
                  {file ? "החלפת קובץ" : "העלאת קובץ"}
                </AddItem>
              )}
            </FileUpload>
            <Box direction="horizontal" gap={2} verticalAlign="middle">
              <IconButton
                skin="standard"
                priority="secondary"
                onClick={handleEmptyTableTemplate}
              >
                <DocDownload />
              </IconButton>
              <Text size="small">הורדת תבנית טבלה ריקה</Text>
            </Box>

            {file && (
              <Box gap={2}>
                <Text secondary>
                  <Attachment />
                  {file.name}
                </Text>
              </Box>
            )}
            <Box align="space-between">
              <Button
                priority="secondary"
                onClick={() => setIsAddGuestModalOpen(false)}
              >
                ביטול
              </Button>
              <Button onClick={handleFileUpload}>הוספת אורחים</Button>
            </Box>
          </Box>
        )}
      </SidePanel.Content>
    </SidePanel>
  );
};

export default AddGuestModal;
