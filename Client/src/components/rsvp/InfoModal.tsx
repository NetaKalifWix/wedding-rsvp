import React, { useEffect, useState } from "react";
import "./css/InfoModal.css";
import "./css/WhatsAppMessage.css";
import { httpRequests } from "../../httpClient";
import EmojiPicker from "emoji-picker-react";
import {
  FormField,
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
  RadioGroup,
} from "@wix/design-system";
import { User, WeddingDetails } from "../../types";
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
    wedding_date: "2025-01-01",
    hour: "",
    location_name: "",
    additional_information: "",
    waze_link: "",
    gift_link: "",
    thank_you_message: "",
    fileID: "",
    reminder_day: "day_before",
    reminder_time: "10:00",
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
      (!file && !imageUrl)
    ) {
      alert("אנא מלאו את כל השדות הנדרשים והעלו תמונת הזמנה");
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
      alert("אירעה שגיאה. אנא נסו שנית.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidePanel
      skin="floating"
      onCloseButtonClick={() => setIsInfoModalOpen(false)}
      // height={"800px"}
      // width={"800px"}
    >
      <SidePanel.Header title="פרטי החתונה והודעות" />
      <SidePanel.Content>
        <Box direction="vertical" gap={4}>
          {/* Basic Wedding Information */}

          <Box direction="vertical" gap={4} width="100%">
            <FormField label="שם הכלה" required>
              <div dir="rtl">
                <Input
                  value={weddingDetails.bride_name}
                  onChange={(e) =>
                    setWeddingDetails((prev) => ({
                      ...prev,
                      bride_name: e.target.value,
                    }))
                  }
                  placeholder="הכניסו את שם הכלה"
                />
              </div>
            </FormField>
            <FormField label="שם החתן" required>
              <div dir="rtl">
                <Input
                  value={weddingDetails.groom_name}
                  onChange={(e) =>
                    setWeddingDetails((prev) => ({
                      ...prev,
                      groom_name: e.target.value,
                    }))
                  }
                  placeholder="הכניסו את שם החתן"
                />
              </div>
            </FormField>
            <FormField label="תאריך החתונה" required>
              <Input
                type="date"
                onChange={(e) => {
                  setWeddingDetails((prev) => ({
                    ...prev,
                    wedding_date: e.target.value,
                  }));
                }}
                value={weddingDetails.wedding_date}
                size="large"
              />
            </FormField>
            <FormField label="שעת החתונה" required>
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
            <FormField label="הגדרות תזכורת">
              <Box direction="vertical" gap={2}>
                <Text size="small" secondary>
                  בחרו מתי לשלוח תזכורת אוטומטית לאורחים שאישרו
                </Text>
                <RadioGroup
                  value={weddingDetails.reminder_day || "day_before"}
                  onChange={(value) =>
                    setWeddingDetails((prev) => ({
                      ...prev,
                      reminder_day: value as "day_before" | "wedding_day",
                    }))
                  }
                >
                  <RadioGroup.Radio value="day_before">
                    יום לפני החתונה
                  </RadioGroup.Radio>
                  <RadioGroup.Radio value="wedding_day">
                    יום החתונה
                  </RadioGroup.Radio>
                </RadioGroup>
                <FormField label="שעת התזכורת">
                  <Input
                    type="time"
                    value={weddingDetails.reminder_time || "10:00"}
                    onChange={(e) =>
                      setWeddingDetails((prev) => ({
                        ...prev,
                        reminder_time: e.target.value,
                      }))
                    }
                  />
                </FormField>
              </Box>
            </FormField>
            <FormField label="שם המקום" required>
              <div dir="rtl">
                <Input
                  value={weddingDetails.location_name}
                  onChange={(e) =>
                    setWeddingDetails((prev) => ({
                      ...prev,
                      location_name: e.target.value,
                    }))
                  }
                  placeholder="הכניסו את מיקום החתונה"
                />
              </div>
            </FormField>
            <FormField label="הזמנה לחתונה" required>
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
                      <Button skin="light" onClick={openFileUploadDialog}>
                        <UploadExport />
                        <span style={{ marginRight: "8px" }}>החלפת הזמנה</span>
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
                          ? "החלפת תמונת הזמנה"
                          : "העלו את הזמנת החתונה שלכם (חובה)"
                      }
                      onClick={openFileUploadDialog}
                    >
                      {file ? "החלפת מדיה" : "העלאת מדיה"}
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

            <FormField label="מידע נוסף">
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
                    placeholder="הזינו מידע נוסף להודעת אישור ההגעה (שורה אחת בלבד). לדוגמה: קישור לקבוצת וואטסאפ של ההסעה"
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
            <FormField label="הודעת תודה מותאמת אישית">
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
                    placeholder="הזינו הודעת תודה מותאמת אישית (אופציונלי). אם ריק, תישלח הודעה ברירת מחדל."
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
            <FormField label="קישור לוויז" required>
              <Input
                value={weddingDetails.waze_link}
                onChange={(e) =>
                  setWeddingDetails((prev) => ({
                    ...prev,
                    waze_link: e.target.value,
                  }))
                }
                placeholder="הזינו קישור לוויז"
              />
            </FormField>
            <FormField label=" קישור למתנות באשראי">
              <Input
                value={weddingDetails.gift_link}
                onChange={(e) =>
                  setWeddingDetails((prev) => ({
                    ...prev,
                    gift_link: e.target.value,
                  }))
                }
                placeholder="הזינו קישור למתנות באשראי"
              />
            </FormField>
          </Box>

          {/* Message Previews */}
          <WhatsAppPreview
            weddingDetails={weddingDetails}
            imageUrl={imageUrl}
            showAllMessages={true}
          />

          {file && isSubmitting && (
            <Box>
              <Text>העלאת תמונת ההזמנה עשויה לקחת מספר רגעים.</Text>
            </Box>
          )}
          {/* Action Buttons */}
          <Box align="space-between">
            <Button size="small" onClick={handleSend} loading={isSubmitting}>
              {isSubmitting ? <Loader size="tiny" /> : "שמירה"}
            </Button>
            <Button
              priority="secondary"
              size="small"
              onClick={() => setIsInfoModalOpen(false)}
            >
              ביטול
            </Button>
          </Box>
        </Box>
      </SidePanel.Content>
    </SidePanel>
  );
};

export default InfoModal;
