import "./css/GuestsList.css";
import { FilterOptions, Guest, RsvpStatus, SetGuestsList } from "../types";

import React, { useEffect, useState } from "react";
import { Badge, Button, NumberInput, Table } from "@wix/design-system";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { filterGuests, getRsvpStatus } from "./logic";
import { httpRequests } from "../httpClient";
import SearchAndFilterBar from "./SearchAndFilterBar";
interface GuestTableProps {
  guestsList: Guest[];
  setGuestsList: SetGuestsList;
}

const GuestTable: React.FC<GuestTableProps> = ({
  guestsList,
  setGuestsList,
}) => {
  const onDeleteGuest = (guest: Guest) => {
    httpRequests.deleteGuest(guest, setGuestsList);
  };
  const [sortField, setSortField] = useState<keyof Guest>("Name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    whose: [],
    circle: [],
    rsvpStatus: [],
    searchTerm: "",
  });
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);

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

  const renderRsvpStatus = (status: RsvpStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge uppercase="false" skin="neutralSuccess">
            Confirmed
          </Badge>
        );
      case "declined":
        return (
          <Badge uppercase="false" skin="neutralDanger">
            Declined
          </Badge>
        );
      default:
        return (
          <Badge uppercase="false" skin="warningLight">
            Pending
          </Badge>
        );
    }
  };
  const columns = [
    {
      title: (
        <span onClick={() => handleSort("Name")}>
          Name {renderSortIcon("Name")}
        </span>
      ),
      render: (row: Guest) => row.Name,
      showOnMobile: true,
    },
    {
      title: <span>Invitation Name</span>,
      render: (row: Guest) => row.InvitationName,
      showOnMobile: false,
    },
    {
      title: <span>Phone {renderSortIcon("Phone")}</span>,
      render: (row: Guest) => row.Phone,
      showOnMobile: false,
    },
    {
      title: (
        <span onClick={() => handleSort("Whose")}>
          Invited By {renderSortIcon("Whose")}
        </span>
      ),
      render: (row: Guest) => row.Whose,
      showOnMobile: true,
    },
    {
      title: (
        <span onClick={() => handleSort("Circle")}>
          Circle {renderSortIcon("Circle")}
        </span>
      ),
      render: (row: Guest) => row.Circle,
      showOnMobile: false,
    },
    {
      title: <span>RSVP Status </span>,
      render: (row: Guest) => renderRsvpStatus(getRsvpStatus(row.RSVP)),
      showOnMobile: true,
    },
    {
      title: (
        <span onClick={() => handleSort("RSVP")}>
          RSVP Number {renderSortIcon("RSVP")}
        </span>
      ),
      render: (row: Guest) => (
        <NumberInput
          onChange={(value) => httpRequests.setRSVP(row, value, setGuestsList)}
          border="round"
          placeholder={`${row.RSVP ?? "pending"}`}
          value={row.RSVP}
          min={0}
          size="small"
        />
      ),
      showOnMobile: true,
    },
    {
      title: <span>Number Of Guests</span>,
      render: (row: Guest) => row.NumberOfGuests,
      showOnMobile: true,
    },
    {
      title: "Actions",
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
        Showing {sortedGuests.length} of {guestsList.length} guests
      </div>
    </div>
  );
};

export default GuestTable;
