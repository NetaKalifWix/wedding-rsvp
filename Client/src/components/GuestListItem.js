import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const GuestListItem = ({ guest, index, url, setGuestsList }) => {
  const [isDeleteShow, setIsDeleteShow] = useState(false);
  const handleDeleteGuest = () => {
    fetch(`${url}/deleteGuest`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: guest.Name,
        Phone: guest.Phone,
        Whose: guest.Whose,
        RSVP: guest.RSVP,
      }),
    })
      .then((response) => response.json())
      .then((updatedGuestsList) => {
        setGuestsList(updatedGuestsList);
      })
      .catch((err) => console.log(err));
  };
  return (
    <tr key={index}>
      <td
        onMouseEnter={() => setIsDeleteShow(true)}
        onMouseLeave={() => setIsDeleteShow(false)}
      >
        {isDeleteShow ? (
          <div>
            <button className="deleteGuestButton">
              <FontAwesomeIcon icon={faTrash} onClick={handleDeleteGuest} />
            </button>
            {guest.Name}
          </div>
        ) : (
          guest.Name
        )}
      </td>
      <td>{guest.Phone}</td>
      <td>{guest.Whose}</td>
      <td>{guest.RSVP}</td>
    </tr>
  );
};

export default GuestListItem;
