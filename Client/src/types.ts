export interface Guest {
  name: string;
  phone: string;
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
  messageGroup?: number; // Group number for message batching (1-N)
}

export type RsvpStatus = "pending" | "confirmed" | "declined";
export interface FilterOptions {
  whose: Guest["whose"][];
  circle: Guest["circle"][];
  rsvpStatus: RsvpStatus[];
  searchTerm: string;
}
export type SetGuestsList = React.Dispatch<React.SetStateAction<Guest[]>>;

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
  fileID: string;
  reminder_day?: "day_before" | "wedding_day"; // Which day to send reminder
  reminder_time?: string; // Time to send reminder (HH:MM format)
}

export interface User {
  userID: string;
  name: string;
  email: string;
}

export interface ClientLog {
  id: number;
  userID: string;
  message: string;
  createdAt: string;
}

export type TaskPriority = 1 | 2 | 3; // 1 = High, 2 = Medium, 3 = Low
export type TaskAssignee = "bride" | "groom" | "both";

export interface Task {
  task_id: number;
  user_id: string;
  title: string;
  timeline_group: string;
  is_completed: boolean;
  priority?: TaskPriority;
  assignee?: TaskAssignee;
  sort_order?: number;
  created_at?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
}

export type TimelineGroup =
  | "Just Engaged"
  | "12 Months Before"
  | "9 Months Before"
  | "6 Months Before"
  | "3 Months Before"
  | "1 Month Before"
  | "1 Week Before"
  | "Wedding Day";
