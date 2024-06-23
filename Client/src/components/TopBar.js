import "./css/TopBar.css";
import * as XLSX from "xlsx";

const TopBar = ({
  setIsAddGuestModalOpen,
  url,
  setGuestsList,
  isAddGuestModalOpen,
  guestsList,
  setQrString,
  setIsQRModalOpen,
}) => {
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

  const handleSendRSVP = () => {
    const confirmed = window.confirm(
      "Are you sure you want to send RSVP? this action will will send whatsapp messages to al of the guests"
    );
    if (confirmed) {
      fetch(`${url}/sendRSVPInvitations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.text(); // Read the response body as text
          }
          throw new Error("Network response was not ok.");
        })
        .then((qrString) => {
          console.log("QR code string:", qrString);
          setQrString(qrString);
          setIsQRModalOpen(true);
        })
        .catch((err) => console.log(err));
    }
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
      <button className="topBarButton" onClick={handleSendRSVP}>
        send RSVP
      </button>
      <button className="topBarButton" onClick={handleDeleteAllGuests}>
        remove all guests
      </button>
    </div>
  );
};

export default TopBar;
