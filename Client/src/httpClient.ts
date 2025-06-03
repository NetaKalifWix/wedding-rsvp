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

const sendMessage = (userID: User["userID"], messageGroup: number) => {
  return fetch(`${url}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID, messageGroup }),
  });
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

const saveWeddingInfo = async (formData: FormData) => {
  try {
    const response = await fetch(`${url}/saveWeddingInfo`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error("Error saving wedding information:", err);
    throw err;
  }
};

const getWeddingInfo = async (
  userID: User["userID"]
): Promise<(WeddingDetails & { imageURL: string }) | null> => {
  try {
    const response = await fetch(`${url}/getWeddingInfo/${userID}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    data.imageURL = data.fileID ? `${url}/getImage/${userID}` : undefined;
    return data;
  } catch (err) {
    console.error("Error fetching wedding information:", err);
    throw err;
  }
};

const updateGuestsGroups = async (
  userID: User["userID"],
  updatedGuests: Guest[],
  setGuestsList: SetGuestsList
) => {
  try {
    const response = await fetch(`${url}/updateGuestsGroups`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guests: updatedGuests, userID }),
    });
    const newGuestsList: Guest[] = await response.json();
    setGuestsList(newGuestsList);
  } catch (err) {
    console.log(err);
  }
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
  saveWeddingInfo,
  getWeddingInfo,
  updateGuestsGroups,
};
