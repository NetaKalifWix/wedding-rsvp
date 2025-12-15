import React, { useState, useEffect } from "react";
import { Box, Text, Button, Input, Dropdown, Loader } from "@wix/design-system";
import { Calendar, User, Flag, Check } from "lucide-react";
import { TimelineGroup, TaskPriority, TaskAssignee } from "../../types";
import {
  ASSIGNEE_OPTIONS,
  getAssigneeLabel,
  getTimelineOptions,
  PRIORITY_OPTIONS,
} from "./taskConstants";

export interface TaskFormValues {
  title: string;
  timeline_group: TimelineGroup;
  priority: TaskPriority;
  assignee: TaskAssignee;
}

interface TaskFormProps {
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => Promise<void>;
  onCancel: () => void;
  brideAndGroomNames: {
    bride_name: string;
    groom_name: string;
  };
  /** Whether to show as compact inline form (for editing in task list) */
  compact?: boolean;
  isSavingTask?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  brideAndGroomNames,
  compact = false,
  isSavingTask = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [timelineGroup, setTimelineGroup] = useState<TimelineGroup>(
    initialValues?.timeline_group || "Just Engaged"
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues?.priority || 2
  );
  const [assignee, setAssignee] = useState<TaskAssignee>(
    initialValues?.assignee || "both"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Reset form when initialValues change (e.g., when editing a different task)
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "");
      setTimelineGroup(initialValues.timeline_group || "Just Engaged");
      setPriority(initialValues.priority || 2);
      setAssignee(initialValues.assignee || "both");
    }
  }, [initialValues]);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        timeline_group: timelineGroup,
        priority,
        assignee,
      });
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setTitle("");
      }, 1000);
    }
  };

  const handleCancel = () => {
    setTitle("");
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") handleCancel();
  };

  const assigneeOptions = ASSIGNEE_OPTIONS.map((a) => ({
    id: a,
    value: getAssigneeLabel(
      a,
      brideAndGroomNames.bride_name,
      brideAndGroomNames.groom_name
    ),
  }));

  return (
    <Box direction="vertical" gap={compact ? "12px" : "16px"}>
      <Input
        size="small"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        onKeyDown={handleKeyDown}
        autoFocus={true}
      />
      <Box
        direction="horizontal"
        gap={compact ? "8px" : "12px"}
        className="task-form-row"
      >
        <Box direction="vertical" gap="4px" className="form-field">
          <Text size="tiny" secondary>
            <Calendar size={12} /> Timeline
          </Text>
          <Dropdown
            size="small"
            selectedId={timelineGroup}
            onSelect={(option) => setTimelineGroup(option.id as TimelineGroup)}
            options={getTimelineOptions()}
          />
        </Box>

        <Box
          direction="vertical"
          gap="4px"
          className={compact ? "edit-field" : "form-field"}
        >
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
        <Box
          direction="vertical"
          gap="4px"
          className={compact ? "edit-field" : "form-field"}
        >
          <Text size="tiny" secondary>
            <User size={12} /> Assignee
          </Text>
          <Dropdown
            size="small"
            selectedId={assignee}
            onSelect={(option) => setAssignee(option.id as TaskAssignee)}
            options={assigneeOptions}
          />
        </Box>
      </Box>
      <Box
        direction="horizontal"
        gap="8px"
        className={compact ? "task-edit-actions" : ""}
      >
        <Button
          style={showSuccess ? { backgroundColor: "green" } : {}}
          size="small"
          onClick={handleSubmit}
          disabled={!title.trim()}
        >
          {isSubmitting ? (
            <Loader size="tiny" />
          ) : showSuccess ? (
            <Check size={16} />
          ) : (
            "Save"
          )}
        </Button>

        <Button
          size="small"
          priority="secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default TaskForm;
