import { useState } from "react";
import "./css/AddGuestModal.css";
import * as XLSX from "xlsx";
import { validatePhoneNumber } from "./logic";
import { Button } from "@wix/design-system";

const AddGuestModal = (props) => {
  const { setGuestsList, guestsList, url, setIsAddGuestModalOpen } = props;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whose, setWhose] = useState("");
  const [circle, setCircle] = useState("");
  const [rsvp, setrsvp] = useState("");
  const [uploadFile, setUploadFile] = useState(false);
  const [fillManually, setFillManually] = useState(false);
  const [showButtonOptions, setShowButtonOptions] = useState(true);
  const [file, setFile] = useState(null);

  const handleCloseModal = () => {
    setIsAddGuestModalOpen(false);
  };

  const handleSubmitManually = (e) => {
    e.preventDefault();
    const formattedPhone = validatePhoneNumber(phone, guestsList);
    if (!formattedPhone) {
      return;
    }

    fetch(`${url}/add`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Name: name,
        Phone: formattedPhone,
        Whose: whose,
        Circle: circle,
        RSVP: rsvp,
      }),
    })
      .then((response) => response.json())
      .then((updatedGuestsList) => {
        setGuestsList(updatedGuestsList);
        setIsAddGuestModalOpen(false);
      })
      .catch((err) => console.log(err));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!file) {
      alert("must choose a file!");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      json.forEach((row) => {
        if (!row.Name) {
          return;
        }
        const formattedPhone = validatePhoneNumber(row.Phone, guestsList);
        if (!formattedPhone) {
          return;
        }
        fetch(`${url}/add`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Name: row.Name,
            Phone: formattedPhone,
            Whose: row.Whose,
            Circle: row.Circle,
            RSVP: row.RSVP,
          }),
        })
          .then((response) => response.json())
          .then((updatedGuestsList) => {
            setGuestsList(updatedGuestsList);
          })
          .catch((err) => console.log(err));
      });
    };

    reader.readAsArrayBuffer(file);
    setIsAddGuestModalOpen(false);
  };

  return (
    <div className="addGuestModal">
      <button className="closeButton" onClick={handleCloseModal}>
        Close
      </button>
      <div className="addGuestContent">
        {showButtonOptions && (
          <div className="addGuestButtonsContainer">
            <button
              className="chooseInputButton"
              onClick={() => {
                setFillManually(true);
                setShowButtonOptions(false);
              }}
            >
              fill manually
            </button>
            <Button />
            <button
              className="chooseInputButton"
              onClick={() => {
                setUploadFile(true);
                setShowButtonOptions(false);
              }}
            >
              upload excel file
            </button>
          </div>
        )}
        {fillManually && (
          <form className="addGuestForm">
            <input
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <input
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
            <input
              onChange={(e) => setWhose(e.target.value)}
              placeholder="Whose"
            />
            <input
              onChange={(e) => setCircle(e.target.value)}
              placeholder="Circle"
            />
            <input
              onChange={(e) => setrsvp(e.target.value)}
              placeholder="RSVP?"
            />
            <button
              className="addGuestButton"
              onClick={(e) => handleSubmitManually(e)}
            >
              Add Guest
            </button>
          </form>
        )}
        {uploadFile && (
          <div className="fileUploadContainer">
            <p>
              please make sure that your excel file has 4 columns with the
              titles:"Name", "Phone", "Whose","Circle","RSVP"
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
            <button className="addGuestButton" onClick={handleFileUpload}>
              Add Guests
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddGuestModal;
