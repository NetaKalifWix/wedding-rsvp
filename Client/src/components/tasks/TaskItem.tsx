import React from "react";
import { Box, Text, Badge, IconButton, Tooltip } from "@wix/design-system";
import { Trash2, Check, Circle } from "lucide-react";
import { Task } from "../../types";
import { PRIORITY_LABELS, getAssigneeLabel } from "./taskConstants";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
}) => {
  return (
    <div className={`task-item ${task.is_completed ? "completed" : ""}`}>
      <Box
        direction="horizontal"
        verticalAlign="middle"
        gap="12px"
        className="task-content"
      >
        <button
          className={`task-checkbox ${task.is_completed ? "checked" : ""}`}
          onClick={() => onToggleComplete(task)}
        >
          {task.is_completed ? <Check size={14} /> : <Circle size={14} />}
        </button>

        <Box
          direction="horizontal"
          verticalAlign="space-between"
          gap="4px"
          className="task-details"
        >
          <Text
            size="small"
            className={task.is_completed ? "task-title-completed" : ""}
          >
            {task.title}
          </Text>
          <Box direction="horizontal" gap="8px">
            {task.assignee && (
              <Badge size="tiny" skin="neutralLight">
                {getAssigneeLabel(task.assignee)}
              </Badge>
            )}
            {task.priority && (
              <Badge
                size="tiny"
                skin={
                  task.priority === 1
                    ? "danger"
                    : task.priority === 2
                    ? "warning"
                    : "neutralStandard"
                }
              >
                {PRIORITY_LABELS[task.priority].label}
              </Badge>
            )}
          </Box>
        </Box>

        <Tooltip content="Delete task">
          <IconButton
            size="tiny"
            skin="light"
            className="delete-task-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.task_id);
            }}
          >
            <Trash2 size={14} />
          </IconButton>
        </Tooltip>
      </Box>
    </div>
  );
};

export default TaskItem;
