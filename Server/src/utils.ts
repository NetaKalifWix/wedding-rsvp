import { Guest } from "./types";

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
export const createDataForMessage = (
  to: string,
  msg: string,
  imageUrl?: string
) => {
  return imageUrl
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "rsvp_for_event",
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
                    link: imageUrl,
                  },
                },
              ],
            },
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: msg,
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
          body: msg,
        },
      };
};

export const mapResponseToStatus = (response: string) => {
  if (response === "כן אני אגיע!") return "approved";
  if (response === "לצערי לא") return "diclined";
  if (response === "עדיין לא יודע/ת") return "pending";
  return response;
};

export const handleInitialRSVP = async (
  msg: string,
  guestSender: Guest,
  sendWhatsAppMessage: (msg, number) => Promise<void>,
  updateRSVP
) => {
  const senderStatus = mapResponseToStatus(msg);
  if (
    senderStatus !== "pending" &&
    senderStatus !== "approved" &&
    senderStatus !== "declined"
  ) {
    await sendWhatsAppMessage(
      "לא הבנתי את התשובה שלך, אנא השיבו באחת מהאפשרויות הבאות: 'כן אני אגיע!', 'לצערי לא', 'עדיין לא יודע/ת'",
      guestSender.phone
    );
    return;
  }
  if (senderStatus === "declined") {
    updateRSVP(guestSender.name, guestSender.phone, 0);
    await sendWhatsAppMessage(
      " זה בסדר, תודה על העדכון! ניתן לשנות את תשובתך ע״י שליחת מספר אורחים",
      guestSender.phone
    ); //TODO: add custom link to gifts
  } else if (senderStatus === "approved") {
    await sendWhatsAppMessage(
      "איזה כיף! כמה אורחים תהיו? אנא השיבו במספר בלבד",
      guestSender.phone
    );
  }
};
export const handleGuestNumberRSVP = async (
  rsvpCount: number,
  guestSender: Guest,
  sendWhatsAppMessage: (msg, number) => Promise<void>,
  updateRSVP
) => {
  if (rsvpCount > 15 || rsvpCount < 0) {
    await sendWhatsAppMessage(
      "מספר האורחים לא תקין, אנא שלחו מספר בין 0 ל-15",
      guestSender.phone
    );
    return;
  }
  await updateRSVP(guestSender.name, guestSender.phone, rsvpCount);
  await sendWhatsAppMessage("תודה רבה! נתראה בקרוב!", guestSender.phone); //TODO: add a link to bus group
};
