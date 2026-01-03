import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CheckSquare, DollarSign } from "lucide-react";
import { Box, Card, Badge, Loader } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { WeddingDetails } from "../../types";
import { httpRequests } from "../../httpClient";
import "./css/WeddingDashboard.css";
import { useAuth } from "../../hooks/useAuth";
import { WeddingCountdown } from "./WeddingCountdown";
import Header from "../global/Header";
import WeddingSetupModal from "./WeddingSetupModal";
import AccountTypeSelector from "./AccountTypeSelector";

export const WeddingDashboard = () => {
  const { user, partnerInfo, isLoading, refreshPartnerInfo, handleLogout } =
    useAuth();
  const navigate = useNavigate();
  const [weddingInfo, setWeddingInfo] = useState<WeddingDetails | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean | null>(null);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showWeddingSetup, setShowWeddingSetup] = useState(false);
  const [isLoadingWeddingInfo, setIsLoadingWeddingInfo] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchWeddingInfo = async () => {
      try {
        if (!user) return;
        setIsLoadingWeddingInfo(true);
        const info = await httpRequests.getWeddingInfo(user.userID);
        setWeddingInfo(info);
        // Check if this is a first-time user (no wedding info set)
        // If linked account, don't show setup - use partner's data
        const hasBasicInfo =
          info &&
          info.bride_name &&
          info.groom_name &&
          info.wedding_date &&
          info.hour &&
          info.location_name;
        const isNewUser = !hasBasicInfo && !partnerInfo?.isLinkedAccount;
        setIsFirstTimeUser(isNewUser);
        // Show account selector for new users
        if (isNewUser) {
          setShowAccountSelector(true);
        }
      } catch (error) {
        console.error("Error fetching wedding info:", error);
      } finally {
        setIsLoadingWeddingInfo(false);
      }
    };

    if (user) {
      fetchWeddingInfo();
    }
  }, [user, isLoading, refreshTrigger, partnerInfo?.isLinkedAccount]);

  const handleSetupComplete = () => {
    setIsFirstTimeUser(false);
    setShowWeddingSetup(false);
    // Trigger a refetch of wedding info
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCreateNew = () => {
    setShowAccountSelector(false);
    setShowWeddingSetup(true);
  };

  const handleJoinSuccess = async () => {
    setShowAccountSelector(false);
    setIsFirstTimeUser(false);
    // Refresh partner info and wedding info
    await refreshPartnerInfo();
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCancelAccountSetup = () => {
    if (!user) return;
    // Delete the newly created user and log them out
    httpRequests.deleteUser(user.userID);
    handleLogout();
  };

  if (!user) {
    return null;
  }

  // Show loading while checking if first-time user
  if (isLoadingWeddingInfo || isFirstTimeUser === null) {
    return (
      <div className="wedding-dashboard">
        <Header />
        <Box
          direction="vertical"
          align="center"
          verticalAlign="middle"
          height="50vh"
        >
          <Loader size="medium" />
        </Box>
      </div>
    );
  }

  // Show account type selector for first-time users
  if (isFirstTimeUser && showAccountSelector) {
    return (
      <AccountTypeSelector
        user={user}
        onCreateNew={handleCreateNew}
        onJoinSuccess={handleJoinSuccess}
        onCancel={handleCancelAccountSetup}
      />
    );
  }

  // Show setup modal if user chose to create new wedding
  if (showWeddingSetup) {
    return (
      <WeddingSetupModal
        userID={user.userID}
        onComplete={handleSetupComplete}
      />
    );
  }

  const featureCards = [
    {
      id: "tasks",
      title: "משימות לחתונה",
      description: "עקבו אחר רשימת המשימות שלכם",
      icon: <CheckSquare size={28} />,
      path: "/tasks",
      skin: "purple" as const,
      available: true,
    },
    {
      id: "budget",
      title: "תקציב וספקים",
      description: "נהלו הוצאות ופרטי ספקים",
      icon: <DollarSign size={28} />,
      path: "/budget",
      skin: "blue" as const,
      available: true,
    },
    {
      id: "rsvp",
      title: "ניהול אישורי הגעה",
      description: "נהלו את רשימת האורחים ועקבו אחר התגובות",
      icon: <Users size={28} />,
      path: "/rsvp",
      skin: "pink" as const,
      available: true,
    },
  ];

  return (
    <div className="wedding-dashboard">
      <Header />

      <Box direction="vertical" gap="24px" padding="24px 0">
        <Box direction="vertical" gap="6px">
          <h1 className="dashboard-title">
            {weddingInfo?.bride_name && weddingInfo?.groom_name
              ? `החתונה של ${weddingInfo.bride_name} ו${weddingInfo.groom_name}`
              : "המסע לחתונה שלכם"}
          </h1>
        </Box>

        <WeddingCountdown weddingInfo={weddingInfo} isLoading={isLoading} />

        <Box
          direction="horizontal"
          gap="16px"
          className="feature-cards"
          align="center"
        >
          {featureCards.map((feature) => (
            <div
              className={`feature-card-wrapper ${
                !feature.available ? "coming-soon-card" : ""
              }`}
              onClick={() => feature.available && navigate(feature.path)}
            >
              <Card stretchVertically={true}>
                <Card.Header
                  className="feature-card-header"
                  title={feature.title}
                  subtitle={feature.description}
                />
                <Card.Content>
                  <Box
                    direction="vertical"
                    align="center"
                    padding="12px 0"
                    gap="12px"
                  >
                    {!feature.available ? (
                      <Badge skin="warningLight" size="tiny">
                        בקרוב
                      </Badge>
                    ) : undefined}
                    <Box
                      align="center"
                      verticalAlign="middle"
                      width="56px"
                      height="56px"
                      className={`feature-icon-box feature-icon-${feature.skin}`}
                    >
                      {feature.icon}
                    </Box>
                  </Box>
                </Card.Content>
              </Card>
            </div>
          ))}
        </Box>
      </Box>
    </div>
  );
};
