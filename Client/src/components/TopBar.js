import "./css/TopBar.css";
import * as XLSX from "xlsx";

const TopBar = ({
  setIsAddGuestModalOpen,
  url,
  setGuestsList,
  isAddGuestModalOpen,
  guestsList,
  setIsEditMessageModalOpen,
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
        className="topBarButton"
        onClick={() => {
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
