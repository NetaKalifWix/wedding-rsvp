import "./css/GuestsList.css";
import { FilterOptions, Guest, RsvpStatus } from "../types";

import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FieldSet,
  Input,
  SidePanel,
  Text,
} from "@wix/design-system";
import { getCirclesValues, getUniqueValues } from "./logic";
import { Filter, Search } from "lucide-react";
interface SearchAndFilterBarProps {
  guestsList: Guest[];
  filterOptions: FilterOptions;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
}

const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  guestsList,
  setFilterOptions,
  filterOptions,
}) => {
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const invitedByOptions = getUniqueValues(guestsList, "whose");
  const circleOptions = getCirclesValues(guestsList);
  const rsvpStatusOptions: RsvpStatus[] = ["pending", "confirmed", "declined"];

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

  return (
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
                  {filterOptions.whose.length > 0 ? (
                    filterOptions.whose.map((invitedBy) => (
                      <FieldSet
                        legend={invitedBy}
                        direction="vertical"
                        key={invitedBy}
                      >
                        <Box direction="vertical" alignContent="start">
                          {circleOptions[invitedBy]?.map((circle: string) => (
                            <Checkbox
                              key={circle}
                              checked={filterOptions.circle.includes(circle)}
                              size="small"
                              onChange={() => toggleCircleFilter(circle)}
                            >
                              {circle}
                            </Checkbox>
                          ))}
                        </Box>
                      </FieldSet>
                    ))
                  ) : (
                    <Text size="small">
                      Select invited by to filter circles
                    </Text>
                  )}
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
  );
};

export default SearchAndFilterBar;
