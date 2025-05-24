import { Guest } from "./types";
import axios from "axios";
import FormData from "form-data";
import { messagesMap } from "./messages";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

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
  data:
    | string
    | {
        bride_name: string;
        groom_name: string;
        date: string;
        location: string;
        additional_data: string;
      },
  isTemplate: boolean,
  imageId?: string
) => {
  return isTemplate
    ? {
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
                    id: imageId,
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
                  text: (data as { bride_name: string }).bride_name,
                },
                {
                  type: "text",
                  parameter_name: "groom_name",
                  text: (data as { groom_name: string }).groom_name,
                },
                {
                  type: "text",
                  parameter_name: "date",
                  text: (data as { date: string }).date,
                },
                {
                  type: "text",
                  parameter_name: "location",
                  text: (data as { location: string }).location,
                },
                {
                  type: "text",
                  parameter_name: "additonal_details",
                  text: (data as { additional_data: string }).additional_data,
                },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: typeof data === "string" ? data : JSON.stringify(data),
        },
      };
};

export const mapResponseToStatus = (response: string) => {
  if (response === "כן אני אגיע!") return "approved";
  if (response === "לצערי לא") return "declined";
  if (response === "עדיין לא יודע/ת") return "pending";
  return response;
};

export const handleButtonReply = async (
  msg: string,
  guestSender: Guest,
  updateRSVP
) => {
  const senderStatus = mapResponseToStatus(msg);
  if (senderStatus === "declined") {
    await updateRSVP(guestSender.name, guestSender.phone, 0);
    await sendWhatsAppMessage(messagesMap.declined, guestSender.phone);
  } else if (senderStatus === "approved") {
    await sendWhatsAppMessage(messagesMap.approved, guestSender.phone);
  } else if (senderStatus === "pending") {
    await sendWhatsAppMessage(messagesMap.pending, guestSender.phone);
  }
};
export const sendWhatsAppMessage = async (
  messageData:
    | string
    | {
        bride_name: string;
        groom_name: string;
        date: string;
        location: string;
        additional_data: string;
      },
  to: string,
  isTemplate: boolean = false,
  imageId?: string
) => {
  try {
    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };

    const whatsappData = createDataForMessage(
      to,
      messageData,
      isTemplate,
      imageId
    );
    await axios.post(url, whatsappData, { headers });

    console.log("✅ message sent successfully");
  } catch (error) {
    console.error(
      "❌ Failed to send message:",
      error.response?.data || error.message
    );
  }
};

export const uploadImage = async (file) => {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

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
  console.log(mediaID);
  return mediaID;
};

export const handleGuestNumberRSVP = async (
  rsvpCount: number,
  guestSender: Guest,
  updateRSVP
) => {
  await updateRSVP(guestSender.name, guestSender.phone, rsvpCount);
  const message = rsvpCount === 0 ? messagesMap.declined : messagesMap.approved;

  await sendWhatsAppMessage(message, guestSender.phone);
};
