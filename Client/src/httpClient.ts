import {
  Guest,
  SetGuestsList,
  User,
  WeddingDetails,
  ClientLog,
  Task,
  TaskStats,
  PartnerInfo,
} from "./types";

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

// Task methods
const getTasks = async (userID: string): Promise<Task[]> => {
  try {
    const response = await fetch(`${url}/tasks/${userID}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const tasks = await response.json();
    return tasks;
  } catch (err) {
    console.error("Error fetching tasks:", err);
    throw err;
  }
};

const getTaskStats = async (userID: string): Promise<TaskStats> => {
  try {
    const response = await fetch(`${url}/tasks/${userID}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const stats = await response.json();
    return stats;
  } catch (err) {
    console.error("Error fetching task stats:", err);
    throw err;
  }
};

const addTask = async (
  userID: string,
  task: Pick<Task, "title" | "timeline_group" | "priority" | "assignee">
): Promise<Task> => {
  try {
    const response = await fetch(`${url}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, task }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const newTask = await response.json();
    return newTask;
  } catch (err) {
    console.error("Error adding task:", err);
    throw err;
  }
};

const updateTaskCompletion = async (
  userID: string,
  taskId: number,
  isCompleted: boolean
): Promise<Task> => {
  try {
    const response = await fetch(`${url}/tasks/${taskId}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, isCompleted }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const updatedTask = await response.json();
    return updatedTask;
  } catch (err) {
    console.error("Error updating task completion:", err);
    throw err;
  }
};

const updateTask = async (
  userID: string,
  taskId: number,
  updates: Partial<
    Pick<Task, "title" | "timeline_group" | "priority" | "assignee">
  >
): Promise<Task> => {
  try {
    const response = await fetch(`${url}/tasks/${taskId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, updates }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const updatedTask = await response.json();
    return updatedTask;
  } catch (err) {
    console.error("Error updating task:", err);
    throw err;
  }
};

const deleteTask = async (userID: string, taskId: number): Promise<void> => {
  try {
    const response = await fetch(`${url}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    throw err;
  }
};

// Partner/Collaboration methods
const generateInviteCode = async (userID: string): Promise<string> => {
  try {
    const response = await fetch(`${url}/partner/generate-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }
    const data = await response.json();
    return data.inviteCode;
  } catch (err) {
    console.error("Error generating invite code:", err);
    throw err;
  }
};

const acceptInvite = async (
  userID: string,
  inviteCode: string
): Promise<{ success: boolean; effectiveUserID?: string; error?: string }> => {
  try {
    const response = await fetch(`${url}/partner/accept-invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID, inviteCode }),
    });
    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || "Failed to accept invite" };
    }
    return data;
  } catch (err) {
    console.error("Error accepting invite:", err);
    return { success: false, error: "Network error" };
  }
};

const unlinkPartner = async (userID: string): Promise<boolean> => {
  try {
    const response = await fetch(`${url}/partner/unlink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    if (!response.ok) {
      throw new Error("Failed to unlink partner");
    }
    return true;
  } catch (err) {
    console.error("Error unlinking partner:", err);
    return false;
  }
};

const getPartnerInfo = async (userID: string): Promise<PartnerInfo> => {
  try {
    const response = await fetch(`${url}/partner/info/${userID}`);
    if (!response.ok) {
      throw new Error("Failed to get partner info");
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error getting partner info:", err);
    return { hasPartner: false, isLinkedAccount: false };
  }
};

const getEffectiveUserID = async (userID: string): Promise<string> => {
  try {
    const response = await fetch(`${url}/partner/effective-user/${userID}`);
    if (!response.ok) {
      throw new Error("Failed to get effective user");
    }
    const data = await response.json();
    return data.effectiveUserID;
  } catch (err) {
    console.error("Error getting effective user:", err);
    return userID; // Fallback to original userID
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
  // Task methods
  getTasks,
  getTaskStats,
  addTask,
  updateTaskCompletion,
  updateTask,
  deleteTask,
  // Partner methods
  generateInviteCode,
  acceptInvite,
  unlinkPartner,
  getPartnerInfo,
  getEffectiveUserID,
};
