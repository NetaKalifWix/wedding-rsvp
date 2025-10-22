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

export type TemplateType =
  | "wedding_rsvp_action"
  | "wedding_day_reminder"
  | "wedding_rsvp_reminder"
  | "day_before_wedding_reminder"
  | "wedding_reminders_no_gift"
  | "wedding_reminders_no_gift_same_day"
  | "war_updater";

export interface ClientLog {
  id?: number;
  userID?: string | null;
  message: string;
  createdAt?: Date;
}
