import { FilterOptions, Guest } from "../types";
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
    if (guest.RSVP == null) counts.pending++;
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

export const getUniqueValues = <T extends keyof Guest>(
  guests: Guest[],
  key: T
): string[] => {
  const values = guests.map((guest) => guest[key] as string);
  return [...new Set(values)].sort();
};
export const getRsvpStatus = (
  rsvp: number | null | undefined
): "pending" | "declined" | "confirmed" => {
  if (rsvp == null) return "pending";
  if (rsvp === 0) return "declined";
  return "confirmed";
};

export const filterGuests = (
  guests: Guest[],
  filterOptions: FilterOptions
): Guest[] => {
  return guests.filter((guest) => {
    const matchesInvitedBy =
      filterOptions.whose.length === 0 ||
      filterOptions.whose.includes(guest.Whose);

    const matchesGroup =
      filterOptions.circle.length === 0 ||
      filterOptions.circle.includes(guest.Circle);

    const matchesRsvpStatus =
      filterOptions.rsvpStatus.length === 0 ||
      filterOptions.rsvpStatus.includes(getRsvpStatus(guest.RSVP));

    const matchesSearch =
      !filterOptions.searchTerm ||
      guest.Name.includes(filterOptions.searchTerm) ||
      guest.Phone.includes(filterOptions.searchTerm) ||
      guest.Whose.includes(filterOptions.searchTerm) ||
      guest.Circle.includes(filterOptions.searchTerm);

    return (
      matchesInvitedBy && matchesGroup && matchesRsvpStatus && matchesSearch
    );
  });
};
