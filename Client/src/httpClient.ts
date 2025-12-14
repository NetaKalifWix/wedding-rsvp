import {
  Guest,
  User,
  WeddingDetails,
  ClientLog,
  Task,
  PartnerInfo,
  BudgetOverview,
  BudgetCategory,
  BudgetCategoryName,
  BudgetCategoryWithSpending,
  Vendor,
  VendorWithPayments,
  Payment,
  VendorFile,
} from "./types";

const url = process.env.REACT_APP_SERVER_URL;

// ==================== HTTP Helpers ====================

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: object;
}

/**
 * Generic fetch wrapper that handles common patterns:
 * - JSON headers
 * - Error handling
 * - Response parsing
 */
const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = "GET", body } = options;

  const config: RequestInit = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${url}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};

// Shorthand methods
const get = <T>(endpoint: string) => request<T>(endpoint);
const post = <T>(endpoint: string, body: object) =>
  request<T>(endpoint, { method: "POST", body });
const patch = <T>(endpoint: string, body: object) =>
  request<T>(endpoint, { method: "PATCH", body });
const del = <T>(endpoint: string, body?: object) =>
  request<T>(endpoint, { method: "DELETE", body });

// ==================== User Methods ====================

const addUser = (newUser: User) => patch<void>("/addUser", { newUser });

const deleteUser = (userID: User["userID"]) =>
  del<void>("/deleteUser", { userID });

// ==================== Guest Methods ====================

const deleteAllGuests = async (userID: User["userID"]) => {
  return await del<Guest[]>("/deleteAllGuests", {
    userID,
  });
};

const deleteGuest = async (userID: User["userID"], guest: Guest) => {
  return await del<Guest[]>("/deleteGuest", {
    userID,
    guest: { name: guest.name, phone: guest.phone },
  });
};

const setRSVP = async (
  userID: User["userID"],
  guest: Guest,
  value: number | null,
  oldGuestsList: Guest[]
) => {
  try {
    return await post<Guest[]>("/updateRsvp", {
      guest: { ...guest, RSVP: value },
      userID,
    });
  } catch {
    return oldGuestsList;
  }
};

const addGuests = async (userID: User["userID"], newGuests: Guest[]) => {
  return await patch<Guest[]>("/addGuests", {
    guestsToAdd: newGuests,
    userID,
  });
};

const getGuestsList = async (userID: User["userID"]) => {
  return await post<Guest[]>("/guestsList", { userID });
};

const updateGuestsGroups = async (
  userID: User["userID"],
  updatedGuests: Guest[],
  oldGuestsList: Guest[]
) => {
  try {
    const newGuestsList = await patch<Guest[]>("/updateGuestsGroups", {
      guests: updatedGuests,
      userID,
    });
    return newGuestsList;
  } catch {
    return oldGuestsList;
  }
};

// ==================== Message Methods ====================

interface MessageResult {
  success: number;
  fail: number;
  failGuestsList: { guestName: string; logMessage: string }[];
}

const sendMessage = (
  userID: User["userID"],
  options?: { messageGroup?: number; messageType?: string; customText?: string }
) => post<MessageResult>("/sendMessage", { userID, options });

// ==================== Wedding Info Methods ====================

// Note: saveWeddingInfo uses FormData (file upload), can't use helper
const saveWeddingInfo = async (formData: FormData) => {
  const response = await fetch(`${url}/saveWeddingInfo`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
};

const getWeddingInfo = async (
  userID: User["userID"]
): Promise<(WeddingDetails & { imageURL: string }) | null> => {
  const data = await get<WeddingDetails & { fileID?: string }>(
    `/getWeddingInfo/${userID}`
  );
  if (!data) return null;
  return {
    ...data,
    imageURL: data.fileID ? `${url}/getImage/${userID}` : "",
  };
};

// ==================== Logs Methods ====================

const getLogs = (userID: string) => get<ClientLog[]>(`/logs/${userID}`);

// ==================== Admin Methods ====================

const checkAdmin = async (userID: string): Promise<boolean> => {
  try {
    const { isAdmin } = await post<{ isAdmin: boolean }>("/checkAdmin", {
      userID,
    });
    return isAdmin;
  } catch {
    return false;
  }
};

const getUsers = (userID: string) => post<User[]>("/getUsers", { userID });

// ==================== Task Methods ====================

type NewTask = Pick<Task, "title" | "timeline_group" | "priority" | "assignee">;
type TaskUpdates = Partial<NewTask>;

const getTasks = (userID: string) => get<Task[]>(`/tasks/${userID}`);

const addTask = (userID: string, task: NewTask) =>
  post<Task>("/tasks", { userID, task });

const updateTaskCompletion = (
  userID: string,
  taskId: number,
  isCompleted: boolean
) => patch<Task>(`/tasks/${taskId}/complete`, { userID, isCompleted });

const updateTask = (userID: string, taskId: number, updates: TaskUpdates) =>
  patch<Task>(`/tasks/${taskId}`, { userID, updates });

const deleteTask = (userID: string, taskId: number) =>
  del<void>(`/tasks/${taskId}`, { userID });

// ==================== Partner/Collaboration Methods ====================

const generateInviteCode = async (userID: string): Promise<string> => {
  const { inviteCode } = await post<{ inviteCode: string }>(
    "/partner/generate-invite",
    { userID }
  );
  return inviteCode;
};

const acceptInvite = async (
  userID: string,
  inviteCode: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    return await post<{ success: boolean }>("/partner/accept-invite", {
      userID,
      inviteCode,
    });
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
};

const unlinkPartner = async (userID: string): Promise<boolean> => {
  try {
    await post<void>("/partner/unlink", { userID });
    return true;
  } catch {
    return false;
  }
};

const getPartnerInfo = async (userID: string): Promise<PartnerInfo> => {
  try {
    return await get<PartnerInfo>(`/partner/info/${userID}`);
  } catch {
    return { hasPartner: false, isLinkedAccount: false };
  }
};

// ==================== Budget & Vendor Methods ====================

const updateTotalBudget = (userID: string, total_budget: number) =>
  patch<void>("/budget/total", { userID, total_budget });

const updateEstimatedGuests = (userID: string, estimated_guests: number) =>
  patch<void>("/budget/estimated-guests", { userID, estimated_guests });

const getBudgetOverview = (userID: string) =>
  get<BudgetOverview>(`/budget/overview/${userID}`);

const getBudgetCategories = (userID: string) =>
  get<BudgetCategoryWithSpending[]>(`/budget/categories/${userID}`);

const addBudgetCategory = (userID: string, name: BudgetCategoryName) =>
  post<BudgetCategory>("/budget/categories", { userID, name });

const deleteBudgetCategory = (userID: string, categoryId: number) =>
  del<void>(`/budget/categories/${categoryId}`, { userID });

const getVendors = (userID: string) =>
  get<VendorWithPayments[]>(`/budget/vendors/${userID}`);

type NewVendor = Omit<
  Vendor,
  "vendor_id" | "user_id" | "created_at" | "category_name"
>;
const addVendor = (userID: string, vendor: NewVendor) =>
  post<Vendor>("/budget/vendors", { userID, vendor });

type VendorUpdates = Partial<
  Omit<Vendor, "vendor_id" | "user_id" | "created_at">
>;
const updateVendor = (
  userID: string,
  vendorId: number,
  updates: VendorUpdates
) => patch<Vendor>(`/budget/vendors/${vendorId}`, { userID, updates });

const deleteVendor = (userID: string, vendorId: number) =>
  del<void>(`/budget/vendors/${vendorId}`, { userID });

const toggleVendorFavorite = (userID: string, vendorId: number) =>
  patch<Vendor>(`/budget/vendors/${vendorId}/favorite`, { userID });

const addPayment = (
  userID: string,
  vendor_id: number,
  amount: number,
  payment_date: string,
  notes?: string
) =>
  post<Payment>("/budget/payments", {
    userID,
    vendor_id,
    amount,
    payment_date,
    notes,
  });

const deletePayment = (userID: string, paymentId: number) =>
  del<void>(`/budget/payments/${paymentId}`, { userID });

// ==================== Vendor File Methods ====================

// Note: uploadVendorFile uses FormData (file upload), can't use helper
const uploadVendorFile = async (
  userID: string,
  vendorId: number,
  file: File
): Promise<VendorFile> => {
  const formData = new FormData();
  formData.append("userID", userID);
  formData.append("fileName", file.name); // Separate field for proper Hebrew support
  formData.append("file", file);

  const response = await fetch(`${url}/budget/vendors/${vendorId}/files`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  return await response.json();
};

const getVendorFileDownloadUrl = (userID: string, fileId: number): string =>
  `${url}/budget/files/${fileId}/download?userID=${encodeURIComponent(userID)}`;

const deleteVendorFile = (userID: string, fileId: number) =>
  del<void>(`/budget/files/${fileId}`, { userID });

// ==================== Exports ====================

export const httpRequests = {
  // User methods
  addUser,
  deleteUser,
  // Guest methods
  deleteAllGuests,
  deleteGuest,
  setRSVP,
  addGuests,
  getGuestsList,
  updateGuestsGroups,
  // Message methods
  sendMessage,
  // Wedding info methods
  saveWeddingInfo,
  getWeddingInfo,
  // Logs methods
  getLogs,
  // Admin methods
  checkAdmin,
  getUsers,
  // Task methods
  getTasks,
  addTask,
  updateTaskCompletion,
  updateTask,
  deleteTask,
  // Partner methods
  generateInviteCode,
  acceptInvite,
  unlinkPartner,
  getPartnerInfo,
  // Budget & Vendor methods
  updateTotalBudget,
  updateEstimatedGuests,
  getBudgetOverview,
  getBudgetCategories,
  addBudgetCategory,
  deleteBudgetCategory,
  getVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  toggleVendorFavorite,
  addPayment,
  deletePayment,
  // Vendor file methods
  uploadVendorFile,
  getVendorFileDownloadUrl,
  deleteVendorFile,
};
