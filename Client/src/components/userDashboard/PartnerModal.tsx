import React, { useState } from "react";
import {
  Modal,
  Box,
  Text,
  Button,
  Input,
  Heading,
  Loader,
  Badge,
  Divider,
} from "@wix/design-system";
import { Users, Link, Copy, Check, UserMinus, UserPlus } from "lucide-react";
import { PartnerInfo, User } from "../../types";
import { httpRequests } from "../../httpClient";
import "./css/PartnerModal.css";

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  partnerInfo: PartnerInfo | undefined;
  onPartnerChange: () => Promise<void>;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({
  isOpen,
  onClose,
  user,
  partnerInfo,
  onPartnerChange,
}) => {
  const [inviteCode, setInviteCode] = useState<string>(
    partnerInfo?.inviteCode || ""
  );
  const [joinCode, setJoinCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const code = await httpRequests.generateInviteCode(user.userID);
      setInviteCode(code);
      await onPartnerChange();
    } catch (err: any) {
      setError(err.message || "Failed to generate invite code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        await onPartnerChange();
        setShowJoinForm(false);
        setJoinCode("");
      } else {
        setError(result.error || "Failed to join partner");
      }
    } catch (err: any) {
      setError(err.message || "Failed to join partner");
    } finally {
      setIsJoining(false);
    }
  };

  const handleUnlink = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to unlink from your partner? You will lose access to the shared wedding data."
    );
    if (!confirmed) return;

    setIsUnlinking(true);
    setError("");
    try {
      await httpRequests.unlinkPartner(user.userID);
      await onPartnerChange();
    } catch (err: any) {
      setError(err.message || "Failed to unlink partner");
    } finally {
      setIsUnlinking(false);
    }
  };

  const renderLinkedPartnerView = () => {
    if (!partnerInfo) return null;

    if (partnerInfo.isLinkedAccount && partnerInfo.primaryUser) {
      // User is the secondary/partner account
      return (
        <Box direction="vertical" gap="16px" align="center">
          <Box className="partner-icon-box linked">
            <Users size={32} />
          </Box>
          <Badge skin="success" size="medium">
            Linked Account
          </Badge>
          <Text size="medium">
            You are connected to <strong>{partnerInfo.primaryUser.name}</strong>
            's wedding account.
          </Text>
          <Text size="small" secondary>
            All wedding data is shared with your partner.
          </Text>
          <Divider />
          <Button
            size="small"
            skin="destructive"
            prefixIcon={<UserMinus size={16} />}
            onClick={handleUnlink}
            disabled={isUnlinking}
          >
            {isUnlinking ? <Loader size="tiny" /> : "Unlink Account"}
          </Button>
        </Box>
      );
    }

    if (partnerInfo.hasPartner && partnerInfo.partner) {
      // User is the primary account with a partner
      return (
        <Box direction="vertical" gap="16px" align="center">
          <Box className="partner-icon-box linked">
            <Users size={32} />
          </Box>
          <Badge skin="success" size="medium">
            Partner Connected
          </Badge>
          <Text size="medium">
            <strong>{partnerInfo.partner.name}</strong> is connected to your
            wedding account.
          </Text>
          <Text size="small" secondary>
            You both share the same wedding data.
          </Text>
          <Divider />
          <Button
            size="small"
            skin="destructive"
            prefixIcon={<UserMinus size={16} />}
            onClick={handleUnlink}
            disabled={isUnlinking}
          >
            {isUnlinking ? <Loader size="tiny" /> : "Remove Partner"}
          </Button>
        </Box>
      );
    }

    return null;
  };

  const renderInviteView = () => (
    <Box direction="vertical" gap="20px">
      <Box direction="vertical" gap="8px" align="center">
        <Box className="partner-icon-box">
          <Link size={32} />
        </Box>
        <Text size="medium" weight="bold">
          Invite Your Partner
        </Text>
        <Text size="small" secondary className="partner-description">
          Generate a code to share with your partner. They can use it to link
          their account and access all wedding data together.
        </Text>
      </Box>

      {inviteCode ? (
        <Box direction="vertical" gap="12px" align="center">
          <Box className="invite-code-display">
            <Text size="medium" weight="bold" className="invite-code-text">
              {inviteCode}
            </Text>
          </Box>
          <Button
            size="small"
            skin="light"
            prefixIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            onClick={handleCopyCode}
          >
            {copied ? "Copied!" : "Copy Code"}
          </Button>
          <Text size="tiny" secondary>
            Code expires in 7 days
          </Text>
        </Box>
      ) : (
        <Button
          size="medium"
          skin="premium"
          prefixIcon={<Link size={16} />}
          onClick={handleGenerateCode}
          disabled={isGenerating}
        >
          {isGenerating ? <Loader size="tiny" /> : "Generate Invite Code"}
        </Button>
      )}

      <Divider />

      <Box direction="vertical" gap="12px" align="center">
        <Text size="small" secondary>
          Have an invite code from your partner?
        </Text>
        {showJoinForm ? (
          <Box direction="vertical" gap="8px" width="100%">
            <Input
              size="medium"
              placeholder="Enter invite code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={8}
            />
            <Box gap="8px">
              <Button
                size="small"
                skin="standard"
                onClick={() => {
                  setShowJoinForm(false);
                  setJoinCode("");
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="small"
                skin="premium"
                prefixIcon={<UserPlus size={16} />}
                onClick={handleJoinPartner}
                disabled={isJoining}
              >
                {isJoining ? <Loader size="tiny" /> : "Join Partner"}
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            size="small"
            skin="light"
            prefixIcon={<UserPlus size={16} />}
            onClick={() => setShowJoinForm(true)}
          >
            Join Existing Account
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick>
      <Box
        direction="vertical"
        gap="24px"
        padding="24px"
        backgroundColor="white"
      >
        <Heading size="medium">Partner Collaboration</Heading>

        {error && (
          <Box className="error-message">
            <Text size="small" skin="error">
              {error}
            </Text>
          </Box>
        )}

        {partnerInfo?.hasPartner
          ? renderLinkedPartnerView()
          : renderInviteView()}
      </Box>
    </Modal>
  );
};

export default PartnerModal;
