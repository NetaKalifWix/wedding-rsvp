export interface Guest extends GuestIdentifier {
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
  messageGroup?: number; // Group number for message batching (1-N)
  userID: string;
}
export interface GuestIdentifier {
  name: string;
  phone: string;
}
export interface User {
  name: string;
  email: string;
  userID: string;
}
export type FilterOptions = "all" | "pending" | "approved" | "declined";

export interface WeddingDetails {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  hour: string;
  location_name: string;
  additional_information: string;
  waze_link: string;
  gift_link: string;
  thank_you_message?: string;
  fileID?: string;
  reminder_day?: "day_before" | "wedding_day"; // Which day to send reminder
  reminder_time?: string; // Time to send reminder (HH:MM format)
}

export type TemplateName =
  | "wedding_rsvp_action"
  | "wedding_day_reminder"
  | "wedding_rsvp_reminder"
  | "day_before_wedding_reminder"
  | "wedding_reminders_no_gift"
  | "wedding_reminders_no_gift_same_day"
  | "custom_thank_you_message"
  | "thank_you_message";

// const getTemplateParams = (info: WeddingDetails) => ({
//   wedding_rsvp_action: {
//     templateName: "wedding_rsvp_action",
//     headerParams: [
//       {
//         type: "image",
//         image: {
//           id: info.fileID,
//         },
//       },
//     ],
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//       {
//         type: "text",
//         parameter_name: "date",
//         text: new Date(info.wedding_date).toLocaleDateString("he-IL"),
//       },
//       {
//         type: "text",
//         parameter_name: "location",
//         text: info.location_name,
//       },
//       {
//         type: "text",
//         parameter_name: "additonal_details",
//         text:
//           info.additional_information.length > 0
//             ? info.additional_information
//             : " ",
//       },
//     ],
//   },
//   wedding_day_reminder: {
//     templateName: "wedding_rsvp_same_day",
//     bodyParams: [
//       [
//         {
//           type: "text",
//           parameter_name: "bride_name",
//           text: info.bride_name,
//         },
//         {
//           type: "text",
//           parameter_name: "groom_name",
//           text: info.groom_name,
//         },
//         {
//           type: "text",
//           parameter_name: "time",
//           text: info.hour.slice(0, 5),
//         },
//         {
//           type: "text",
//           parameter_name: "waze_link",
//           text: info.waze_link,
//         },
//         {
//           type: "text",
//           parameter_name: "card_gift_link",
//           text: info.gift_link,
//         },
//       ],
//     ],
//   },
//   day_before_wedding_reminder: {
//     templateName: "day_before_wedding_reminder",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//       {
//         type: "text",
//         parameter_name: "time",
//         text: info.hour.slice(0, 5),
//       },
//       {
//         type: "text",
//         parameter_name: "waze_link",
//         text: info.waze_link,
//       },
//       {
//         type: "text",
//         parameter_name: "card_gift_link",
//         text: info.gift_link,
//       },
//     ],
//   },
//   wedding_reminders_no_gift: {
//     templateName: "wedding_reminders_no_gift",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//       {
//         type: "text",
//         parameter_name: "time",
//         text: info.hour.slice(0, 5),
//       },
//       {
//         type: "text",
//         parameter_name: "waze_link",
//         text: info.waze_link,
//       },
//     ],
//   },
//   wedding_reminders_no_gift_same_day: {
//     templateName: "wedding_reminders_no_gift_same_day",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//       {
//         type: "text",
//         parameter_name: "time",
//         text: info.hour.slice(0, 5),
//       },
//       {
//         type: "text",
//         parameter_name: "waze_link",
//         text: info.waze_link,
//       },
//     ],
//   },
//   wedding_rsvp_reminder: {
//     templateName: "wedding_rsvp_reminder",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//     ],
//   },
//   custom_thank_you_message: {
//     templateName: "custom_thank_you_message",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "custom_massage",
//         text: info.thank_you_message,
//       },
//       {
//         type: "text",
//         parameter_name: "names",
//         text: `${info.bride_name} ו${info.groom_name}`,
//       },
//     ],
//   },
//   thank_you_message: {
//     templateName: "thank_you_message",
//     bodyParams: [
//       {
//         type: "text",
//         parameter_name: "groom_name",
//         text: info.groom_name,
//       },
//       {
//         type: "text",
//         parameter_name: "bride_name",
//         text: info.bride_name,
//       },
//     ],
//   },
// });
export interface ClientLog {
  id?: number;
  userID?: string | null;
  message: string;
  createdAt?: Date;
}
