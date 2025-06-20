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
  wedding_date: Date;
  hour: string;
  location_name: string;
  additional_information: string;
  waze_link: string;
  gift_link: string;
  thank_you_message?: string;
  fileID: string;
}

export interface User {
  userID: string;
  name: string;
  email: string;
}
