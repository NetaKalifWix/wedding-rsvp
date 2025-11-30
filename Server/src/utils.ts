import { Guest, TemplateName, WeddingDetails } from "./types";
import axios from "axios";
import FormData from "form-data";
import { messagesMap } from "./messages";
import { getAccessToken } from "./whatsappTokenManager";
import Database from "./dbUtilsPostgresNeon";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export const handleTextResponse = async (msg: string, guestSender: Guest) => {
  if (msg === "טעות") {
    await handleMistake(guestSender);
    return;
  }
  const parsedToIntMsg = parseInt(msg, 10);
  if (isNaN(parsedToIntMsg) || parsedToIntMsg < 0 || parsedToIntMsg > 10) {
    await sendWhatsAppMessage(guestSender, {
      freeText: messagesMap.unknownResponse,
    });
    return;
  }
  await handleGuestNumberRSVP(parsedToIntMsg, guestSender);
};

export const handleMistake = async (guestSender: Guest) => {
  console.log(
    "received delete request from",
    guestSender,
    "its name is",
    guestSender.name
  );
  const db = Database.getInstance();
  await db.deleteGuest(guestSender);
  await sendWhatsAppMessage(guestSender, { freeText: messagesMap.mistake });
};

export const handleGuestNumberRSVP = async (
  rsvpCount: number,
  guestSender: Guest
) => {
  const db = Database.getInstance();
  await db.updateRSVP(guestSender.name, guestSender.phone, rsvpCount);
  await logMessage(
    guestSender.userID,
    `📠 RSVP updated for guest: ${guestSender.name} - RSVP: ${rsvpCount}`
  );
  const message = rsvpCount === 0 ? messagesMap.declined : messagesMap.approved;

  await sendWhatsAppMessage(guestSender, { freeText: message });
};

export const filterGuests = (guestsList, filterOptions) => {
  let filteredGuests = guestsList;
  if (!filterOptions.includes("all")) {
    filteredGuests = guestsList.filter((guest: Guest) => {
      let shouldKeep = false;
      if (filterOptions.includes("pending"))
        shouldKeep = shouldKeep || !guest.RSVP;
      if (filterOptions.includes("declined"))
        shouldKeep = shouldKeep || guest.RSVP === 0;
      if (filterOptions.includes("approved"))
        shouldKeep = shouldKeep || guest.RSVP > 0;
      return shouldKeep;
    });
  }
  return filteredGuests;
};
const createTemplateData = (to: string, params: TemplateParams) => {
  const components = params.headerParams
    ? [{ type: "header", parameters: params.headerParams }]
    : [];
  components.push({ type: "body", parameters: params.bodyParams });
  const data = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: params.templateName,
      language: {
        code: "he",
      },
      components,
    },
  };

  return data;
};

const createDataForFreeText = (to: string, freeText: string) => {
  return {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: {
      body: freeText,
    },
  };
};
type TemplateParams = {
  templateName: string;
  headerParams?: { type: string; image?: { id: string } }[];
  bodyParams: { type: string; parameter_name: string; text?: string }[];
};

const getTemplateParams = (
  templateName: TemplateName,
  info: WeddingDetails
): TemplateParams => {
  switch (templateName) {
    case "wedding_rsvp_action":
      return {
        templateName: "wedding_rsvp_action",
        headerParams: [
          {
            type: "image",
            image: {
              id: info.fileID,
            },
          },
        ],
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "date",
            text: new Date(info.wedding_date).toLocaleDateString("he-IL"),
          },
          {
            type: "text",
            parameter_name: "location",
            text: info.location_name,
          },
          {
            type: "text",
            parameter_name: "additonal_details",
            text:
              info.additional_information.length > 0
                ? info.additional_information
                : " ",
          },
        ],
      };
    case "wedding_day_reminder":
      return {
        templateName: "wedding_rsvp_same_day",
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "time",
            text: info.hour.slice(0, 5),
          },
          {
            type: "text",
            parameter_name: "waze_link",
            text: info.waze_link,
          },
          {
            type: "text",
            parameter_name: "card_gift_link",
            text: info.gift_link,
          },
        ],
      };
    case "day_before_wedding_reminder":
      return {
        templateName: "day_before_wedding_reminder",
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "time",
            text: info.hour.slice(0, 5),
          },
          {
            type: "text",
            parameter_name: "waze_link",
            text: info.waze_link,
          },
          {
            type: "text",
            parameter_name: "card_gift_link",
            text: info.gift_link,
          },
        ],
      };

    case "wedding_reminders_no_gift":
      return {
        templateName: "wedding_reminders_no_gift",
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "time",
            text: info.hour.slice(0, 5),
          },
          {
            type: "text",
            parameter_name: "waze_link",
            text: info.waze_link,
          },
        ],
      };
    case "wedding_reminders_no_gift_same_day":
      return {
        templateName: "wedding_reminders_no_gift_same_day",
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "time",
            text: info.hour.slice(0, 5),
          },
          {
            type: "text",
            parameter_name: "waze_link",
            text: info.waze_link,
          },
        ],
      };
    case "wedding_rsvp_reminder":
      return {
        templateName: "wedding_rsvp_reminder",
        bodyParams: [
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
        ],
      };
    case "custom_thank_you_message":
      return {
        templateName: "custom_thank_you_message",
        bodyParams: [
          {
            type: "text",
            parameter_name: "custom_massage",
            text: info.thank_you_message,
          },
          {
            type: "text",
            parameter_name: "names",
            text: `${info.bride_name} ו${info.groom_name}`,
          },
        ],
      };
    case "thank_you_message":
      return {
        templateName: "thank_you_message",
        bodyParams: [
          {
            type: "text",
            parameter_name: "groom_name",
            text: info.groom_name,
          },
          {
            type: "text",
            parameter_name: "bride_name",
            text: info.bride_name,
          },
        ],
      };
    default:
      throw new Error(`Template name ${templateName} not found`);
  }
};

export const mapResponseToStatus = (response: string) => {
  if (response === "כן אני אגיע!") return "approved";
  if (response === "לצערי לא") return "declined";
  if (response === "עדיין לא יודע/ת") return "pending";
  return response;
};

export const handleButtonReply = async (msg: string, guestSender: Guest) => {
  const senderStatus = mapResponseToStatus(msg);
  const db = Database.getInstance();
  if (senderStatus === "declined") {
    await db.updateRSVP(guestSender.name, guestSender.phone, 0);
    await sendWhatsAppMessage(guestSender, { freeText: messagesMap.declined });
  } else if (senderStatus === "approved") {
    await sendWhatsAppMessage(guestSender, {
      freeText: messagesMap.approveFollowUp,
    });
  } else if (senderStatus === "pending") {
    await sendWhatsAppMessage(guestSender, { freeText: messagesMap.pending });
  }
};

export const sendWhatsAppMessage = async (
  guest: Guest,
  options: {
    freeText?: string;
    template?: {
      name: TemplateName;
      info?: WeddingDetails;
    };
  }
) => {
  try {
    const ACCESS_TOKEN = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const whatsappData = options.template
      ? createTemplateData(
          guest.phone,
          getTemplateParams(options.template.name, options.template.info)
        )
      : createDataForFreeText(guest.phone, options.freeText);

    await axios.post(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      whatsappData,
      { headers }
    );

    await logMessage(
      guest.userID,
      `✅ Message sent successfully to ${guest.name}`
    );
  } catch (error) {
    await logMessage(
      guest.userID,
      `❌ Failed to send message: ${
        error.response?.data?.error?.message || error.message
      }`
    );
    const errorMessage = error.response?.data?.error?.message || error.message;
    throw new Error(`WhatsApp API Error: ${errorMessage}`);
  }
};

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const ACCESS_TOKEN = await getAccessToken();
  const response = await axios.post(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        ...form.getHeaders(),
      },
    }
  );

  const mediaID = response.data.id;
  return mediaID;
};

export const logMessage = async (userID: string, message: string) => {
  console.log(message);
  const db = Database.getInstance();
  if (db && userID) {
    await db.addClientLog(userID, message);
  }
};
