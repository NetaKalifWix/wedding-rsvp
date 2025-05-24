export interface Guest {
  name: string;
  phone: string;
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
}
export interface User {
  userID: string;
  name: string;
  email: string;
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
  date: string;
  location: string;
  additional_data: string;
}
