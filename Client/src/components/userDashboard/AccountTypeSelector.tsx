import React, { useState } from "react";
import { Box, Text, Button, Input, Heading, Loader } from "@wix/design-system";
import { Heart, UserPlus, Users, X } from "lucide-react";
import { User } from "../../types";
import { httpRequests } from "../../httpClient";
import "./css/AccountTypeSelector.css";

interface AccountTypeSelectorProps {
  user: User;
  onCreateNew: () => void;
  onJoinSuccess: () => void;
  onCancel: () => void;
}

const AccountTypeSelector: React.FC<AccountTypeSelectorProps> = ({
  user,
  onCreateNew,
  onJoinSuccess,
  onCancel,
}) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  const handleJoinPartner = async () => {
    if (!joinCode.trim()) {
      setError("Please enter an invite code");
      return;
    }
    setIsJoining(true);
    setError("");
    try {
      const result = await httpRequests.acceptInvite(user.userID, joinCode);
      if (result.success) {
        onJoinSuccess();
      } else {
        setError(result.error || "Failed to join partner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to join partner");
    } finally {
      setIsJoining(false);
    }
  };

  if (showJoinForm) {
    return (
      <div className="account-selector-overlay">
        <div className="account-selector-modal">
          <button className="selector-close-button" onClick={onCancel}>
            <X size={20} />
          </button>
          <Box direction="vertical" gap="24px" align="center">
            <Box direction="vertical" gap="8px" align="center">
              <Users className="selector-icon join" size={48} />
              <Heading size="medium">Join Your Partner's Account</Heading>
              <Text size="small" secondary className="selector-subtitle">
                Enter the invite code your partner shared with you
              </Text>
            </Box>

            {error && (
              <Box className="error-message" width="100%">
                <Text size="small" skin="error">
                  {error}
                </Text>
              </Box>
            )}

            <Box direction="vertical" gap="16px" width="100%">
              <Input
                size="large"
                placeholder="Enter invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                className="join-code-input"
              />

              <Box gap="12px" width="100%">
                <Button
                  size="large"
                  skin="light"
                  onClick={() => {
                    setShowJoinForm(false);
                    setJoinCode("");
                    setError("");
                  }}
                  fullWidth
                >
                  Back
                </Button>
                <Button
                  size="large"
                  onClick={handleJoinPartner}
                  disabled={isJoining || !joinCode.trim()}
                  fullWidth
                >
                  {isJoining ? <Loader size="tiny" /> : "Join Account"}
                </Button>
              </Box>
            </Box>

            <Text size="tiny" secondary className="selector-note">
              You'll have access to all your partner's wedding data
            </Text>
          </Box>
        </div>
      </div>
    );
  }

  return (
    <div className="account-selector-overlay">
      <div className="account-selector-modal">
        <button className="selector-close-button" onClick={onCancel}>
          <X size={20} />
        </button>
        <Box direction="vertical" gap="32px" align="center">
          <Box direction="vertical" gap="8px" align="center">
            <Heart className="selector-heart-icon" size={48} />
            <Heading size="medium">Welcome to Your Wedding Journey!</Heading>
            <Text size="small" secondary className="selector-subtitle">
              How would you like to get started?
            </Text>
          </Box>

          <Box direction="vertical" gap="16px" width="100%">
            <button
              className="account-option-card create-new"
              onClick={onCreateNew}
            >
              <Box className="option-icon-box create">
                <UserPlus size={28} />
              </Box>
              <Box direction="vertical" gap="4px" align="left">
                <Text size="medium" weight="bold">
                  Create New Wedding
                </Text>
                <Text size="small" secondary>
                  Start fresh and set up your wedding details
                </Text>
              </Box>
            </button>

            <button
              className="account-option-card join-existing"
              onClick={() => setShowJoinForm(true)}
            >
              <Box className="option-icon-box join">
                <Users size={28} />
              </Box>
              <Box direction="vertical" gap="4px" align="left">
                <Text size="medium" weight="bold">
                  Join Partner's Account
                </Text>
                <Text size="small" secondary>
                  Connect to your partner's existing wedding
                </Text>
              </Box>
            </button>
          </Box>

          <Text size="tiny" secondary className="selector-note">
            You can always invite your partner later if you create a new account
          </Text>
        </Box>
      </div>
    </div>
  );
};

export default AccountTypeSelector;
