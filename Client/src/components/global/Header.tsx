import { Button, IconButton, PopoverMenu } from "@wix/design-system";
import React, { useState } from "react";
import { ChevronDown } from "@wix/wix-ui-icons-common";
import { ArrowLeft, Heart, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { httpRequests } from "../../httpClient";
import "./css/Header.css";
import { useNavigate } from "react-router-dom";
import PartnerModal from "../userDashboard/PartnerModal";

type HeaderProps = {
  showBackToDashboardButton?: boolean;
};
const Header = ({
  showBackToDashboardButton = false,
}: HeaderProps): JSX.Element => {
  const { user, isAdmin, handleLogout, partnerInfo, refreshPartnerInfo } =
    useAuth();
  const navigate = useNavigate();
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  const getPartnerMenuText = () => {
    if (partnerInfo?.hasPartner) {
      if (partnerInfo.isLinkedAccount && partnerInfo.primaryUser) {
        return `Linked with ${partnerInfo.primaryUser.name?.split(" ")[0]}`;
      }
      if (partnerInfo.partner) {
        return `Partner: ${partnerInfo.partner.name?.split(" ")[0]}`;
      }
    }
    return "Invite/Connect Partner";
  };

  return (
    <div className="header-content">
      {showBackToDashboardButton && (
        <IconButton priority="secondary" onClick={() => navigate("/")}>
          <ArrowLeft size={16} />
        </IconButton>
      )}
      <div className="header-brand">
        <Heart className="brand-icon" />
        <span className="brand-text">The Wedding Hub</span>
        {isAdmin && <span className="admin-badge">Admin</span>}
        {partnerInfo?.hasPartner && (
          <span className="partner-badge">
            <Users size={12} />
          </span>
        )}
      </div>
      {user && (
        <div>
          <PopoverMenu
            triggerElement={
              <Button priority="secondary" suffixIcon={<ChevronDown />}>
                {user.name || "Account"}
              </Button>
            }
          >
            <PopoverMenu.MenuItem
              text={getPartnerMenuText()}
              onClick={() => setIsPartnerModalOpen(true)}
            />
            <PopoverMenu.Divider />
            <PopoverMenu.MenuItem text="Logout" onClick={handleLogout} />
            <PopoverMenu.MenuItem
              text="Delete Account"
              onClick={async () => {
                try {
                  await httpRequests.deleteUser(user.userID);
                  handleLogout();
                } catch (error) {
                  console.error("Error deleting account:", error);
                }
              }}
            />
          </PopoverMenu>
          <PartnerModal
            isOpen={isPartnerModalOpen}
            onClose={() => setIsPartnerModalOpen(false)}
            user={user}
            partnerInfo={partnerInfo}
            onPartnerChange={async () => {
              await refreshPartnerInfo();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Header;
