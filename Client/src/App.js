import React, { useEffect, useState } from "react";
import "./App.css";
import GuestList from "./components/GuestList";
import AddGuestModal from "./components/AddGuestModal";
import TopBar from "./components/TopBar";
import QRModal from "./components/QRModal";

const url = "http://localhost:3002";

function App() {
  const [guestsList, setGuestsList] = useState([]);
  const [qrString, setQrString] = useState(""); // State to hold the QR code
  const [isAddGuestModalOpen, setIsAddGuestModalOpen] = useState(false);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

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
      {isAddGuestModalOpen && (
        <AddGuestModal
          setGuestsList={setGuestsList}
          url={url}
          setIsAddGuestModalOpen={setIsAddGuestModalOpen}
        />
      )}
      {isQRModalOpen && (
        <QRModal setIsQRModalOpen={setIsQRModalOpen} qrString={qrString} />
      )}
      <TopBar
        url={url}
        setIsAddGuestModalOpen={setIsAddGuestModalOpen}
        setGuestsList={setGuestsList}
        isAddGuestModalOpen={isAddGuestModalOpen}
        guestsList={guestsList}
        setQrString={setQrString}
        setIsQRModalOpen={setIsQRModalOpen}
      />
      <GuestList guestsList={guestsList} />
    </div>
  );
}

export default App;
