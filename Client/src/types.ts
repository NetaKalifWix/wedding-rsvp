export interface Guest {
  name: string;
  phone: string;
  whose: string;
  circle: string;
  numberOfGuests: number;
  RSVP: number | undefined;
  messageGroup?: number; // Group number for message batching (1-N)
}

export type RsvpStatus = "pending" | "confirmed" | "declined";
export interface FilterOptions {
  whose: Guest["whose"][];
  circle: Guest["circle"][];
  rsvpStatus: RsvpStatus[];
  searchTerm: string;
}
export type SetGuestsList = React.Dispatch<React.SetStateAction<Guest[]>>;

export interface WeddingDetails {
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  hour: string;
  location_name: string;
  additional_information: string;
  waze_link: string;
  gift_link: string;
  thank_you_message?: string;
  fileID: string;
  reminder_day?: "day_before" | "wedding_day"; // Which day to send reminder
  reminder_time?: string; // Time to send reminder (HH:MM format)
  total_budget?: number; // Total wedding budget
  estimated_guests?: number; // Estimated guest count for budget planning
}

export interface User {
  userID: string;
  name: string;
  email: string;
}

export interface PartnerInfo {
  hasPartner: boolean;
  isLinkedAccount: boolean;
  partner?: User;
  primaryUser?: User;
  inviteCode?: string;
  inviteExpires?: string;
}

export interface ClientLog {
  id: number;
  userID: string;
  message: string;
  createdAt: string;
}

export type TaskPriority = 1 | 2 | 3; // 1 = High, 2 = Medium, 3 = Low
export type TaskAssignee = "bride" | "groom" | "both";

export interface Task {
  task_id: number;
  user_id: string;
  title: string;
  timeline_group: TimelineGroup;
  is_completed: boolean;
  priority?: TaskPriority;
  assignee?: TaskAssignee;
  sort_order?: number;
  created_at?: string;
}

export interface TaskStats {
  total: number;
  completed: number;
}

export type TimelineGroup =
  | "Just Engaged"
  | "12 Months Before"
  | "9 Months Before"
  | "6 Months Before"
  | "3 Months Before"
  | "1 Month Before"
  | "1 Week Before"
  | "Wedding Day Bride"
  | "Wedding Day Groom"
  | "Wedding Day";

export type BudgetCategoryName =
  | "אולם"
  | "קייטרינג"
  | "צילום"
  | "מוזיקה"
  | "עיצוב"
  | "לבוש"
  | "טיפוח"
  | "תחבורה"
  | "מלון"
  | "אחר";

export interface BudgetCategory {
  category_id: number;
  user_id: string;
  name: BudgetCategoryName;
  created_at?: string;
}

export type VendorStatus = "יצרנו קשר" | "הוזמן" | "שולם חלקית" | "שולם";

export interface VendorFile {
  file_id: number;
  vendor_id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface Vendor {
  vendor_id: number;
  user_id: string;
  name: string;
  job_title?: string; // e.g., "DJ", "Band", "Live Singer" under Music category
  category_id: number;
  category_name?: BudgetCategoryName;
  agreed_cost: number;
  status: VendorStatus;
  phone?: string;
  email?: string;
  notes?: string;
  is_favorite: boolean;
  created_at?: string;
  files?: VendorFile[];
}

export interface Payment {
  payment_id: number;
  vendor_id: number;
  amount: number;
  payment_date: string;
  notes?: string;
  created_at?: string;
}

export interface VendorWithPayments extends Vendor {
  payments: Payment[];
  files: VendorFile[];
  total_paid: number;
  remaining_balance: number;
}

export interface BudgetCategoryWithSpending extends BudgetCategory {
  actual_spending: number;
  vendors: VendorWithPayments[];
}

export interface BudgetOverview {
  total_budget: number;
  total_expenses: number;
  remaining_budget: number;
  usage_percentage: number;
  estimated_guests: number;
  price_per_guest: number;
  categories: BudgetCategoryWithSpending[];
}
