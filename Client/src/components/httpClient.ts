import { Guest, SetGuestsList } from "../types";

const url = "http://localhost:3002";
export const deleteAllGuests = (
  url: string,
  setGuestsList: (newGuestList: Guest[]) => void
) => {
  const confirmed = window.confirm(
    "Are you sure you want to reset the guests list? this action will remove all guests"
  );
  if (confirmed) {
    fetch(`${url}/resetDatabase`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((updatedGuestsList) => {
        setGuestsList(updatedGuestsList);
      })
      .catch((err) => console.log(err));
  }
};
export const deleteGuest = (guest: Guest, setGuestsList: SetGuestsList) => {
  fetch(`${url}/deleteGuest`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Name: guest.Name,
      Phone: guest.Phone,
      Whose: guest.Whose,
      Circle: guest.Circle,
      RSVP: guest.RSVP,
    }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};

export const setRSVP = (
  guest: Guest,
  value: number | null,
  setGuestsList: SetGuestsList
) => {
  fetch(`${url}/updateRsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...guest, RSVP: value }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};

export const addGuest = (newGuest: Guest, setGuestsList: SetGuestsList) =>
  fetch(`${url}/add`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newGuest),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));

export const httpRequests = {
  deleteAllGuests,
  deleteGuest,
  setRSVP,
  addGuest,
};
