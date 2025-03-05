import React, { useState, useEffect } from "react";
import "./css/GuestsList.css";
import GuestListItem from "./GuestListItem";
const GuestList = ({ guestsList, setGuestsList, url }) => {
  const ddOptionsRSVP = ["All", "No RSVP", "RSVP > 0"];
  const uniqueWhoseValues = [
    ...new Set(guestsList.map((guest) => guest.Whose)),
  ];
  const ddOptionsWhose = ["All", ...uniqueWhoseValues];

  const [filterOptionRSVP, setFilterOptionRSVP] = useState(ddOptionsRSVP[0]);
  const [filterOptionWhose, setFilterOptionWhose] = useState(ddOptionsWhose[0]);
  const [guestListToShow, setGuestsListToShow] = useState(guestsList);

  useEffect(() => {
    handleApplyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      else if (filterOptionRSVP === ddOptionsRSVP[1]) return !guest.RSVP;
      else return guest.RSVP;
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
          {guestListToShow.map((guest, index) => {
            return (
              <GuestListItem
                guest={guest}
                index={index}
                url={url}
                setGuestsList={setGuestsList}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GuestList;
