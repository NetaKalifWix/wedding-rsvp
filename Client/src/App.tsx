import React, { useEffect, useState } from "react";
import "./App.css";
import GuestList from "./components/GuestList";
import AddGuestModal from "./components/AddGuestModal";
import ControlPanel from "./components/ControlPanel";
import SendMessageModal from "./components/SendMessageModal";
import "@wix/design-system/styles.global.css";
import { Guest } from "./types";
import { httpRequests } from "./httpClient";
const url = "http://localhost:3002";

function App() {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isEditMessageModalOpen, setIsEditMessageModalOpen] = useState(false);

  useEffect(() => {
    httpRequests.fetchData(setGuestsList);
  }, []);

  return (
    <div className="App">
      <h1> Wedding RSVP Dashboard</h1>
      {isAddGuestModalOpen && (
        <AddGuestModal
          setGuestsList={setGuestsList}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          guestsList={guestsList}
        />
      )}
      {isEditMessageModalOpen && (
        <SendMessageModal
          setIsEditMessageModalOpen={setIsEditMessageModalOpen}
          guestsList={guestsList}
        />
      )}
      <ControlPanel
        url={url}
        setIsAddGuestModalOpen={setIsAddGuestModalOpen}
        setGuestsList={setGuestsList}
        guestsList={guestsList}
        setIsEditMessageModalOpen={setIsEditMessageModalOpen}
      />
      <GuestList guestsList={guestsList} setGuestsList={setGuestsList} />
    </div>
  );
}

export default App;
