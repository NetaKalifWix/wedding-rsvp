import { Guest, SetGuestsList, User, WeddingDetails } from "./types";

const url = process.env.REACT_APP_SERVER_URL;

const addUser = async (newUser: User) => {
  try {
    const response = await fetch(`${url}/addUser`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    });
    await response.json();
  } catch (err) {
    console.log(err);
  }
};

const deleteAllGuests = async (
  userID: User["userID"],
  setGuestsList: (newGuestList: Guest[]) => void
) => {
  const confirmed = window.confirm(
    "Are you sure you want to reset the guests list? this action will remove all guests"
  );
  if (confirmed) {
    try {
      const response = await fetch(`${url}/deleteAllGuests`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID }),
      });
      const updatedGuestsList = await response.json();
      setGuestsList(updatedGuestsList);
    } catch (err) {
      console.log(err);
    }
  }
};

const deleteGuest = async (
  userID: User["userID"],
  guest: Guest,
  setGuestsList: SetGuestsList
) => {
  try {
    const response = await fetch(`${url}/deleteGuest`, {
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
    });
    const updatedGuestsList = await response.json();
    setGuestsList(updatedGuestsList);
  } catch (err) {
    console.log(err);
  }
};

const setRSVP = async (
  userID: User["userID"],
  guest: Guest,
  value: number | null,
  setGuestsList: SetGuestsList
) => {
  try {
    const response = await fetch(`${url}/updateRsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guest: { ...guest, RSVP: value }, userID }),
    });
    const updatedGuestsList: Guest[] = await response.json();
    setGuestsList(updatedGuestsList);
  } catch (err) {
    console.log(err);
  }
};

const addGuests = async (
  userID: User["userID"],
  newGuests: Guest[],
  setGuestsList: SetGuestsList
) => {
  try {
    const response = await fetch(`${url}/addGuests`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guestsToAdd: newGuests, userID }),
    });
    const updatedGuestsList: Guest[] = await response.json();
    setGuestsList(updatedGuestsList);
  } catch (err) {
    console.log(err);
  }
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
  msgData:
    | { type: "template"; data: WeddingDetails }
    | { type: "freeText"; text: string },
  filterOptions: string[],
  imageFile?: File | undefined
) => {
  const formData = new FormData();
  formData.append("userID", userID);

  if (msgData.type === "template") {
    formData.append("messageType", "template");
    formData.append("templateData", JSON.stringify(msgData.data));
  } else {
    formData.append("messageType", "freeText");
    formData.append("message", msgData.text);
  }

  formData.append("filterOptions", JSON.stringify(filterOptions));

  if (imageFile) {
    formData.append("imageFile", imageFile);
  }

  return fetch(`${url}/sendMessage`, {
    method: "POST",
    body: formData,
  }).catch((err) => console.log(err));
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
  deleteUser,
};
