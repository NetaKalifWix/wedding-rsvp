import { Guest, TemplateType, WeddingDetails } from "./types";
import axios from "axios";
import FormData from "form-data";
import { messagesMap } from "./messages";
import { getAccessToken } from "./whatsappTokenManager";
import Database from "./dbUtilsPostgresNeon";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

export const handleTextResponse = async (msg: string, guestSender: Guest) => {
  if (msg === "טעות") {
    await handleMistake(guestSender);
    return;
  }
  const parsedToIntMsg = parseInt(msg, 10);
  if (isNaN(parsedToIntMsg) || parsedToIntMsg < 0 || parsedToIntMsg > 10) {
    await sendWhatsAppMessage(guestSender, messagesMap.unknownResponse);
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
  await sendWhatsAppMessage(guestSender, messagesMap.mistake);
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

const createDataForMessage = (
  to: string,
  freeText?: string,
  template?: {
    type: TemplateType;
    info?: WeddingDetails;
  }
) => {
  let data: any;
  if (template) {
    const info = template.info;
    if (template.type === "wedding_rsvp_action") {
      data = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "wedding_rsvp_action",
          language: {
            code: "he",
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    id: info.fileID,
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
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
            },
          ],
        },
      };
    } else if (template.type === "wedding_day_reminder") {
      data = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "wedding_rsvp_same_day",
          language: {
            code: "he",
          },
          components: [
            {
              type: "body",
              parameters: [
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
            },
          ],
        },
      };
    } else if (template.type === "day_before_wedding_reminder") {
      data = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "day_before_wedding_reminder",
          language: {
            code: "he",
          },
          components: [
            {
              type: "body",
              parameters: [
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
            },
          ],
        },
      };
    } else if (template.type === "wedding_rsvp_reminder") {
      data = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "wedding_rsvp_reminder",
          language: {
            code: "he",
          },
          components: [
            {
              type: "body",
              parameters: [
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
            },
          ],
        },
      };
    } else if (template.type === "war_updater") {
      data = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "war_updater",
          language: {
            code: "he",
          },
        },
      };
    }
  } else {
    data = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: {
        body: freeText,
      },
    };
  }
  return data;
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
    await sendWhatsAppMessage(guestSender, messagesMap.declined);
  } else if (senderStatus === "approved") {
    await sendWhatsAppMessage(guestSender, messagesMap.approveFollowUp);
  } else if (senderStatus === "pending") {
    await sendWhatsAppMessage(guestSender, messagesMap.pending);
  }
};

export const sendWhatsAppMessage = async (
  guest: Guest,
  freeText?: string,
  template?: {
    type: TemplateType;
    info?: WeddingDetails;
  }
) => {
  try {
    const ACCESS_TOKEN = await getAccessToken();
    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const whatsappData = template
      ? createDataForMessage(guest.phone, undefined, template)
      : createDataForMessage(guest.phone, freeText);

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

  await sendWhatsAppMessage(guestSender, message);
};

export const logMessage = async (userID: string, message: string) => {
  console.log(message);
  const db = Database.getInstance();
  if (db && userID) {
    await db.addClientLog(userID, message);
  }
};
