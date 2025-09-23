import React, { useState, useEffect } from "react";
import { Modal, Button, Loader, SidePanel } from "@wix/design-system";
import { ClientLog } from "../types";
import { httpRequests } from "../httpClient";
import "./css/ViewLogsModal.css";

interface ViewLogsModalProps {
  setIsViewLogsModalOpen: (isOpen: boolean) => void;
  userID: string;
}

const ViewLogsModal: React.FC<ViewLogsModalProps> = ({
  setIsViewLogsModalOpen,
  userID,
}) => {
  const [logs, setLogs] = useState<ClientLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedLogs = await httpRequests.getLogs(userID);
        setLogs(fetchedLogs);
      } catch (err) {
        setError("Failed to fetch logs");
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [userID]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const handleClose = () => {
    setIsViewLogsModalOpen(false);
  };

  return (
    <Modal isOpen>
      <SidePanel
        onCloseButtonClick={handleClose}
        skin="floating"
        height="600px"
        width="800px"
      >
        <SidePanel.Header title="System Logs" />
        <SidePanel.Content>
          <div style={{ minHeight: "400px", maxHeight: "500px" }}>
            {loading && (
              <div className="logs-loading">
                <Loader />
              </div>
            )}

            {error && <div className="logs-error">{error}</div>}

            {!loading && !error && (
              <>
                {logs.length === 0 ? (
                  <div className="logs-empty">No logs found</div>
                ) : (
                  <div className="logs-container">
                    {logs.map((log) => (
                      <div key={log.id} className="log-entry">
                        <div className="log-header">
                          <span className="log-timestamp">
                            {formatTimestamp(log.createdAt)}
                          </span>
                          <span className="log-id">ID: {log.id}</span>
                        </div>
                        <div className="log-message">{log.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="logs-footer">
            <Button onClick={handleClose}>Close</Button>
          </div>
        </SidePanel.Content>
      </SidePanel>
    </Modal>
  );
};

export default ViewLogsModal;
