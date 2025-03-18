export interface Guest {
  Name: string;
  Phone: string;
  Whose: string;
  Circle: string;
  RSVP: number;
}

export type SetGuestsList = React.Dispatch<React.SetStateAction<Guest[]>>;
