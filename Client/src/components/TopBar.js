import { useState } from "react";
import "./css/TopBar.css";
import * as XLSX from "xlsx";

const TopBar = ({
  setIsAddGuestModalOpen,
  url,
  setGuestsList,
  isAddGuestModalOpen,
  guestsList,
  setIsEditMessageModalOpen,
  setIsQRModalOpen,
  setQrString,
}) => {
  const [isConnectedToQR, setIsConnectedToQR] = useState(false);
  const checkIfConnectedToQR = () =>
    fetch(`${url}/isConnectedToQR`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsConnectedToQR(data.isConnectedToQR);
      });
  checkIfConnectedToQR();
  const handleDeleteAllGuests = () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the guests list? this action will remove all guests"
    );
    if (confirmed) {
      fetch(`${url}/resetDatabase`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((updatedGuestsList) => {
          setGuestsList(updatedGuestsList);
        })
        .catch((err) => console.log(err));
    }
  };
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(guestsList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guests");
    XLSX.writeFile(wb, "guestsListUpdated.xlsx");
  };
  const handleConnectToBot = () => {
    fetch(`${url}/connectToBot`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          checkIfConnectedToQR();
          return response.text(); // Read the response body as text
        }
        throw new Error("Network response was not ok.");
      })
      .then((qrString) => {
        setQrString(qrString);
        setIsQRModalOpen(true);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="topBar">
      <button
        className="topBarButton"
        onClick={() => setIsAddGuestModalOpen(!isAddGuestModalOpen)}
      >
        add guest
      </button>
      <button className="topBarButton" onClick={handleExport}>
        export data to excel
      </button>
      <button
        className={`topBarButton ${isConnectedToQR ? "disabled" : ""}`}
        onClick={handleConnectToBot}
        disabled={isConnectedToQR}
      >
        connect to the bot
      </button>
      <button
        className="topBarButton"
        onClick={() => {
          if (!isConnectedToQR) {
            alert("you have to connect to the bot before sending messages");
          }
          setIsEditMessageModalOpen(true);
        }}
      >
        send message
      </button>
      <button className="topBarButton" onClick={handleDeleteAllGuests}>
        remove all guests
      </button>
    </div>
  );
};

export default TopBar;
