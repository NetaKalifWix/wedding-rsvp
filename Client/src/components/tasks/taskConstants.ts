import { TimelineGroup, TaskPriority, TaskAssignee } from "../../types";

export const TIMELINE_GROUPS: TimelineGroup[] = [
  "Just Engaged",
  "12 Months Before",
  "9 Months Before",
  "6 Months Before",
  "3 Months Before",
  "1 Month Before",
  "1 Week Before",
  "Wedding Day Bride",
  "Wedding Day Groom",
  "Wedding Day",
];

export const TIMELINE_ICONS: Record<TimelineGroup, string> = {
  "Just Engaged": "💍",
  "12 Months Before": "📅",
  "9 Months Before": "🎯",
  "6 Months Before": "📋",
  "3 Months Before": "✉️",
  "1 Month Before": "👗",
  "1 Week Before": "🎉",
  "Wedding Day Bride": "👰‍♀️",
  "Wedding Day Groom": "🤵‍♂️",
  "Wedding Day": "💒",
};

export const TIMELINE_LABELS: Record<TimelineGroup, string> = {
  "Just Engaged": "רק התארסנו!",
  "12 Months Before": "12 חודשים לפני",
  "9 Months Before": "9 חודשים לפני",
  "6 Months Before": "6 חודשים לפני",
  "3 Months Before": "3 חודשים לפני",
  "1 Month Before": "חודש לפני",
  "1 Week Before": "שבוע לפני",
  "Wedding Day Bride": "יום החתונה - כלה",
  "Wedding Day Groom": "יום החתונה - חתן",
  "Wedding Day": "יום החתונה",
};

export const PRIORITY_LABELS: Record<
  TaskPriority,
  { label: string; color: string }
> = {
  1: { label: "גבוהה", color: "#e74c3c" },
  2: { label: "בינונית", color: "#f39c12" },
  3: { label: "נמוכה", color: "#3498db" },
};

export const getAssigneeLabel = (
  assignee: TaskAssignee,
  bride_name?: string,
  groom_name?: string
) => {
  switch (assignee) {
    case "bride":
      return bride_name ? `👰‍♀️ ${bride_name?.split(" ")[0]}` : `👰‍♀️`;
    case "groom":
      return groom_name ? `​🤵‍♂️ ​${groom_name?.split(" ")[0]}` : `​🤵‍♂️​`;
    case "both":
      return bride_name && groom_name
        ? `👫​ ​${bride_name?.split(" ")[0]} & ${groom_name?.split(" ")[0]}`
        : `👫​`;
  }
};

export const PRIORITY_OPTIONS = [
  { id: "1", value: "🔴 גבוהה" },
  { id: "2", value: "🟡 בינונית" },
  { id: "3", value: "🔵 נמוכה" },
];

export const getTimelineOptions = () =>
  TIMELINE_GROUPS.map((group) => ({
    id: group,
    value: `${TIMELINE_ICONS[group]} ${TIMELINE_LABELS[group]}`,
  }));

export const getAssigneeOptions = (bride_name: string, groom_name: string) => {
  return [
    { id: "bride", value: `👰‍♀️ ${bride_name.split(" ")[0]}` },
    { id: "groom", value: `​🤵‍♂️​ ${groom_name.split(" ")[0]}` },
    {
      id: "both",
      value: `👩‍❤️‍💋‍👨​ ${bride_name.split(" ")[0]} & ${groom_name.split(" ")[0]}`,
    },
  ];
};

export const ASSIGNEE_OPTIONS: TaskAssignee[] = ["bride", "groom", "both"];
