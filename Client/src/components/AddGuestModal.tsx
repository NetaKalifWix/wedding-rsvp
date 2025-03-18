import { useState } from "react";
import "./css/AddGuestModal.css";
import * as XLSX from "xlsx";
import { validatePhoneNumber } from "./logic";
import { Button } from "@wix/design-system";
import { Guest, SetGuestsList } from "../types";
import React from "react";
import { addGuest } from "./httpClient";

interface AddGuestModalProps {
  setGuestsList: SetGuestsList;
  guestsList: Guest[];
  url: string;
  setIsAddGuestModalOpen: (isOpen: boolean) => void;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({
  setGuestsList,
  guestsList,
  url,
  setIsAddGuestModalOpen,
}) => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [whose, setWhose] = useState<string>("");
  const [circle, setCircle] = useState<string>("");
  const [rsvp, setRsvp] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<boolean>(false);
  const [fillManually, setFillManually] = useState<boolean>(false);
  const [showButtonOptions, setShowButtonOptions] = useState<boolean>(true);
  const [file, setFile] = useState<File | null>(null);

  const handleCloseModal = () => {
    setIsAddGuestModalOpen(false);
  };

  const handleSubmitManually = (e: React.FormEvent) => {
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
      .then((updatedGuestsList: Guest[]) => {
        setGuestsList(updatedGuestsList);
        setIsAddGuestModalOpen(false);
      })
      .catch((err) => console.log(err));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Must choose a file!");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      if (!event.target?.result) return;
      const data = new Uint8Array(event.target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Guest[] = XLSX.utils.sheet_to_json(worksheet);

      json.forEach((row) => {
        if (!row.Name) {
          return;
        }
        const formattedPhone = validatePhoneNumber(row.Phone, guestsList);
        if (!formattedPhone) {
          return;
        }
        addGuest({ ...row, Phone: formattedPhone }, setGuestsList);
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
              Fill manually
            </button>
            <Button />
            <button
              className="chooseInputButton"
              onClick={() => {
                setUploadFile(true);
                setShowButtonOptions(false);
              }}
            >
              Upload Excel file
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
              onChange={(e) => setRsvp(e.target.value)}
              placeholder="RSVP?"
            />
            <button className="addGuestButton" onClick={handleSubmitManually}>
              Add Guest
            </button>
          </form>
        )}
        {uploadFile && (
          <div className="fileUploadContainer">
            <p>
              Please make sure that your Excel file has 5 columns with the
              titles: "Name", "Phone", "Whose", "Circle", "RSVP"
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
