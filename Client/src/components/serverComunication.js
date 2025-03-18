export const handleDeleteAllGuests = (url, setGuestsList) => {
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
