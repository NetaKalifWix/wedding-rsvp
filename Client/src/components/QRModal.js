import "./css/QRModal.css";
import QRCode from "qrcode.react";

const QRModal = ({ qrString, setIsQRModalOpen }) => {
  return (
    <div className="QRModal">
      <button className="closeButton" onClick={() => setIsQRModalOpen(false)}>
        Close
      </button>
      <div className="QRContent">
        <p>
          open whatsApp from your device and scan the code. once you will scan
          the code, the rsvp message will be sent to all the guests in the list
        </p>
        <QRCode value={qrString} />
      </div>
    </div>
  );
};

export default QRModal;
