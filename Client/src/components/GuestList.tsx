import "./css/GuestsList.css";
import { FilterOptions, Guest, RsvpStatus, SetGuestsList } from "../types";

import React, { useState } from "react";
import {
  Badge,
  Button,
  Checkbox,
  FieldSet,
  Input,
  NumberInput,
  SidePanel,
  Table,
} from "@wix/design-system";
import { ChevronDown, ChevronUp, Search, Filter, Trash2 } from "lucide-react";
import { filterGuests, getRsvpStatus, getUniqueValues } from "./logic";
import { httpRequests } from "./httpClient";
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
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const invitedByOptions = getUniqueValues(guestsList, "Whose");
  const circleOptions = getUniqueValues(guestsList, "Circle");
  const rsvpStatusOptions: RsvpStatus[] = ["pending", "confirmed", "declined"];

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

  const toggleInvitedByFilter = (whose: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      whose: prev.whose.includes(whose)
        ? prev.whose.filter((item) => item !== whose)
        : [...prev.whose, whose],
    }));
  };

  const toggleCircleFilter = (circle: string) => {
    setFilterOptions((prev) => ({
      ...prev,
      circle: prev.circle.includes(circle)
        ? prev.circle.filter((item) => item !== circle)
        : [...prev.circle, circle],
    }));
  };

  const toggleRsvpStatusFilter = (status: RsvpStatus) => {
    setFilterOptions((prev) => ({
      ...prev,
      rsvpStatus: prev.rsvpStatus.includes(status)
        ? prev.rsvpStatus.filter((item) => item !== status)
        : [...prev.rsvpStatus, status],
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterOptions((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }));
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
    },
    {
      title: <span>Invitation Name</span>,
      render: (row: Guest) => row.InvitationName,
    },
    {
      title: <span>Phone {renderSortIcon("Phone")}</span>,
      render: (row: Guest) => row.Phone,
    },
    {
      title: (
        <span onClick={() => handleSort("Whose")}>
          Invited By {renderSortIcon("Whose")}
        </span>
      ),
      render: (row: Guest) => row.Whose,
    },
    {
      title: (
        <span onClick={() => handleSort("Circle")}>
          Circle {renderSortIcon("Circle")}
        </span>
      ),
      render: (row: Guest) => row.Circle,
    },
    {
      title: <span>RSVP Status </span>,
      render: (row: Guest) => renderRsvpStatus(getRsvpStatus(row.RSVP)),
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
    },
    {
      title: <span>Number Of Guests</span>,
      render: (row: Guest) => row.NumberOfGuests,
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
    },
  ];

  return (
    <div className="guest-list-container">
      <div className="search-filter-container">
        <div className="search">
          <Search />
          <Input
            placeholder="Search guests..."
            value={filterOptions.searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter">
          <Button onClick={() => setFilterPanelOpen(!filterPanelOpen)}>
            <Filter />
            Filter
          </Button>
        </div>
        {filterPanelOpen && (
          <div className="filter-panel">
            <SidePanel
              onCloseButtonClick={() => setFilterPanelOpen(false)}
              skin="floating"
              width="250px"
              height="400px"
            >
              <SidePanel.Header title="Filter Options" />
              <SidePanel.Content noPadding>
                <SidePanel.Field>
                  <FieldSet legend="invited by" direction="vertical">
                    {invitedByOptions.map((invitedBy) => (
                      <Checkbox
                        key={invitedBy}
                        checked={filterOptions.whose.includes(invitedBy)}
                        size="small"
                        onChange={() => toggleInvitedByFilter(invitedBy)}
                      >
                        {invitedBy}
                      </Checkbox>
                    ))}
                  </FieldSet>
                </SidePanel.Field>
                <SidePanel.Field>
                  <FieldSet legend="circle" direction="vertical">
                    {circleOptions.map((circle) => (
                      <Checkbox
                        key={circle}
                        checked={filterOptions.circle.includes(circle)}
                        size="small"
                        onChange={() => toggleCircleFilter(circle)}
                      >
                        {circle}
                      </Checkbox>
                    ))}
                  </FieldSet>
                </SidePanel.Field>
                <SidePanel.Field>
                  <FieldSet legend="RSVP status" direction="vertical">
                    {rsvpStatusOptions.map((status) => (
                      <Checkbox
                        key={status}
                        checked={filterOptions.rsvpStatus.includes(status)}
                        size="small"
                        onChange={() => toggleRsvpStatusFilter(status)}
                      >
                        {status}
                      </Checkbox>
                    ))}
                  </FieldSet>
                </SidePanel.Field>
              </SidePanel.Content>
            </SidePanel>
          </div>
        )}
      </div>
      <Table data={sortedGuests} columns={columns} rowVerticalPadding="medium">
        <Table.Content />
      </Table>
      <div className="number-of-guests-shown">
        Showing {sortedGuests.length} of {guestsList.length} guests
      </div>
    </div>
  );
};

export default GuestTable;
