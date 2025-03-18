import { Guest } from "../types";
import * as XLSX from "xlsx";

export const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith("0")) return `+972${phone.slice(1)}`;
  if (phone.startsWith("5")) return `+972${phone}`;
  return phone;
};

export const validatePhoneNumber = (
  phone: Guest["Phone"],
  guestsList: Guest[]
): string | undefined => {
  const formattedPhone = formatPhoneNumber(phone);
  const phoneRegex = /^\+9725\d{8}$/;
  if (!phoneRegex.test(formattedPhone)) {
    alert(
      "Invalid phone number format. Please enter a valid Israeli phone number. you can enter it as 05XXXXXXXX or 5XXXXXXXX or +9725XXXXXXXX"
    );
    return;
  }

  if (guestsList.some((guest) => guest.Phone === formattedPhone)) {
    alert("a guest with this phone number already exists in the list");
    return;
  }
  return formattedPhone;
};

export const getRsvpCounts = (guestsList: Guest[]) => {
  const counts = {
    pending: 0,
    confirmed: 0,
    declined: 0,
  };

  guestsList.forEach((guest) => {
    if (!guest.RSVP) counts.pending++;
    else if (guest.RSVP > 0) counts.confirmed++;
    else if (guest.RSVP === 0) counts.declined++;
  });

  return counts;
};

export const handleExport = (guestsList: Guest[]) => {
  const ws = XLSX.utils.json_to_sheet(guestsList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Guests");
  XLSX.writeFile(wb, "guestsListUpdated.xlsx");
};
