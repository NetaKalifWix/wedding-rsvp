import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  Input,
  FormField,
  Heading,
  Loader,
} from "@wix/design-system";
import { Heart } from "lucide-react";
import { httpRequests } from "../../httpClient";
import { User, WeddingDetails } from "../../types";
import "./css/WeddingSetupModal.css";

interface WeddingSetupModalProps {
  userID: User["userID"];
  onComplete: () => void;
}

const WeddingSetupModal: React.FC<WeddingSetupModalProps> = ({
  userID,
  onComplete,
}) => {
  const [weddingDetails, setWeddingDetails] = useState<
    Pick<
      WeddingDetails,
      "bride_name" | "groom_name" | "wedding_date" | "hour" | "location_name"
    >
  >({
    bride_name: "נטע כליף",
    groom_name: "דן זנגו",
    wedding_date: "2026-05-01",
    hour: "10:00",
    location_name: "מרכז העיר בחיפה",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    if (!weddingDetails.bride_name.trim()) newErrors.bride_name = true;
    if (!weddingDetails.groom_name.trim()) newErrors.groom_name = true;
    if (!weddingDetails.wedding_date) newErrors.wedding_date = true;
    if (!weddingDetails.hour) newErrors.hour = true;
    if (!weddingDetails.location_name.trim()) newErrors.location_name = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("userID", userID);

      // Create full wedding details with defaults for optional fields
      const fullWeddingDetails: WeddingDetails = {
        ...weddingDetails,
        additional_information: "",
        waze_link: "",
        gift_link: "",
        thank_you_message: "",
        fileID: "",
        reminder_day: "day_before",
        reminder_time: "10:00",
      };

      formData.append("weddingInfo", JSON.stringify(fullWeddingDetails));
      await httpRequests.saveWeddingInfo(formData);
      onComplete();
    } catch (error) {
      console.error("Error saving wedding information:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="wedding-setup-overlay">
      <div className="wedding-setup-modal">
        <Box direction="vertical" gap="24px" align="center">
          <Box direction="vertical" gap="8px" align="center">
            <Heart className="setup-heart-icon" size={48} />
            <Heading size="medium">Welcome! Let's set up your wedding</Heading>
            <Text size="small" secondary>
              Please fill in the basic details to get started
            </Text>
          </Box>

          <Box direction="vertical" gap="16px" width="100%">
            <Box gap="16px">
              <Box direction="vertical" width="50%">
                <FormField
                  label="Bride's Name"
                  required
                  status={errors.bride_name ? "error" : undefined}
                  statusMessage={errors.bride_name ? "Required" : undefined}
                >
                  <div dir="rtl">
                    <Input
                      value={weddingDetails.bride_name}
                      onChange={(e) => {
                        setWeddingDetails((prev) => ({
                          ...prev,
                          bride_name: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, bride_name: false }));
                      }}
                      placeholder="Enter bride's name"
                      status={errors.bride_name ? "error" : undefined}
                    />
                  </div>
                </FormField>
              </Box>
              <Box direction="vertical" width="50%">
                <FormField
                  label="Groom's Name"
                  required
                  status={errors.groom_name ? "error" : undefined}
                  statusMessage={errors.groom_name ? "Required" : undefined}
                >
                  <div dir="rtl">
                    <Input
                      value={weddingDetails.groom_name}
                      onChange={(e) => {
                        setWeddingDetails((prev) => ({
                          ...prev,
                          groom_name: e.target.value,
                        }));
                        setErrors((prev) => ({ ...prev, groom_name: false }));
                      }}
                      placeholder="Enter groom's name"
                      status={errors.groom_name ? "error" : undefined}
                    />
                  </div>
                </FormField>
              </Box>
            </Box>

            <FormField
              label="Wedding Venue"
              required
              status={errors.location_name ? "error" : undefined}
              statusMessage={errors.location_name ? "Required" : undefined}
            >
              <div dir="rtl">
                <Input
                  value={weddingDetails.location_name}
                  onChange={(e) => {
                    setWeddingDetails((prev) => ({
                      ...prev,
                      location_name: e.target.value,
                    }));
                    setErrors((prev) => ({ ...prev, location_name: false }));
                  }}
                  placeholder="Enter wedding venue"
                  status={errors.location_name ? "error" : undefined}
                />
              </div>
            </FormField>

            <Box gap="16px">
              <Box direction="vertical" width="50%">
                <FormField
                  label="Wedding Date"
                  required
                  status={errors.wedding_date ? "error" : undefined}
                  statusMessage={errors.wedding_date ? "Required" : undefined}
                >
                  <Input
                    type="date"
                    value={weddingDetails.wedding_date}
                    onChange={(e) => {
                      setWeddingDetails((prev) => ({
                        ...prev,
                        wedding_date: e.target.value,
                      }));
                      setErrors((prev) => ({ ...prev, wedding_date: false }));
                    }}
                    status={errors.wedding_date ? "error" : undefined}
                  />
                </FormField>
              </Box>
              <Box direction="vertical" width="50%">
                <FormField
                  label="Wedding Time"
                  required
                  status={errors.hour ? "error" : undefined}
                  statusMessage={errors.hour ? "Required" : undefined}
                >
                  <Input
                    type="time"
                    value={weddingDetails.hour}
                    onChange={(e) => {
                      setWeddingDetails((prev) => ({
                        ...prev,
                        hour: e.target.value,
                      }));
                      setErrors((prev) => ({ ...prev, hour: false }));
                    }}
                    status={errors.hour ? "error" : undefined}
                  />
                </FormField>
              </Box>
            </Box>
          </Box>

          <Box width="100%">
            <Button
              size="large"
              onClick={handleSubmit}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? <Loader size="tiny" /> : "Get Started"}
            </Button>
          </Box>

          <Text size="tiny" secondary className="setup-note">
            You can update these details and add more information later
          </Text>
        </Box>
      </div>
    </div>
  );
};

export default WeddingSetupModal;
