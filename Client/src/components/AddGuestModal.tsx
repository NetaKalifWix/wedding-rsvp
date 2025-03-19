import { useState } from "react";
import "./css/AddGuestModal.css";
import * as XLSX from "xlsx";
import { validatePhoneNumber } from "./logic";
import { Button } from "@wix/design-system";
import { Guest, SetGuestsList } from "../types";
import React from "react";
import { httpRequests } from "./httpClient";

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
  const [invitationName, setInvitationName] = useState<string>("");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(0);
  const [phone, setPhone] = useState<string>("");
  const [whose, setWhose] = useState<string>("");
  const [circle, setCircle] = useState<string>("");
  const [rsvp, setRsvp] = useState<number>();
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
    httpRequests.addGuest(
      {
        Name: name,
        InvitationName: invitationName,
        Phone: formattedPhone,
        Whose: whose,
        Circle: circle,
        RSVP: rsvp,
        NumberOfGuests: numberOfGuests,
      },
      setGuestsList
    );
    setIsAddGuestModalOpen(false);
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
        httpRequests.addGuest({ ...row, Phone: formattedPhone }, setGuestsList);
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
              onChange={(e) => setInvitationName(e.target.value)}
              placeholder="Invitation Name"
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
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value, 10))}
              placeholder="NumberOfGuests"
            />
            <input
              onChange={(e) => setRsvp(parseInt(e.target.value, 10))}
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
              accept=".xlsx, .xls, .csv"
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
