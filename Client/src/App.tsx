import React, { useEffect, useState } from "react";
import "./App.css";
import GuestList from "./components/GuestList";
import AddGuestModal from "./components/AddGuestModal";
import ControlPanel from "./components/ControlPanel";
import SendMessageModal from "./components/SendMessageModal";
import "@wix/design-system/styles.global.css";
import { Guest } from "./types";

const url = "http://localhost:3002";

function App() {
  const [guestsList, setGuestsList] = useState<Guest[]>([]);
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);
  const [isEditMessageModalOpen, setIsEditMessageModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${url}/guestsList`);
        const data = await response.json();
        setGuestsList(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="App">
      <h1> Wedding RSVP Dashboard</h1>
      {isAddGuestModalOpen && (
        <AddGuestModal
          setGuestsList={setGuestsList}
          url={url}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
          guestsList={guestsList}
        />
      )}
      {isEditMessageModalOpen && (
        <SendMessageModal
          setIsEditMessageModalOpen={setIsEditMessageModalOpen}
          url={url}
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
