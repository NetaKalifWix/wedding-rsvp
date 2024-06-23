import React, { useState, useEffect } from "react";
import "./css/GuestsList.css";
const GuestList = ({ guestsList }) => {
  const ddOptionsRSVP = ["All", "No RSVP"];
  const ddOptionsWhose = ["All", "neta", "yoav"];

  const [filterOptionRSVP, setFilterOptionRSVP] = useState(ddOptionsRSVP[0]);
  const [filterOptionWhose, setFilterOptionWhose] = useState(ddOptionsWhose[0]);
  const [guestListToShow, setGuestsListToShow] = useState(guestsList);

  useEffect(() => {
    handleApplyFilter();
  }, [guestsList, filterOptionRSVP, filterOptionWhose]);

  const handleRSVPFilterChange = (e) => {
    setFilterOptionRSVP(e.target.value);
  };
  const handleWhoseFilterChange = (e) => {
    setFilterOptionWhose(e.target.value);
  };

  const handleApplyFilter = () => {
    let filteredGuests = guestsList;
    filteredGuests = filteredGuests.filter((guest) => {
      if (filterOptionWhose === ddOptionsWhose[0]) return true;
      return guest.Whose === filterOptionWhose;
    });
    filteredGuests = filteredGuests.filter((guest) => {
      if (filterOptionRSVP === ddOptionsRSVP[0]) return true;
      return !guest.RSVP;
    });
    setGuestsListToShow(filteredGuests);
  };

  return (
    <div className="guestsListContainer">
      <h2>Guest List</h2>
      <div className="filterContainer">
        <label htmlFor="filterGuests">Filter guests by RSVP:</label>
        <select
          id="filterGuestsRSVP"
          onChange={handleRSVPFilterChange}
          value={filterOptionRSVP}
        >
          {ddOptionsRSVP.map((option) => (
            <option value={option}>{option}</option>
          ))}
        </select>
        <label htmlFor="filterGuests">Filter guests who invited by:</label>
        <select
          id="filterGuestsWhose"
          onChange={handleWhoseFilterChange}
          value={filterOptionWhose}
        >
          {ddOptionsWhose.map((option) => (
            <option value={option}>{option}</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Invited By</th>
            <th>RSVP</th>
          </tr>
        </thead>
        <tbody>
          {guestListToShow.map((guest, index) => (
            <tr key={index}>
              <td>{guest.Name}</td>
              <td>{guest.Phone}</td>
              <td>{guest.Whose}</td>
              <td>{guest.RSVP}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestList;
