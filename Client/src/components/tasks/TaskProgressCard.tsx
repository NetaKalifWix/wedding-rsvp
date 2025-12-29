import React from "react";
import { Box, Text, Button, Card, ToggleSwitch } from "@wix/design-system";
import { Plus, ChevronsUpDown } from "lucide-react";

interface TaskProgressCardProps {
  completedCount: number;
  totalCount: number;
  hideCompleted: boolean;
  allExpanded: boolean;
  onToggleHideCompleted: () => void;
  onToggleAddTask: () => void;
  onToggleAllGroups: () => void;
}

export const TaskProgressCard: React.FC<TaskProgressCardProps> = ({
  completedCount,
  totalCount,
  hideCompleted,
  allExpanded,
  onToggleHideCompleted,
  onToggleAddTask,
  onToggleAllGroups,
}) => {
  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card>
      <Card.Content>
        <Box direction="vertical" gap="12px">
          <Box direction="horizontal" verticalAlign="middle" gap="12px">
            <Box className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </Box>
            <Text size="small" weight="bold">
              {Math.round(progressPercent)}%
            </Text>
          </Box>
          <Box direction="horizontal" gap="16px" verticalAlign="middle">
            <Button
              size="small"
              priority="secondary"
              prefixIcon={<Plus size={16} />}
              onClick={onToggleAddTask}
            >
              Add Task
            </Button>
            <Button
              size="small"
              priority="secondary"
              prefixIcon={<ChevronsUpDown size={16} />}
              onClick={onToggleAllGroups}
            >
              {allExpanded ? "Collapse All" : "Expand All"}
            </Button>
            <Box direction="horizontal" gap="8px" verticalAlign="middle">
              <Text size="small">Hide completed</Text>
              <ToggleSwitch
                size="small"
                checked={hideCompleted}
                onChange={onToggleHideCompleted}
              />
            </Box>
          </Box>
        </Box>
      </Card.Content>
    </Card>
  );
};

export default TaskProgressCard;

