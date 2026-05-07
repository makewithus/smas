// ROLES
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  BOYS_ADMIN: "boys_admin",
  GIRLS_ADMIN: "girls_admin",
};

// PORTALS
export const PORTALS = {
  BOYS: "boys",
  GIRLS: "girls",
  SUPER: "super",
};

// COLLECTIONS - dynamic based on portal
export const getStudentsCollection = (portal) => `${portal}_students`;
export const getReceiptsCollection = (portal) => `${portal}_receipts`;
export const getExpensesCollection = (portal) => `${portal}_expenses`;

// STUDENT CLASSES
export const CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Other",
];

// STUDENT STATUS
export const STUDENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// EXPENSE CATEGORIES
export const EXPENSE_CATEGORIES = [
  { value: "event", label: "Event", color: "#D39542" },
  { value: "maintenance", label: "Maintenance", color: "#4A7FA5" },
  { value: "electricity", label: "Electricity", color: "#D4A017" },
  { value: "stationery", label: "Stationery", color: "#3A7D44" },
  { value: "transportation", label: "Transportation", color: "#7B5EA7" },
  { value: "miscellaneous", label: "Miscellaneous", color: "#8C7B6B" },
];

// PAYMENT METHODS
export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "Online Transfer",
  "Other",
];

// NOTICE PRIORITIES
export const NOTICE_PRIORITIES = [
  { value: "high", label: "High", borderColor: "#1B4332" },
  { value: "medium", label: "Medium", borderColor: "#D39542" },
  { value: "low", label: "Low", borderColor: "#8C7B6B" },
];

// EVENT STATUS
export const EVENT_STATUS = ["upcoming", "ongoing", "completed"];

// PAGINATION
export const PAGE_SIZES = [20, 50, 100];
export const DEFAULT_PAGE_SIZE = 20;

// NAV ITEMS for Sidebar
export const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Students", href: "/students", icon: "Users" },
  { label: "Receipts", href: "/receipts", icon: "Receipt" },
  { label: "Expenses", href: "/expenses", icon: "Wallet" },
  { label: "Events", href: "/events", icon: "Calendar" },
  { label: "Notices", href: "/notices", icon: "Bell" },
  { label: "Reports", href: "/reports", icon: "BarChart2" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

// Firebase Error Messages
export const FIREBASE_ERROR_MESSAGES = {
  "auth/wrong-password": "Incorrect password",
  "auth/user-not-found": "No account found with this email",
  "auth/too-many-requests": "Too many attempts. Please try again later",
  "auth/network-request-failed": "Network error. Check your connection",
  "auth/invalid-email": "Invalid email address",
  "auth/user-disabled": "This account has been disabled",
  "auth/invalid-credential":
    "Invalid credentials. Please check your email and password",
};

// Institution Info (can be customized)
export const INSTITUTION = {
  name: "Student Administration",
  fullName: "Student Management & Administration System",
  shortName: "SMAS",
  address: "123 Education Street, City - 123456",
  phone: "+91 98765 43210",
  email: "admin@institution.edu",
  website: "www.institution.edu",
};

// Default Notices for Fallback
export const DEFAULT_NOTICES = [
  "Welcome to the Student Administration System",
  "All students must submit their documents by the end of this month",
  "New session admissions are now open",
];

// Alias — same as CLASSES (for backwards compat)
export const CLASS_OPTIONS = CLASSES.map((c) => ({ value: c, label: c }));

export const FEE_TYPES = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "library", label: "Library Fee" },
  { value: "sports", label: "Sports Fee" },
  { value: "hostel", label: "Hostel Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "development", label: "Development Fee" },
  { value: "other", label: "Other" },
];

export const PAYMENT_STATUS = [
  { value: "paid", label: "Paid", color: "#1B4332" },
  { value: "pending", label: "Pending", color: "#D39542" },
  { value: "overdue", label: "Overdue", color: "#dc2626" },
  { value: "partial", label: "Partial", color: "#8C7B6B" },
];

export const ROOMS = [
  "Room 101",
  "Room 102",
  "Room 103",
  "Room 104",
  "Room 105",
  "Room 201",
  "Room 202",
  "Room 203",
  "Room 204",
  "Room 205",
  "Hall A",
  "Hall B",
  "Auditorium",
  "Ground",
  "Library",
];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
