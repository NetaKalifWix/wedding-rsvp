export interface Guest extends GuestIdentifier {
  invitationName: string;
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
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
export type FilterOptions = "all" | "noRsvp" | "rsvp";
