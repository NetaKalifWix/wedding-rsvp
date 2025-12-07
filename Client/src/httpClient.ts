import { Guest, SetGuestsList, User, WeddingDetails, ClientLog } from "./types";

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
  setGuestsList: SetGuestsList,
  oldGuestsList: Guest[]
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
    setGuestsList(oldGuestsList);
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

    if (!response.ok) {
      alert("error fetching data from server");
    }

    const data = await response.json();
    setGuestsList(data);
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Error connecting to the server. Please try again later.");
  }
};

const sendMessage = (
  userID: User["userID"],
  options?: { messageGroup?: number; messageType?: string; customText?: string }
) => {
  return fetch(`${url}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID, options }),
  });
};

const deleteUser = (userID: User["userID"]) => {
  fetch(`${url}/deleteUser`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userID }),
  }).catch((err) => console.log(err));
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
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data) {
      return null;
    }
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
  setGuestsList: SetGuestsList,
  oldGuestsList: Guest[]
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
    setGuestsList(oldGuestsList);
  }
};

const addLog = async (userID: string, message: string) => {
  try {
    const response = await fetch(`${url}/logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, message }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error("Error adding log:", err);
    throw err;
  }
};

const getLogs = async (userID: string): Promise<ClientLog[]> => {
  try {
    const response = await fetch(`${url}/logs/${userID}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const logs = await response.json();
    return logs;
  } catch (err) {
    console.error("Error fetching logs:", err);
    throw err;
  }
};

// Admin methods
const checkAdmin = async (userID: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/checkAdmin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const { isAdmin } = await response.json();
    return isAdmin;
  } catch (err) {
    console.error("Error checking admin status:", err);
    return false;
  }
};

const getUsers = async (userID: string): Promise<User[]> => {
  try {
    const response = await fetch(`${url}/getUsers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const users = await response.json();
    return users;
  } catch (err) {
    console.error("Error fetching users:", err);
    throw err;
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
  addLog,
  getLogs,
  checkAdmin,
  getUsers,
};
