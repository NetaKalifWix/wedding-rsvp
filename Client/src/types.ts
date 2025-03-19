export interface Guest {
  Name: string;
  InvitationName: string;
  Phone: string;
  Whose: string;
  Circle: string;
  RSVP: number | undefined;
  NumberOfGuests: number;
}
export type RsvpStatus = "pending" | "confirmed" | "declined";
export interface FilterOptions {
  whose: Guest["Whose"][];
  circle: Guest["Circle"][];
  rsvpStatus: RsvpStatus[];
  searchTerm: string;
}
export type SetGuestsList = React.Dispatch<React.SetStateAction<Guest[]>>;
