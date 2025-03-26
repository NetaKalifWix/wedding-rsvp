import React, { useEffect, useState } from "react";
import "./App.css";
import GuestList from "./components/GuestList";
import AddGuestModal from "./components/AddGuestModal";
import ControlPanel from "./components/ControlPanel";
import SendMessageModal from "./components/SendMessageModal";
import "@wix/design-system/styles.global.css";
import { Guest } from "./types";
import { httpRequests } from "./httpClient";

function App() {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isEditMessageModalOpen, setIsSendMessageModalOpen] = useState(false);

  useEffect(() => {
    httpRequests.fetchData(setGuestsList);
  }, []);

  return (
    <div className="App">
      <h1> Wedding RSVP Dashboard</h1>
      <button
        onClick={() =>
          httpRequests.addUser(
            {
              name: "neta1",
              email: "neta1019@gmail.com",
              userID: "111",
            },
            setGuestsList
          )
        }
      >
        add user check
      </button>
      <button onClick={() => httpRequests.fetchData(setGuestsList)}>
        update guest list
      </button>
      {isAddGuestModalOpen && (
        <AddGuestModal
          setGuestsList={setGuestsList}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          guestsList={guestsList}
        />
      )}
      {isEditMessageModalOpen && (
        <SendMessageModal
          setIsSendMessageModalOpen={setIsSendMessageModalOpen}
          guestsList={guestsList}
        />
      )}
      <ControlPanel
        setIsAddGuestModalOpen={setIsAddGuestModalOpen}
        setGuestsList={setGuestsList}
        guestsList={guestsList}
        setIsSendMessageModalOpen={setIsSendMessageModalOpen}
      />
      <GuestList guestsList={guestsList} setGuestsList={setGuestsList} />
    </div>
  );
}

export default App;
