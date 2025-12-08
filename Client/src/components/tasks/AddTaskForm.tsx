import React, { useState } from "react";
import { Box, Text, Button, Input, Dropdown, Card } from "@wix/design-system";
import { Calendar, User, Flag } from "lucide-react";
import { TimelineGroup, TaskPriority, TaskAssignee } from "../../types";
import {
  ASSIGNEE_OPTIONS,
  getAssigneeLabel,
  getTimelineOptions,
  PRIORITY_OPTIONS,
} from "./taskConstants";

interface AddTaskFormProps {
  onAddTask: (task: {
    title: string;
    timeline_group: TimelineGroup;
    priority: TaskPriority;
    assignee: TaskAssignee;
  }) => Promise<void>;
  onCancel: () => void;
  brideAndGroomNames: {
    bride_name: string;
    groom_name: string;
  };
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onAddTask,
  onCancel,
  brideAndGroomNames,
}) => {
  const [title, setTitle] = useState("");
  const [timelineGroup, setTimelineGroup] =
    useState<TimelineGroup>("Just Engaged");
  const [priority, setPriority] = useState<TaskPriority>(2);
  const [assignee, setAssignee] = useState<TaskAssignee>("both");

  const handleSubmit = async () => {
    if (!title.trim()) return;
    await onAddTask({
      title: title.trim(),
      timeline_group: timelineGroup,
      priority,
      assignee,
    });
    setTitle("");
  };

  const handleCancel = () => {
    setTitle("");
    onCancel();
  };

  return (
    <Card className="add-task-card">
      <Card.Header title="Add New Task" />
      <Card.Content>
        <Box direction="vertical" gap="16px">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Box direction="horizontal" gap="12px" className="task-form-row">
            <Box direction="vertical" gap="4px" className="form-field">
              <Text size="tiny" secondary>
                <Calendar size={12} /> Timeline
              </Text>
              <Dropdown
                size="small"
                selectedId={timelineGroup}
                onSelect={(option) =>
                  setTimelineGroup(option.id as TimelineGroup)
                }
                options={getTimelineOptions()}
              />
            </Box>
            <Box direction="vertical" gap="4px" className="form-field">
              <Text size="tiny" secondary>
                <Flag size={12} /> Priority
              </Text>
              <Dropdown
                size="small"
                selectedId={String(priority)}
                onSelect={(option) =>
                  setPriority(Number(option.id) as TaskPriority)
                }
                options={PRIORITY_OPTIONS}
              />
            </Box>
            <Box direction="vertical" gap="4px" className="form-field">
              <Text size="tiny" secondary>
                <User size={12} /> Assignee
              </Text>
              <Dropdown
                size="small"
                selectedId={assignee}
                onSelect={(option) => setAssignee(option.id as TaskAssignee)}
                options={ASSIGNEE_OPTIONS.map((assignee) => ({
                  id: assignee,
                  value: getAssigneeLabel(
                    assignee,
                    brideAndGroomNames.bride_name,
                    brideAndGroomNames.groom_name
                  ),
                }))}
              />
            </Box>
          </Box>
          <Box direction="horizontal" gap="8px">
            <Button
              size="small"
              onClick={handleSubmit}
              disabled={!title.trim()}
            >
              Add Task
            </Button>
            <Button size="small" priority="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Card.Content>
    </Card>
  );
};

export default AddTaskForm;
