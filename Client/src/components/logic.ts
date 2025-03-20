import { httpRequests } from "../httpClient";
import { FilterOptions, Guest, SetGuestsList } from "../types";
import * as XLSX from "xlsx";

export const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith("0")) return `+972${phone.slice(1)}`;
  if (phone.startsWith("5")) return `+972${phone}`;
  return phone;
};

export const validatePhoneNumber = (
  phone: Guest["Phone"],
  guestsList: Guest[],
  name: Guest["Name"],
  shouldAlert?: boolean
): string | undefined => {
  const formattedPhone = formatPhoneNumber(phone.toString());
  const phoneRegex = /^\+9725\d{8}$/;
  if (!phoneRegex.test(formattedPhone)) {
    if (shouldAlert)
      alert(
        "guest: " +
          name +
          " phone number: " +
          phone +
          " has invalid phone number format. Please enter a valid Israeli phone number. you can enter it as 05XXXXXXXX or 5XXXXXXXX or +9725XXXXXXXX"
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
export const handleImport = (
  file: File,
  guestsList: Guest[],
  setGuestsList: SetGuestsList
) => {
  const reader = new FileReader();

  reader.onload = (event) => {
    if (!event.target?.result) return;
    const data = new Uint8Array(event.target.result as ArrayBuffer);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawJSON: Guest[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
    });
    const json = rawJSON.filter((row) =>
      Object.values(row).some((value) => value !== null && value !== "")
    );

    const requiredFields = [
      "Name",
      "InvitationName",
      "Phone",
      "Whose",
      "Circle",
      "NumberOfGuests",
      "RSVP",
    ];

    const missingColumns = requiredFields.filter(
      (field) => !Object.keys(json[0]).includes(field)
    );

    if (!json.length || requiredFields.some((field) => !(field in json[0]))) {
      alert(
        "Defected file. the columns: " +
          missingColumns.join(", ") +
          " are missing. Make sure the table has all required columns: " +
          requiredFields.join(", ")
      );
      return;
    }
    const badPhoneNumbers: { name: string; phone: string }[] = [];
    json.forEach((row) => {
      const formattedPhone = validatePhoneNumber(
        row.Phone,
        guestsList,
        row.Name
      );
      if (!formattedPhone) {
        badPhoneNumbers.push({ name: row.Name, phone: row.Phone });
      } else {
        row.Phone = formattedPhone;
      }
    });
    let goodGuests = json;
    if (badPhoneNumbers.length) {
      alert(
        "Some phone numbers are invalid. This numbers will not be added now.\n You can add them manually later: \n" +
          badPhoneNumbers
            .map((row) => row.name + " phone number: " + row.phone)
            .join("\n")
      );
      goodGuests = json.filter(
        (guest: Guest) =>
          !badPhoneNumbers.map((object) => object.phone).includes(guest.Phone)
      );
    }
    httpRequests.addGuests(goodGuests, setGuestsList);
  };

  reader.readAsArrayBuffer(file);
};

export const getUniqueValues = <T extends keyof Guest>(
  guests: Guest[],
  key: T
): string[] => {
  const values = guests.map((guest) => guest[key] as string);
  return [...new Set(values)].sort();
};

export const getCirclesValues = (guests: Guest[]) => {
  const circlesMap: any = {};
  guests.forEach((guest) => {
    if (circlesMap[guest.Whose]) {
      if (!circlesMap[guest.Whose].includes(guest.Circle))
        circlesMap[guest.Whose].push(guest.Circle);
    } else {
      circlesMap[guest.Whose] = [guest.Circle];
    }
  });
  return circlesMap;
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
      guest.InvitationName.includes(filterOptions.searchTerm) ||
      guest.Circle.includes(filterOptions.searchTerm);

    return (
      matchesInvitedBy && matchesGroup && matchesRsvpStatus && matchesSearch
    );
  });
};

export const getNumberOfGuests = (guestsList: Guest[]) => {
  return guestsList.reduce((acc, guest) => acc + guest.NumberOfGuests, 0);
};

export const getNumberOfGuestsRSVP = (guestsList: Guest[]) => {
  return guestsList.reduce(
    (total, guest) => (guest.RSVP ? total + guest.RSVP : total),
    0
  );
};
