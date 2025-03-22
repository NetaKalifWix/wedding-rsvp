import { Guest, SetGuestsList } from "./types";

const url = process.env.REACT_APP_SERVER_URL;
const deleteAllGuests = (setGuestsList: (newGuestList: Guest[]) => void) => {
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
const deleteGuest = (guest: Guest, setGuestsList: SetGuestsList) => {
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

const setRSVP = (
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

const addGuests = (newGuests: Guest[], setGuestsList: SetGuestsList) => {
  fetch(`${url}/add`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newGuests),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};

const fetchData = async (setGuestsList: SetGuestsList) => {
  try {
    const response = await fetch(`${url}/guestsList`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    setGuestsList(data);
  } catch (error) {
    alert("Error connecting to the server. Please try again later.");
  }
};

const sendMessage = (message: string, filterOption: string[]) => {
  fetch(`${url}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      filterOption,
    }),
  }).catch((err) => console.log(err));
};
export const httpRequests = {
  deleteAllGuests,
  deleteGuest,
  setRSVP,
  addGuests,
  fetchData,
  sendMessage,
};
