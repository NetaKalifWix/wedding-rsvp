import { Guest, SetGuestsList, User } from "./types";

const userID = "206619405";
const url = process.env.REACT_APP_SERVER_URL;

const addUser = (newUser: User, setGuestsList: SetGuestsList) => {
  fetch(`${url}/addUser`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newUser }),
  })
    .then((response) => response.json())
    .then((updatedGuestsList: Guest[]) => {
      setGuestsList(updatedGuestsList);
    })
    .catch((err) => console.log(err));
};
const deleteAllGuests = (setGuestsList: (newGuestList: Guest[]) => void) => {
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
const deleteGuest = (guest: Guest, setGuestsList: SetGuestsList) => {
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

const addGuests = (newGuests: Guest[], setGuestsList: SetGuestsList) => {
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
const fetchData = async (setGuestsList: SetGuestsList) => {
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

// const fetchData = async (setGuestsList: SetGuestsList) => {
//   try {
//     fetch(`${url}/guestsList`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ userID }),
//     })
//       .then((response) => {
//         console.log(response);
//         return response.json();
//       })
//       .then((updatedGuestsList: Guest[]) => {
//         setGuestsList(updatedGuestsList);
//       })
//       .catch((err) => console.log(err));
//     // console.log(response);

//     // if (!response.ok) {
//     //   throw new Error(`HTTP error! Status: ${response.status}`);
//     // }

//     // const data = await response.json();
//     // setGuestsList(data);
//   } catch (error) {
//     alert("Error connecting to the server. Please try again later.");
//   }
// };

const sendMessage = (message: string, filterOption: string[]) => {
  return fetch(`${url}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userID,
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
  addUser,
};
