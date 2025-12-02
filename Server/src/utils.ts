import { Guest, TemplateName, WeddingDetails } from "./types";
import axios from "axios";
import FormData from "form-data";
import { messagesMap } from "./messages";
import { getAccessToken } from "./whatsappTokenManager";
import Database from "./dbUtilsPostgresNeon";

// Constants
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = "v19.0";
const WHATSAPP_MEDIA_API_VERSION = "v17.0";
const LANGUAGE_CODE = "he";

// Hebrew Command Keywords
const HEBREW_MISTAKE_KEYWORD = "טעות";

// Response Button Text
const RESPONSE_BUTTONS = {
  APPROVED: "כן אני אגיע!",
  DECLINED: "לצערי לא",
  PENDING: "עדיין לא יודע/ת",
} as const;

// RSVP Status
const RSVP_STATUS = {
  APPROVED: "approved",
  DECLINED: "declined",
  PENDING: "pending",
} as const;

// RSVP Limits
const MIN_RSVP_COUNT = 0;
const MAX_RSVP_COUNT = 10;

// ============================================================================
// Message Handlers
// ============================================================================

export const handleTextResponse = async (
  msg: string,
  guestSender: Guest
): Promise<void> => {
  if (msg === HEBREW_MISTAKE_KEYWORD) {
    await handleMistake(guestSender);
    return;
  }

  const rsvpCount = parseInt(msg, 10);
  if (!isValidRsvpCount(rsvpCount)) {
    await sendWhatsAppMessage(guestSender, {
      freeText: messagesMap.unknownResponse,
    });
    return;
  }

  await handleGuestNumberRSVP(rsvpCount, guestSender);
};

const isValidRsvpCount = (count: number): boolean => {
  return !isNaN(count) && count >= MIN_RSVP_COUNT && count <= MAX_RSVP_COUNT;
};

export const handleMistake = async (guestSender: Guest): Promise<void> => {
  await logMessage(
    guestSender.userID,
    `🗑️ Delete request received from guest: ${guestSender.name}`
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

export const handleButtonReply = async (
  msg: string,
  guestSender: Guest
): Promise<void> => {
  const senderStatus = mapResponseToStatus(
    msg as (typeof RESPONSE_BUTTONS)[keyof typeof RESPONSE_BUTTONS]
  );
  const db = Database.getInstance();

  if (senderStatus === RSVP_STATUS.DECLINED) {
    await db.updateRSVP(guestSender.name, guestSender.phone, 0);
    await sendWhatsAppMessage(guestSender, { freeText: messagesMap.declined });
  } else if (senderStatus === RSVP_STATUS.APPROVED) {
    await sendWhatsAppMessage(guestSender, {
      freeText: messagesMap.approveFollowUp,
    });
  } else if (senderStatus === RSVP_STATUS.PENDING) {
    await sendWhatsAppMessage(guestSender, { freeText: messagesMap.pending });
  }
};

export const mapResponseToStatus = (
  response: (typeof RESPONSE_BUTTONS)[keyof typeof RESPONSE_BUTTONS]
): (typeof RSVP_STATUS)[keyof typeof RSVP_STATUS] => {
  if (response === RESPONSE_BUTTONS.APPROVED) return RSVP_STATUS.APPROVED;
  if (response === RESPONSE_BUTTONS.DECLINED) return RSVP_STATUS.DECLINED;
  return RSVP_STATUS.PENDING;
};
// ============================================================================
// WhatsApp Message Building
// ============================================================================

interface TemplateParams {
  templateName: string;
  headerParams?: Array<{ type: string; image?: { id: string } }>;
  bodyParams: Array<{ type: string; parameter_name: string; text?: string }>;
}

const createTemplateData = (to: string, params: TemplateParams) => {
  const components = params.headerParams
    ? [{ type: "header", parameters: params.headerParams }]
    : [];
  components.push({ type: "body", parameters: params.bodyParams });

  return {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: params.templateName,
      language: {
        code: LANGUAGE_CODE,
      },
      components,
    },
  };
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

// ============================================================================
// Template Parameter Builders
// ============================================================================

type TemplateBodyParam = {
  type: string;
  parameter_name: string;
  text?: string;
};

const createTextParam = (
  parameterName: string,
  text: string
): TemplateBodyParam => ({
  type: "text",
  parameter_name: parameterName,
  text,
});

const createImageHeader = (fileID: string) => [
  {
    type: "image",
    image: { id: fileID },
  },
];

const createBrideGroomParams = (info: WeddingDetails): TemplateBodyParam[] => [
  createTextParam("bride_name", info.bride_name),
  createTextParam("groom_name", info.groom_name),
];

const createReminderParams = (
  info: WeddingDetails,
  includeGift: boolean
): TemplateBodyParam[] => {
  const params = [
    ...createBrideGroomParams(info),
    createTextParam("time", info.hour.slice(0, 5)),
    createTextParam("waze_link", info.waze_link),
  ];

  if (includeGift) {
    params.push(createTextParam("card_gift_link", info.gift_link));
  }

  return params;
};

const getTemplateParams = (
  templateName: TemplateName,
  info: WeddingDetails
): TemplateParams => {
  switch (templateName) {
    case "wedding_rsvp_action":
      return {
        templateName: "wedding_rsvp_action",
        headerParams: createImageHeader(info.fileID),
        bodyParams: [
          ...createBrideGroomParams(info),
          createTextParam(
            "date",
            new Date(info.wedding_date).toLocaleDateString("he-IL")
          ),
          createTextParam("location", info.location_name),
          createTextParam(
            "additonal_details",
            info.additional_information.length > 0
              ? info.additional_information
              : " "
          ),
        ],
      };
    case "wedding_day_reminder":
      return {
        templateName: "wedding_rsvp_same_day",
        bodyParams: createReminderParams(info, true),
      };
    case "day_before_wedding_reminder":
      return {
        templateName: "day_before_wedding_reminder",
        bodyParams: createReminderParams(info, true),
      };

    case "wedding_reminders_no_gift":
      return {
        templateName: "wedding_reminders_no_gift",
        bodyParams: createReminderParams(info, false),
      };
    case "wedding_reminders_no_gift_same_day":
      return {
        templateName: "wedding_reminders_no_gift_same_day",
        bodyParams: createReminderParams(info, false),
      };
    case "wedding_rsvp_reminder":
      return {
        templateName: "wedding_rsvp_reminder",
        bodyParams: createBrideGroomParams(info),
      };
    case "custom_thank_you_message":
      return {
        templateName: "custom_thank_you_message",
        bodyParams: [
          createTextParam("custom_massage", info.thank_you_message),
          createTextParam("names", `${info.bride_name} ו${info.groom_name}`),
        ],
      };
    case "thank_you_message":
      return {
        templateName: "thank_you_message",
        bodyParams: createBrideGroomParams(info),
      };
    default:
      throw new Error(`Template name ${templateName} not found`);
  }
};

// ============================================================================
// WhatsApp API Communication
// ============================================================================

interface SendMessageOptions {
  freeText?: string;
  template?: {
    name: TemplateName;
    info?: WeddingDetails;
  };
}

export interface MessageResult {
  success: boolean;
  userID: string;
  guestName: string;
  logMessage: string;
}

const getWhatsAppApiUrl = (endpoint: string): string => {
  return `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${PHONE_NUMBER_ID}/${endpoint}`;
};

const createAuthHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

export const sendWhatsAppMessage = async (
  guest: Guest,
  options: SendMessageOptions
): Promise<MessageResult> => {
  try {
    const accessToken = await getAccessToken();
    const headers = createAuthHeaders(accessToken);

    const whatsappData = options.template
      ? createTemplateData(
          guest.phone,
          getTemplateParams(options.template.name, options.template.info)
        )
      : createDataForFreeText(guest.phone, options.freeText);

    await axios.post(getWhatsAppApiUrl("messages"), whatsappData, { headers });

    return {
      success: true,
      userID: guest.userID,
      guestName: guest.name,
      logMessage: `✅ Message sent successfully to ${guest.name}`,
    };
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    return {
      success: false,
      userID: guest.userID,
      guestName: guest.name,
      logMessage: `❌ Failed to send message to ${guest.name}: ${errorMessage}`,
    };
  }
};

// ============================================================================
// Media Upload
// ============================================================================

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export const uploadImage = async (file: UploadedFile): Promise<string> => {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const accessToken = await getAccessToken();
  const response = await axios.post(
    `https://graph.facebook.com/${WHATSAPP_MEDIA_API_VERSION}/${PHONE_NUMBER_ID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id;
};

// ============================================================================
// Logging
// ============================================================================

export const logMessage = async (
  userID: string,
  message: string
): Promise<void> => {
  console.log(message);
  const db = Database.getInstance();
  if (db && userID) {
    await db.addClientLog(userID, message);
  }
};

// Batch log multiple message results in a single DB call
export const batchLogMessageResults = async (
  results: MessageResult[]
): Promise<void> => {
  const db = Database.getInstance();
  if (!db || results.length === 0) return;

  results.forEach((r) => console.log(r.logMessage));

  const logs = results
    .filter((r) => r.userID)
    .map((r) => ({
      userID: r.userID,
      message: r.logMessage,
    }));

  if (logs.length > 0) {
    try {
      await db.addClientLogsBatch(logs);
    } catch (error) {
      console.error("Failed to batch log message results:", error);
    }
  }
};
