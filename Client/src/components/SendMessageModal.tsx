import React, { useState } from "react";
import "./css/SendMessageModal.css";
const getKeyByValue = (object: any, value: any) => {
  return Object.keys(object).find((key) => object[key] === value);
};

interface SendMessageModalProps {
  setIsEditMessageModalOpen: (value: boolean) => void;
  url: string;
}

const SendMessageModal: React.FC<SendMessageModalProps> = ({
  setIsEditMessageModalOpen,
  url,
}) => {
  const [message, setMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState("");

  const filterOptions = {
    all: "Send to all guests",
    noRsvp: "Send to guests who haven't RSVP'd yet",
    rsvp: "Send to guests that RSVP 1 and more",
  };

  const handleRadioChange = (option: any) => {
    setSelectedOption(option);
  };

  const handleSendMessage = () => {
    fetch(`${url}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        filterOption: getKeyByValue(filterOptions, selectedOption),
      }),
    })
      .then(() => {
        setIsEditMessageModalOpen(false);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="editMessageModal">
      <button
        className="closeButton"
        onClick={() => setIsEditMessageModalOpen(false)}
      >
        Close
      </button>
      <div className="editMessageContent">
        <label>
          Message to Guests:
          <p>
            please enter "***" where you want your guest name to appear <br />
            For example: Dear ***, please RSVP to my wedding. love, Neta
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
          />
        </label>
        <div className="filterOptionContent">
          {Object.values(filterOptions).map((option, index) => (
            <label key={index} className="filterOption">
              <input
                type="radio"
                name="guestFilter"
                value={option}
                checked={selectedOption === option}
                onChange={() => handleRadioChange(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <button
          onClick={() => {
            const confirmed = window.confirm(
              "Are you sure you want to send messages? This action will send WhatsApp messages to all of the guests."
            );
            if (confirmed) {
              handleSendMessage();
            }
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );
};

export default SendMessageModal;
