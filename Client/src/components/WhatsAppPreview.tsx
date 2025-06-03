import React, { useState } from "react";
import { Card, Image, Button, Box } from "@wix/design-system";
import { WeddingDetails } from "../types";
import "./css/WhatsAppMessage.css";

interface WhatsAppPreviewProps {
  weddingDetails: WeddingDetails;
  imageUrl: string;
  isCollapsible?: boolean;
  isPreviewOpen?: boolean;
  setIsPreviewOpen?: (value: boolean) => void;
  showAllMessages?: boolean;
}

const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  weddingDetails,
  imageUrl,
  showAllMessages = true,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const rsvpTemplate = `אורחים וחברים יקרים,
הנכם מוזמנים לחתונה של ${weddingDetails.bride_name || "{{bride_name}}"} ו${
    weddingDetails.groom_name || "{{groom_name}}"
  }!
האירוע יתקיים בתאריך ${
    weddingDetails.wedding_date
      ? new Date(weddingDetails.wedding_date).toLocaleDateString("he-IL")
      : "{{date}}"
  } ב${weddingDetails.location_name || "{{location}}"}.

${weddingDetails.additional_information || ""}`;

  const weddingDayTemplate = `היי, מחכים לראותכם היום בחתונה של ${
    weddingDetails.bride_name || "{{bride_name}}"
  } ו${weddingDetails.groom_name || "{{groom_name}}"} בשעה ${
    weddingDetails.hour.slice(0, 5) || "{{time}}"
  }!${weddingDetails.waze_link ? `\nלניווט: ${weddingDetails.waze_link}` : ""}${
    weddingDetails.gift_link
      ? `\n\nלנוחיותכם, ניתן להעניק מתנות באשראי בקישור:\n${weddingDetails.gift_link}`
      : ""
  }`;

  const thankYouTemplate = `אורחים יקרים,
${weddingDetails.thank_you_message || "תודה רבה שהגעת לחגוג איתנו!"}
${weddingDetails.bride_name || "{{bride_name}}"} ו${
    weddingDetails.groom_name || "{{groom_name}}"
  }`;

  const renderMessage = (title: string, content: string) => (
    <div className="whatsapp-chat" dir="rtl">
      <div className="message-title">{title}</div>
      <div className="whatsapp-message sent">
        {title === "Initial RSVP Message" &&
          (imageUrl ? <Image src={imageUrl} /> : <Image loading="eager" />)}
        {content}
        <span className="message-time">12:00</span>
      </div>
    </div>
  );

  const content = (
    <>
      <Box direction="vertical" gap={4}>
        {renderMessage("Initial RSVP Message", rsvpTemplate)}
        {showAllMessages && (
          <>
            {renderMessage("Wedding Day", weddingDayTemplate)}
            {renderMessage("Day After", thankYouTemplate)}
          </>
        )}
      </Box>
    </>
  );

  return (
    <Card>
      <Card.Header
        suffix={
          <Button
            size="small"
            onClick={() => setIsPreviewOpen?.(!isPreviewOpen)}
          >
            {isPreviewOpen ? "Hide Preview" : "Show Preview"}
          </Button>
        }
      />
      {isPreviewOpen && <Card.Content>{content}</Card.Content>}
    </Card>
  );
};

export default WhatsAppPreview;
