import * as XLSX from "xlsx";
export const getRsvpCounts = (guestsList) => {
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

export const handleExport = (guestsList) => {
  const ws = XLSX.utils.json_to_sheet(guestsList);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Guests");
  XLSX.writeFile(wb, "guestsListUpdated.xlsx");
};
