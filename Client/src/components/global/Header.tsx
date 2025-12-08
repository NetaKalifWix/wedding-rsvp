import { Button, IconButton, PopoverMenu } from "@wix/design-system";
import React from "react";
import { ChevronDown } from "@wix/wix-ui-icons-common";
import { ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { httpRequests } from "../../httpClient";
import "./css/Header.css";
import { useNavigate } from "react-router-dom";
type HeaderProps = {
  showBackToDashboardButton?: boolean;
};
const Header = ({
  showBackToDashboardButton = false,
}: HeaderProps): JSX.Element => {
  const { user, isAdmin, handleLogout } = useAuth();
  const navigate = useNavigate();
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
      </div>
      {user && (
        <PopoverMenu
          triggerElement={
            <Button priority="secondary" suffixIcon={<ChevronDown />}>
              {user.name || "Account"}
            </Button>
          }
        >
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
      )}
    </div>
  );
};

export default Header;
