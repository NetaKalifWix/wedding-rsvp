import "./css/GuestsList.css";
import {
  FilterOptions,
  Guest,
  RsvpStatus,
  SetGuestsList,
  User,
} from "../../types";

import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  NumberInput,
  Table,
  Modal,
  Box,
  Text,
} from "@wix/design-system";
import { Check, ChevronDown, ChevronUp, Clock, Trash2, X } from "lucide-react";
import { filterGuests, getRsvpStatus } from "./logic";
import { httpRequests } from "../../httpClient";
import SearchAndFilterBar from "./SearchAndFilterBar";
interface GuestTableProps {
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
  userID: User["userID"];
}

const GuestTable: React.FC<GuestTableProps> = ({
  guestsList,
  setGuestsList,
  userID,
}) => {
  const onDeleteGuest = async (guest: Guest) => {
    const updatedGuestsList = await httpRequests.deleteGuest(userID, guest);
    setGuestsList(updatedGuestsList);
  };

  const [sortField, setSortField] = useState<keyof Guest>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    whose: [],
    circle: [],
    rsvpStatus: [],
    searchTerm: "",
  });
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const [messageGroupModal, setMessageGroupModal] = useState<{
    isOpen: boolean;
    guest: Guest | null;
    value: number | undefined;
  }>({ isOpen: false, guest: null, value: undefined });
  const [rsvpModal, setRsvpModal] = useState<{
    isOpen: boolean;
    guest: Guest | null;
    value: number | undefined;
  }>({ isOpen: false, guest: null, value: undefined });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const filteredGuests = filterGuests(guestsList, filterOptions);
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];

    if (fieldA === undefined && fieldB === undefined) {
      return 0;
    } else if (fieldA === undefined) {
      return 1;
    } else if (fieldB === undefined) {
      return -1;
    }

    if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1;
    if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const renderSortIcon = (field: keyof Guest) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp /> : <ChevronDown />;
  };
  const handleSort = (field: keyof Guest) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleMessageGroupSave = async () => {
    if (!messageGroupModal.guest) return;

    const updatedGuests = guestsList.map((g) => {
      if (
        g.name === messageGroupModal.guest!.name &&
        g.phone === messageGroupModal.guest!.phone
      ) {
        return {
          ...g,
          messageGroup: messageGroupModal.value,
        };
      }
      return g;
    });
    setGuestsList(updatedGuests);
    setMessageGroupModal({ isOpen: false, guest: null, value: undefined });

    const updatedGuestsList = await httpRequests.updateGuestsGroups(
      userID,
      updatedGuests,
      guestsList
    );
    setGuestsList(updatedGuestsList);
  };

  const handleRsvpSave = async () => {
    if (!rsvpModal.guest) return;

    const updatedGuests = guestsList.map((g) => {
      if (
        g.name === rsvpModal.guest!.name &&
        g.phone === rsvpModal.guest!.phone
      ) {
        return {
          ...g,
          RSVP: rsvpModal.value,
        };
      }
      return g;
    });
    setGuestsList(updatedGuests);
    setRsvpModal({ isOpen: false, guest: null, value: undefined });

    const updatedGuestsList = await httpRequests.setRSVP(
      userID,
      rsvpModal.guest,
      rsvpModal.value ?? null,
      guestsList
    );
    setGuestsList(updatedGuestsList);
  };

  const renderRsvpStatus = (status: RsvpStatus) => {
    switch (status) {
      case "confirmed":
        return isMobile ? (
          <Check color="green" />
        ) : (
          <Badge uppercase="false" skin="neutralSuccess">
            מאושר
          </Badge>
        );
      case "declined":
        return isMobile ? (
          <X color="red" />
        ) : (
          <Badge uppercase="false" skin="neutralDanger">
            סירוב
          </Badge>
        );
      default:
        return isMobile ? (
          <Clock color="orange" />
        ) : (
          <Badge uppercase="false" skin="warningLight">
            ממתין
          </Badge>
        );
    }
  };
  const columns = [
    {
      title: (
        <span onClick={() => handleSort("name")}>
          שם {renderSortIcon("name")}
        </span>
      ),
      render: (row: Guest) => row.name,
      showOnMobile: true,
    },
    {
      title: <span>טלפון {renderSortIcon("phone")}</span>,
      render: (row: Guest) => row.phone,
      showOnMobile: false,
    },
    {
      title: (
        <span onClick={() => handleSort("whose")}>
          מוזמן ע״י {renderSortIcon("whose")}
        </span>
      ),
      render: (row: Guest) => row.whose,
      showOnMobile: false,
    },
    {
      title: (
        <span onClick={() => handleSort("circle")}>
          מעגל {renderSortIcon("circle")}
        </span>
      ),
      render: (row: Guest) => row.circle,
      showOnMobile: false,
    },
    {
      title: <span>סטטוס אישור</span>,
      render: (row: Guest) => renderRsvpStatus(getRsvpStatus(row.RSVP)),
      showOnMobile: true,
    },
    {
      title: (
        <span onClick={() => handleSort("RSVP")}>
          מספר מאושרים {renderSortIcon("RSVP")}
        </span>
      ),
      render: (row: Guest) => (
        <Badge
          skin={
            row.RSVP === undefined || row.RSVP === null
              ? "warningLight"
              : row.RSVP > 0
              ? "neutralSuccess"
              : "neutralDanger"
          }
          onClick={() =>
            setRsvpModal({
              isOpen: true,
              guest: row,
              value: row.RSVP,
            })
          }
          style={{ cursor: "pointer" }}
        >
          {row.RSVP ?? "P"}
        </Badge>
      ),
      showOnMobile: true,
    },
    {
      title: <span>מספר אורחים</span>,
      render: (row: Guest) => row.numberOfGuests,
      showOnMobile: true,
    },
    {
      title: (
        <span onClick={() => handleSort("messageGroup")}>
          קבוצת הודעות {renderSortIcon("messageGroup")}
        </span>
      ),
      render: (row: Guest) => (
        <Badge
          skin={row.messageGroup ? "neutralStandard" : "neutralLight"}
          onClick={() =>
            setMessageGroupModal({
              isOpen: true,
              guest: row,
              value: row.messageGroup,
            })
          }
          style={{ cursor: "pointer" }}
        >
          {row.messageGroup ?? "לא שויך"}
        </Badge>
      ),
      showOnMobile: true,
    },
    {
      title: "פעולות",
      render: (row: Guest) => (
        <Button
          onClick={() => onDeleteGuest(row)}
          skin="destructive"
          size="small"
        >
          <Trash2 />
        </Button>
      ),
      showOnMobile: false,
    },
  ];

  const mobileColumns = columns.filter((column) => column.showOnMobile);

  return (
    <div className="guest-list-container">
      <SearchAndFilterBar
        guestsList={guestsList}
        setFilterOptions={setFilterOptions}
        filterOptions={filterOptions}
      />
      <Table
        data={sortedGuests}
        columns={isMobile ? mobileColumns : columns}
        rowVerticalPadding="medium"
      >
        <Table.Content />
      </Table>
      <div className="number-of-guests-shown">
        מציג {sortedGuests.length} מתוך {guestsList.length} אורחים
      </div>

      <Modal
        isOpen={messageGroupModal.isOpen}
        onRequestClose={() =>
          setMessageGroupModal({ isOpen: false, guest: null, value: undefined })
        }
        shouldCloseOnOverlayClick
      >
        <Box
          background="WHITE"
          borderRadius="10px"
          direction="vertical"
          gap="16px"
          padding="24px"
          align="center"
        >
          <Text weight="bold" size="medium">
            שינוי קבוצת הודעות עבור {messageGroupModal.guest?.name}
          </Text>
          <NumberInput
            value={messageGroupModal.value}
            onChange={(value) =>
              setMessageGroupModal((prev) => ({
                ...prev,
                value: value ?? undefined,
              }))
            }
            min={1}
            placeholder="הזן מספר קבוצה"
            size="medium"
          />
          <Box direction="horizontal" gap="12px">
            <Button onClick={handleMessageGroupSave} size="small">
              שמירה
            </Button>
            <Button
              onClick={() =>
                setMessageGroupModal({
                  isOpen: false,
                  guest: null,
                  value: undefined,
                })
              }
              priority="secondary"
              size="small"
            >
              ביטול
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal
        isOpen={rsvpModal.isOpen}
        onRequestClose={() =>
          setRsvpModal({ isOpen: false, guest: null, value: undefined })
        }
        shouldCloseOnOverlayClick
      >
        <Box
          background="WHITE"
          borderRadius="10px"
          direction="vertical"
          gap="16px"
          padding="24px"
          align="center"
        >
          <Text weight="bold" size="medium">
            שינוי מספר מאושרים עבור {rsvpModal.guest?.name}
          </Text>
          <NumberInput
            value={rsvpModal.value}
            onChange={(value) =>
              setRsvpModal((prev) => ({
                ...prev,
                value: value ?? undefined,
              }))
            }
            min={0}
            placeholder="הזן מספר מאושרים"
            size="medium"
          />
          <Box direction="horizontal" gap="12px">
            <Button onClick={handleRsvpSave} size="small">
              שמירה
            </Button>
            <Button
              onClick={() =>
                setRsvpModal({
                  isOpen: false,
                  guest: null,
                  value: undefined,
                })
              }
              priority="secondary"
              size="small"
            >
              ביטול
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default GuestTable;
