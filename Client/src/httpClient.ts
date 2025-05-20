import { Guest, SetGuestsList, User } from "./types";

const url = process.env.REACT_APP_SERVER_URL;

const addUser = (newUser: User) => {
  fetch(`${url}/addUser`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newUser }),
  })
    .then((response) => response.json())
    .catch((err) => console.log(err));
};
const deleteAllGuests = (
  userID: User["userID"],
  setGuestsList: (newGuestList: Guest[]) => void
) => {
  const confirmed = window.confirm(
    "Are you sure you want to reset the guests list? this action will remove all guests"
  );
  if (confirmed) {
    fetch(`${url}/deleteAllGuests`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    })
      .then((response) => response.json())
      .then((updatedGuestsList) => {
        setGuestsList(updatedGuestsList);
      })
      .catch((err) => console.log(err));
  }
};
const deleteGuest = (
  userID: User["userID"],
  guest: Guest,
  setGuestsList: SetGuestsList
) => {
  fetch(`${url}/deleteGuest`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID,
      guest: {
        name: guest.name,
        phone: guest.phone,
      },
    }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};

const setRSVP = (
  userID: User["userID"],
  guest: Guest,
  value: number | null,
  setGuestsList: SetGuestsList
) => {
  fetch(`${url}/updateRsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guest: { ...guest, RSVP: value }, userID }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};

const addGuests = (
  userID: User["userID"],
  newGuests: Guest[],
  setGuestsList: SetGuestsList
) => {
  fetch(`${url}/addGuests`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ guestsToAdd: newGuests, userID }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};
const fetchData = async (
  userID: User["userID"],
  setGuestsList: SetGuestsList
) => {
  try {
    const response = await fetch(`${url}/guestsList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID }),
    });

    console.log("Response:", response);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data:", data); // Debugging step
    setGuestsList(data);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Error connecting to the server. Please try again later.");
  }
};

const sendMessage = (
  userID: User["userID"],
  message: string,
  filterOptions: string[]
) => {
  return fetch(`${url}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID,
      message,
      filterOptions,
    }),
  }).catch((err) => console.log(err));
};
const checkAvailableSMS = () => {
  return fetch(`${url}/checkAvailableSMS`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((json) => json.count)
    .catch((err) => console.log(err));
};

const deleteUser = (userID: User["userID"]) => {
  fetch(`${url}/deleteUser`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID }),
  })
    .then((response) => response.json())
    .catch((err) => console.log(err));
};
export const httpRequests = {
  deleteAllGuests,
  deleteGuest,
  setRSVP,
  addGuests,
  fetchData,
  sendMessage,
  addUser,
  checkAvailableSMS,
  deleteUser,
};
