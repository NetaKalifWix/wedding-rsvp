import React, { useEffect, useState } from "react";
import "./css/InfoModal.css";
import "./css/WhatsAppMessage.css";
import { httpRequests } from "../httpClient";
import EmojiPicker from "emoji-picker-react";
import {
  FormField,
  Modal,
  SidePanel,
  Box,
  Text,
  Button,
  Input,
  InputArea,
  FileUpload,
  AddItem,
  IconButton,
  Popover,
  Loader,
  Image,
} from "@wix/design-system";
import { User, WeddingDetails } from "../types";
import { UploadExport } from "@wix/wix-ui-icons-common";
import { Smile } from "@wix/wix-ui-icons-common";
import WhatsAppPreview from "./WhatsAppPreview";

interface InfoModalProps {
  setIsInfoModalOpen: (value: boolean) => void;
  userID: User["userID"];
}

const InfoModal: React.FC<InfoModalProps> = ({
  setIsInfoModalOpen,
  userID,
}) => {
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails>({
    bride_name: "",
    groom_name: "",
    wedding_date: new Date(Date.now()),
    hour: "",
    location_name: "",
    additional_information: "",
    waze_link: "",
    gift_link: "",
    thank_you_message: "",
    fileID: "",
  });
  const [file, setFile] = useState<File | undefined>(undefined);
  const [showEmojiPicker, setShowEmojiPicker] = useState({
    additionalInfo: false,
    thankYou: false,
  });
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    httpRequests.getWeddingInfo(userID).then((weddingInfo) => {
      if (weddingInfo) {
        const { imageURL, ...rest } = weddingInfo;
        setWeddingDetails({
          ...rest,
          wedding_date: new Date(rest.wedding_date),
        });
        setImageUrl(`${imageURL}?t=${Date.now()}`);
      }
    });
  }, [userID]);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      // 🧹 Clean up the object URL when component unmounts or file changes
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const onEmojiClick = (
    field: "additional_information" | "thank_you_message",
    emojiData: any
  ) => {
    setWeddingDetails((prev) => ({
      ...prev,
      [field]: prev[field] + emojiData.emoji,
    }));
  };

  const handleSend = async () => {
    // Validate all required fields
    if (
      !weddingDetails.bride_name ||
      !weddingDetails.groom_name ||
      !weddingDetails.wedding_date ||
      !weddingDetails.hour ||
      !weddingDetails.location_name ||
      !weddingDetails.waze_link ||
      !weddingDetails.gift_link ||
      (!file && !imageUrl)
    ) {
      alert(
        "Please fill in all required fields and upload an invitation image"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("userID", userID);
      formData.append("weddingInfo", JSON.stringify(weddingDetails));
      if (file) {
        formData.append("imageFile", file);
      }
      // Save wedding information and upload image
      await httpRequests.saveWeddingInfo(formData);
      setIsInfoModalOpen(false);
    } catch (error) {
      console.error("Error saving wedding information:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen>
      <SidePanel
        skin="floating"
        onCloseButtonClick={() => setIsInfoModalOpen(false)}
        height={"800px"}
        width={"800px"}
      >
        <SidePanel.Header title="Wedding Details & Messages" />
        <SidePanel.Content>
          <Box direction="vertical" gap={4}>
            {/* Basic Wedding Information */}
            <Box gap={4}>
              <Box direction="vertical" gap={4} width="50%">
                <FormField label="Bride's Name" required>
                  <div dir="rtl">
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
                  </div>
                </FormField>
                <FormField label="Groom's Name" required>
                  <div dir="rtl">
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
                  </div>
                </FormField>
                <FormField label="Wedding Date" required>
                  <Input
                    type="date"
                    onChange={(e) =>
                      setWeddingDetails((prev) => ({
                        ...prev,
                        wedding_date: new Date(e.target.value),
                      }))
                    }
                    value={
                      weddingDetails.wedding_date.toISOString().split("T")[0]
                    }
                    size="large"
                  />
                </FormField>
                <FormField label="Wedding Time" required>
                  <Input
                    type="time"
                    value={weddingDetails.hour}
                    onChange={(e) =>
                      setWeddingDetails((prev) => ({
                        ...prev,
                        hour: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField label="Location Name" required>
                  <div dir="rtl">
                    <Input
                      value={weddingDetails.location_name}
                      onChange={(e) =>
                        setWeddingDetails((prev) => ({
                          ...prev,
                          location_name: e.target.value,
                        }))
                      }
                      placeholder="Enter wedding location"
                    />
                  </div>
                </FormField>
                <FormField label="Wedding Invitation" required>
                  {imageUrl ? (
                    <Box direction="vertical" gap={2}>
                      <Image src={imageUrl} width={"200px"} />
                      <FileUpload
                        accept=".png, .jpeg, .jpg"
                        multiple={false}
                        onChange={(files) => {
                          if (files) {
                            setFile(files[0]);
                          }
                        }}
                      >
                        {({ openFileUploadDialog }) => (
                          <Button
                            skin="light"
                            prefixIcon={<UploadExport />}
                            onClick={openFileUploadDialog}
                          >
                            Change Invitation
                          </Button>
                        )}
                      </FileUpload>
                    </Box>
                  ) : (
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
                  )}
                  {file && (
                    <Box gap={2} marginTop={2}>
                      <Text secondary>{file.name}</Text>
                    </Box>
                  )}
                </FormField>
              </Box>
              <Box direction="vertical" gap={4} width="50%">
                <FormField label="Additional Information">
                  <Box direction="vertical" gap={1}>
                    <div dir="rtl">
                      <InputArea
                        value={weddingDetails.additional_information}
                        onChange={(e) =>
                          setWeddingDetails((prev) => ({
                            ...prev,
                            additional_information: e.target.value.replace(
                              /\n/g,
                              " "
                            ),
                          }))
                        }
                        placeholder="Enter any additional information for the RSVP message (single line only)"
                        rows={3}
                      />
                    </div>
                    <Popover
                      shown={showEmojiPicker.additionalInfo}
                      placement="top"
                      onClickOutside={() =>
                        setShowEmojiPicker((prev) => ({
                          ...prev,
                          additionalInfo: false,
                        }))
                      }
                    >
                      <Popover.Element>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setShowEmojiPicker((prev) => ({
                              ...prev,
                              additionalInfo: !prev.additionalInfo,
                            }))
                          }
                        >
                          <Smile />
                        </IconButton>
                      </Popover.Element>
                      <Popover.Content>
                        <Box width="350px">
                          <EmojiPicker
                            onEmojiClick={(emojiData) =>
                              onEmojiClick("additional_information", emojiData)
                            }
                            width="100%"
                          />
                        </Box>
                      </Popover.Content>
                    </Popover>
                  </Box>
                </FormField>
                <FormField label="Custom Thank You Message">
                  <Box direction="vertical" gap={1}>
                    <div dir="rtl">
                      <InputArea
                        value={weddingDetails.thank_you_message}
                        onChange={(e) =>
                          setWeddingDetails((prev) => ({
                            ...prev,
                            thank_you_message: e.target.value,
                          }))
                        }
                        placeholder="Enter a custom thank you message (optional). If left empty, a default message will be sent."
                        rows={3}
                      />
                    </div>
                    <Popover
                      shown={showEmojiPicker.thankYou}
                      placement="top"
                      onClickOutside={() =>
                        setShowEmojiPicker((prev) => ({
                          ...prev,
                          thankYou: false,
                        }))
                      }
                    >
                      <Popover.Element>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setShowEmojiPicker((prev) => ({
                              ...prev,
                              thankYou: !prev.thankYou,
                            }))
                          }
                        >
                          <Smile />
                        </IconButton>
                      </Popover.Element>
                      <Popover.Content>
                        <Box width="350px">
                          <EmojiPicker
                            onEmojiClick={(emojiData) =>
                              onEmojiClick("thank_you_message", emojiData)
                            }
                            width="100%"
                          />
                        </Box>
                      </Popover.Content>
                    </Popover>
                  </Box>
                </FormField>
                <FormField label="Waze Link" required>
                  <Input
                    value={weddingDetails.waze_link}
                    onChange={(e) =>
                      setWeddingDetails((prev) => ({
                        ...prev,
                        waze_link: e.target.value,
                      }))
                    }
                    placeholder="Enter Waze link"
                  />
                </FormField>
                <FormField label="Gift Registry Link" required>
                  <Input
                    value={weddingDetails.gift_link}
                    onChange={(e) =>
                      setWeddingDetails((prev) => ({
                        ...prev,
                        gift_link: e.target.value,
                      }))
                    }
                    placeholder="Enter gift registry link"
                  />
                </FormField>
              </Box>
            </Box>

            {/* Message Previews */}
            <WhatsAppPreview
              weddingDetails={weddingDetails}
              imageUrl={imageUrl}
              showAllMessages={true}
            />

            {file && isSubmitting && (
              <Box>
                <Text>Uploading invitation image may take a few moments.</Text>
              </Box>
            )}
            {/* Action Buttons */}
            <Box align="space-between">
              <Box>
                <Button
                  priority="secondary"
                  onClick={() => setIsInfoModalOpen(false)}
                  size="small"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Box marginLeft={2} display="inline-block">
                  <Button
                    size="small"
                    onClick={handleSend}
                    loading={isSubmitting}
                  >
                    {isSubmitting ? <Loader size="tiny" /> : "Save"}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default InfoModal;
