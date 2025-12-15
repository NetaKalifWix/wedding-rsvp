import React, { useState } from "react";
import {
  Box,
  Text,
  Button,
  Card,
  IconButton,
  Divider,
  Modal,
} from "@wix/design-system";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import {
  BudgetCategoryWithSpending,
  VendorWithPayments,
  Vendor,
} from "../../types";
import { httpRequests } from "../../httpClient";
import { useAuth } from "../../hooks/useAuth";
import VendorCard from "./VendorCard";
import VendorModal from "./VendorModal";

interface BudgetCategoryCardProps {
  category: BudgetCategoryWithSpending;
  icon: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDataRefresh: () => void;
  formatCurrency: (amount: number) => string;
  highlightedVendorId?: number | null;
}

const BudgetCategoryCard: React.FC<BudgetCategoryCardProps> = ({
  category,
  icon,
  isExpanded,
  onToggleExpand,
  onDataRefresh,
  formatCurrency,
  highlightedVendorId,
}) => {
  const { user } = useAuth();
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorWithPayments | null>(
    null
  );

  const handleDeleteCategory = async () => {
    if (!user) return;
    if (!window.confirm("למחוק קטגוריה זו? כל הספקים בקטגוריה יימחקו גם כן."))
      return;
    try {
      await httpRequests.deleteBudgetCategory(
        user.userID,
        category.category_id
      );
      onDataRefresh();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddVendor = () => {
    setEditingVendor(null);
    setShowVendorModal(true);
  };

  const handleEditVendor = (vendor: VendorWithPayments) => {
    setEditingVendor(vendor);
    setShowVendorModal(true);
  };

  const handleSaveVendor = async (
    vendorData: Pick<
      Vendor,
      | "name"
      | "job_title"
      | "category_id"
      | "agreed_cost"
      | "status"
      | "phone"
      | "email"
      | "notes"
      | "is_favorite"
    >,
    files?: File[]
  ) => {
    if (!user) return;
    try {
      if (editingVendor) {
        await httpRequests.updateVendor(
          user.userID,
          editingVendor.vendor_id,
          vendorData,
          files
        );
      } else {
        await httpRequests.addVendor(
          user.userID,
          { ...vendorData, category_id: category.category_id },
          files
        );
      }
      setShowVendorModal(false);
      setEditingVendor(null);
      onDataRefresh();
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  const handleDeleteVendor = async (vendorId: number) => {
    if (!user) return;
    if (!window.confirm("למחוק ספק זה וכל התשלומים שלו?")) return;
    try {
      await httpRequests.deleteVendor(user.userID, vendorId);
      onDataRefresh();
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  const handleToggleFavorite = async (vendorId: number) => {
    if (!user) return;
    try {
      await httpRequests.toggleVendorFavorite(user.userID, vendorId);
      onDataRefresh();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleDownloadFile = (fileId: number) => {
    if (!user) return;
    const downloadUrl = httpRequests.getVendorFileDownloadUrl(
      user.userID,
      fileId
    );
    window.open(downloadUrl, "_blank");
  };

  const handleDeleteFile = async (fileId: number) => {
    if (!user) return;
    if (!window.confirm("למחוק קובץ זה?")) return;
    try {
      await httpRequests.deleteVendorFile(user.userID, fileId);
      onDataRefresh();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  return (
    <>
      <Card>
        <Card.Content>
          <div onClick={onToggleExpand} style={{ cursor: "pointer" }}>
            <Box
              direction="horizontal"
              align="space-between"
              verticalAlign="middle"
            >
              <Box direction="horizontal" verticalAlign="middle" gap="8px">
                {isExpanded ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
                <Text size="medium">{icon}</Text>
                <Text weight="bold">{category.name}</Text>
                <Text size="tiny" secondary>
                  ({category.vendors.length} ספקים)
                </Text>
              </Box>

              <div onClick={(e) => e.stopPropagation()}>
                <Box direction="horizontal" verticalAlign="middle" gap="12px">
                  <Text weight="bold" skin="primary">
                    {formatCurrency(category.actual_spending)}
                  </Text>
                  <IconButton
                    size="tiny"
                    skin="light"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory();
                    }}
                    color="red"
                    style={{ color: "red" }}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </Box>
              </div>
            </Box>
          </div>

          {/* Expanded Content - Vendors */}
          {isExpanded && (
            <Box direction="vertical" marginTop="16px">
              <Divider />
              <Box
                direction="horizontal"
                align="space-between"
                verticalAlign="middle"
                marginTop="16px"
                marginBottom="12px"
              >
                <Text weight="bold" size="small">
                  ספקים
                </Text>
                <Button
                  size="tiny"
                  prefixIcon={<Plus size={14} />}
                  onClick={handleAddVendor}
                >
                  הוסף ספק
                </Button>
              </Box>

              {category.vendors.length === 0 ? (
                <Box align="center" padding="16px">
                  <Text secondary size="small">
                    אין ספקים עדיין. הוסף את הספק הראשון לקטגוריה זו.
                  </Text>
                </Box>
              ) : (
                <Box direction="vertical" gap="10px">
                  {category.vendors.map((vendor) => (
                    <VendorCard
                      key={vendor.vendor_id}
                      vendor={vendor}
                      onEdit={() => handleEditVendor(vendor)}
                      onDelete={() => handleDeleteVendor(vendor.vendor_id)}
                      onToggleFavorite={() =>
                        handleToggleFavorite(vendor.vendor_id)
                      }
                      onDataRefresh={onDataRefresh}
                      onDownloadFile={handleDownloadFile}
                      onDeleteFile={handleDeleteFile}
                      formatCurrency={formatCurrency}
                      isHighlighted={highlightedVendorId === vendor.vendor_id}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Card.Content>
      </Card>

      <Modal
        isOpen={showVendorModal}
        onRequestClose={() => {
          setShowVendorModal(false);
          setEditingVendor(null);
        }}
      >
        <VendorModal
          vendor={editingVendor}
          categories={[category]}
          selectedCategoryId={category.category_id}
          onSave={handleSaveVendor}
          onClose={() => {
            setShowVendorModal(false);
            setEditingVendor(null);
          }}
        />
      </Modal>
    </>
  );
};

export default BudgetCategoryCard;
