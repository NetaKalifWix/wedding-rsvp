export interface Guest {
  name: string;
  invitationName: string;
  phone: string;
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
}
export interface User {
  name: string;
  email: string;
  userID: string;
}
export type FilterOptions = "all" | "noRsvp" | "rsvp";
