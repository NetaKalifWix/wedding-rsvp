import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Loader,
  Card,
  Modal,
  Button,
  Dropdown,
  EmptyState,
  SectionHelper,
  Search,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { Plus } from "lucide-react";
import {
  BudgetOverview,
  BudgetCategoryWithSpending,
  BudgetCategoryName,
  VendorWithPayments,
} from "../../types";
import { httpRequests } from "../../httpClient";
import { useAuth } from "../../hooks/useAuth";
import Header from "../global/Header";
import BudgetCategoryCard from "./BudgetCategoryCard";
import BudgetOverviewCard from "./BudgetOverviewCard";
import AddCategoryModal, { CATEGORY_ICONS } from "./AddCategoryModal";
import "./css/BudgetDashboard.css";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
};
const VENDOR_STATUS_OPTIONS = ["יצרנו קשר", "הוזמן", "שולם חלקית", "שולם"];
export const VENDOR_STATUS_OPTIONS_DD = VENDOR_STATUS_OPTIONS.map((status) => ({
  id: status,
  value: status,
}));

export const BudgetDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [budgetData, setBudgetData] = useState<BudgetOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  // Modal states
  const [showAddCategory, setShowAddCategory] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [highlightedVendorId, setHighlightedVendorId] = useState<number | null>(
    null
  );

  const fetchBudgetData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await httpRequests.getBudgetOverview(user.userID);
      setBudgetData(data);
    } catch (error) {
      console.error("Error fetching budget data:", error);
    } finally {
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchBudgetData();
      setIsLoading(false);
    }
  }, [user, authLoading, fetchBudgetData]);

  // Calculate alerts
  const getAlerts = () => {
    if (!budgetData) return [];
    const alerts: { type: "destructive" | "warning"; message: string }[] = [];

    // Overall budget warning
    if (budgetData.total_budget > 0 && budgetData.remaining_budget < 0) {
      alerts.push({
        type: "destructive",
        message: `חריגה מהתקציב ב-${formatCurrency(
          Math.abs(budgetData.remaining_budget)
        )}`,
      });
    }

    // Upcoming payments (vendors with remaining balance)
    const vendorsWithBalance = budgetData.categories
      .flatMap((c) => c.vendors)
      .filter((v) => v.remaining_balance > 0 && v.status !== "יצרנו קשר");

    if (vendorsWithBalance.length > 0) {
      const totalRemaining = vendorsWithBalance.reduce(
        (sum, v) => sum + v.remaining_balance,
        0
      );
      alerts.push({
        type: "warning",
        message: `${
          vendorsWithBalance.length
        } ספקים עם תשלומים פתוחים (${formatCurrency(totalRemaining)})`,
      });
    }

    return alerts;
  };

  // Handler functions
  const handleUpdateTotalBudget = async (value: number) => {
    if (!user) return;
    try {
      await httpRequests.updateTotalBudget(user.userID, value);
      fetchBudgetData();
    } catch (error) {
      console.error("Error updating total budget:", error);
    }
  };

  const handleUpdateEstimatedGuests = async (value: number) => {
    if (!user) return;
    try {
      await httpRequests.updateEstimatedGuests(user.userID, value);
      fetchBudgetData();
    } catch (error) {
      console.error("Error updating estimated guests:", error);
    }
  };

  const handleAddCategory = async (name: BudgetCategoryName) => {
    if (!user) return;
    try {
      await httpRequests.addBudgetCategory(user.userID, name);
      setShowAddCategory(false);
      fetchBudgetData();
    } catch (error: any) {
      alert(error.message || "Failed to add category");
    }
  };

  // Filter vendors
  const filterVendors = (vendors: VendorWithPayments[]) => {
    return vendors.filter((vendor) => {
      const matchesSearch = vendor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || vendor.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  // Filter categories
  const getFilteredCategories = (): BudgetCategoryWithSpending[] => {
    if (!budgetData) return [];
    let categories = budgetData.categories;

    if (categoryFilter !== "all") {
      categories = categories.filter(
        (c) => c.category_id.toString() === categoryFilter
      );
    }

    return categories.map((cat) => ({
      ...cat,
      vendors: filterVendors(cat.vendors),
    }));
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="budget-dashboard">
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

  // Redirect if not logged in
  if (!user) {
    navigate("/");
    return null;
  }

  const alerts = getAlerts();
  const filteredCategories = getFilteredCategories();

  const categoryOptions = [
    { id: "all", value: "כל הקטגוריות" },
    ...(budgetData?.categories.map((cat) => ({
      id: cat.category_id.toString(),
      value: cat.name,
    })) || []),
  ];

  return (
    <>
      <Header showBackToDashboardButton={true} />
      <div className="budget-dashboard" dir="rtl">
        <Box
          direction="vertical"
          gap="24px"
          padding="24px 0"
          width="60%"
          minWidth="400px"
          maxWidth="900px"
        >
          {/* Header */}
          <Box direction="vertical" gap="4px">
            <Heading size="large">תקציב וספקים</Heading>
            <Text size="small" secondary>
              עקוב אחר הוצאות החתונה ונהל את הספקים שלך
            </Text>
          </Box>

          {/* Budget Overview Card */}
          <BudgetOverviewCard
            budgetData={budgetData}
            onUpdateBudget={handleUpdateTotalBudget}
            onUpdateGuests={handleUpdateEstimatedGuests}
            formatCurrency={formatCurrency}
          />

          {/* Alerts */}
          {alerts.length > 0 && (
            <Box direction="vertical" gap="8px">
              {alerts.map((alert, index) => (
                <SectionHelper
                  key={index}
                  appearance={
                    alert.type === "destructive" ? "danger" : "warning"
                  }
                >
                  {alert.message}
                </SectionHelper>
              ))}
            </Box>
          )}

          {/* Filters */}
          <Box
            direction="horizontal"
            gap="12px"
            verticalAlign="middle"
            className="filter-bar"
          >
            <Box width="250px" className="filter-item">
              <Search
                placeholder="חיפוש ספקים..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedVendorId(null);
                }}
                onClear={() => {
                  setSearchTerm("");
                  setHighlightedVendorId(null);
                }}
                options={
                  searchTerm.length > 0
                    ? budgetData?.categories
                        .flatMap((cat) =>
                          cat.vendors
                            .filter((v) =>
                              v.name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase())
                            )
                            .map((v) => ({
                              id: `${cat.category_id}-${v.vendor_id}`,
                              value: `${v.name}${
                                v.job_title ? ` (${v.job_title})` : ""
                              } - ${cat.name}`,
                              vendorId: v.vendor_id,
                              categoryId: cat.category_id,
                            }))
                        )
                        .slice(0, 10) || []
                    : []
                }
                onSelect={(option: any) => {
                  setExpandedCategory(option.categoryId);
                  setHighlightedVendorId(option.vendorId);
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  // Scroll to vendor after a short delay
                  setTimeout(() => {
                    const vendorElement = document.querySelector(
                      `[data-vendor-id="${option.vendorId}"]`
                    );
                    vendorElement?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }, 100);
                  // Remove highlight after 3 seconds
                  setTimeout(() => {
                    setHighlightedVendorId(null);
                  }, 3000);
                }}
              />
            </Box>
            <Box width="150px" className="filter-item">
              <Dropdown
                options={[
                  { id: "all", value: "כל הסטטוסים" },
                  ...VENDOR_STATUS_OPTIONS_DD,
                ]}
                selectedId={statusFilter}
                onSelect={(option) => setStatusFilter(option.id as string)}
              />
            </Box>
            <Box width="150px" className="filter-item">
              <Dropdown
                options={categoryOptions}
                selectedId={categoryFilter}
                onSelect={(option) => setCategoryFilter(option.id as string)}
              />
            </Box>
          </Box>

          {/* Categories Section */}
          <Box direction="vertical" gap="16px">
            <Box direction="horizontal" verticalAlign="middle" gap="12px">
              <Heading size="small">קטגוריות תקציב</Heading>
              <Button
                size="small"
                prefixIcon={<Plus size={16} />}
                onClick={() => setShowAddCategory(true)}
              >
                הוסף קטגוריה
              </Button>
            </Box>

            {filteredCategories.length === 0 ? (
              <Card>
                <Card.Content>
                  <EmptyState
                    title="אין קטגוריות עדיין"
                    subtitle="הוסף קטגוריה ראשונה כדי להתחיל לעקוב!"
                    theme="section"
                  >
                    <Button
                      prefixIcon={<Plus size={16} />}
                      onClick={() => setShowAddCategory(true)}
                    >
                      הוסף קטגוריה
                    </Button>
                  </EmptyState>
                </Card.Content>
              </Card>
            ) : (
              <Box direction="vertical" gap="12px">
                {filteredCategories.map((category) => (
                  <BudgetCategoryCard
                    key={category.category_id}
                    category={category}
                    icon={CATEGORY_ICONS[category.name] || "📦"}
                    isExpanded={expandedCategory === category.category_id}
                    onToggleExpand={() =>
                      setExpandedCategory(
                        expandedCategory === category.category_id
                          ? null
                          : category.category_id
                      )
                    }
                    onDataRefresh={fetchBudgetData}
                    formatCurrency={formatCurrency}
                    highlightedVendorId={highlightedVendorId}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Modal
          isOpen={showAddCategory}
          onRequestClose={() => setShowAddCategory(false)}
        >
          <AddCategoryModal
            existingCategories={budgetData?.categories.map((c) => c.name) || []}
            onSave={handleAddCategory}
            onClose={() => setShowAddCategory(false)}
          />
        </Modal>
      </div>
    </>
  );
};

export default BudgetDashboard;
