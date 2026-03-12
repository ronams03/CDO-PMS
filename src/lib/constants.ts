// Application constants for Cagayan de Oro City LGU Management System

export const APP_NAME = 'Cagayan de Oro City LGU Management System'
export const APP_SHORT_NAME = 'CDO LGU System'
export const APP_VERSION = '1.0.0'

export const APP_DESCRIPTION = 'Integrated Local Government Unit Management System for Cagayan de Oro City, Philippines'

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Administrator',
  LGU_ADMIN: 'LGU Administrator',
  DEPARTMENT_HEAD: 'Department Head',
  STAFF: 'Staff Member',
  BARANGAY_OFFICIAL: 'Barangay Official',
  CITIZEN: 'Citizen',
} as const

export const STATUS_COLORS = {
  // Request Status
  PENDING: 'yellow',
  UNDER_REVIEW: 'blue',
  APPROVED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
  COMPLETED: 'emerald',
  
  // Complaint Status
  SUBMITTED: 'yellow',
  ACKNOWLEDGED: 'blue',
  IN_PROGRESS: 'orange',
  RESOLVED: 'green',
  CLOSED: 'gray',
  
  // Priority
  LOW: 'gray',
  MEDIUM: 'blue',
  HIGH: 'orange',
  CRITICAL: 'red',
} as const

export const STATUS_LABELS = {
  REQUEST: {
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed',
  },
  COMPLAINT: {
    SUBMITTED: 'Submitted',
    ACKNOWLEDGED: 'Acknowledged',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
  },
  PERMIT: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    EXPIRED: 'Expired',
  },
  ANNOUNCEMENT: {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
  },
} as const

export const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
} as const

export const CIVIL_STATUS_LABELS = {
  SINGLE: 'Single',
  MARRIED: 'Married',
  WIDOWED: 'Widowed',
  DIVORCED: 'Divorced',
  SEPARATED: 'Separated',
} as const

export const EMPLOYMENT_STATUS_LABELS = {
  EMPLOYED: 'Employed',
  UNEMPLOYED: 'Unemployed',
  SELF_EMPLOYED: 'Self-Employed',
  RETIRED: 'Retired',
  STUDENT: 'Student',
} as const

export const CDO_BARANGAYS = [
  // Poblacion Barangays (1-40)
  { code: '001', name: 'Barangay 1', district: 'Poblacion' },
  { code: '002', name: 'Barangay 2', district: 'Poblacion' },
  { code: '003', name: 'Barangay 3', district: 'Poblacion' },
  { code: '004', name: 'Barangay 4', district: 'Poblacion' },
  { code: '005', name: 'Barangay 5', district: 'Poblacion' },
  { code: '006', name: 'Barangay 6', district: 'Poblacion' },
  { code: '007', name: 'Barangay 7', district: 'Poblacion' },
  { code: '008', name: 'Barangay 8', district: 'Poblacion' },
  { code: '009', name: 'Barangay 9', district: 'Poblacion' },
  { code: '010', name: 'Barangay 10', district: 'Poblacion' },
  { code: '011', name: 'Barangay 11', district: 'Poblacion' },
  { code: '012', name: 'Barangay 12', district: 'Poblacion' },
  { code: '013', name: 'Barangay 13', district: 'Poblacion' },
  { code: '014', name: 'Barangay 14', district: 'Poblacion' },
  { code: '015', name: 'Barangay 15', district: 'Poblacion' },
  { code: '016', name: 'Barangay 16', district: 'Poblacion' },
  { code: '017', name: 'Barangay 17', district: 'Poblacion' },
  { code: '018', name: 'Barangay 18', district: 'Poblacion' },
  { code: '019', name: 'Barangay 19', district: 'Poblacion' },
  { code: '020', name: 'Barangay 20', district: 'Poblacion' },
  { code: '021', name: 'Barangay 21', district: 'Poblacion' },
  { code: '022', name: 'Barangay 22', district: 'Poblacion' },
  { code: '023', name: 'Barangay 23', district: 'Poblacion' },
  { code: '024', name: 'Barangay 24', district: 'Poblacion' },
  { code: '025', name: 'Barangay 25', district: 'Poblacion' },
  { code: '026', name: 'Barangay 26', district: 'Poblacion' },
  { code: '027', name: 'Barangay 27', district: 'Poblacion' },
  { code: '028', name: 'Barangay 28', district: 'Poblacion' },
  { code: '029', name: 'Barangay 29', district: 'Poblacion' },
  { code: '030', name: 'Barangay 30', district: 'Poblacion' },
  { code: '031', name: 'Barangay 31', district: 'Poblacion' },
  { code: '032', name: 'Barangay 32', district: 'Poblacion' },
  { code: '033', name: 'Barangay 33', district: 'Poblacion' },
  { code: '034', name: 'Barangay 34', district: 'Poblacion' },
  { code: '035', name: 'Barangay 35', district: 'Poblacion' },
  { code: '036', name: 'Barangay 36', district: 'Poblacion' },
  { code: '037', name: 'Barangay 37', district: 'Poblacion' },
  { code: '038', name: 'Barangay 38', district: 'Poblacion' },
  { code: '039', name: 'Barangay 39', district: 'Poblacion' },
  { code: '040', name: 'Barangay 40', district: 'Poblacion' },
  // Non-Poblacion Barangays
  { code: 'CARMEN', name: 'Carmen', district: 'District 1' },
  { code: 'PATAG', name: 'Patag', district: 'District 1' },
  { code: 'IPONAN', name: 'Iponan', district: 'District 1' },
  { code: 'BALULANG', name: 'Balulang', district: 'District 1' },
  { code: 'LUMBIA', name: 'Lumbia', district: 'District 1' },
  { code: 'BAYABAS', name: 'Bayabas', district: 'District 2' },
  { code: 'AGUSAN', name: 'Agusan', district: 'District 2' },
  { code: 'MACABALAN', name: 'Macabalan', district: 'District 2' },
  { code: 'PUNTOD', name: 'Puntod', district: 'District 2' },
  { code: 'KAUSWAGAN', name: 'Kauswagan', district: 'District 2' },
  { code: 'BONBON', name: 'Bonbon', district: 'District 2' },
  { code: 'PUERTO', name: 'Puerto', district: 'District 3' },
  { code: 'BUGO', name: 'Bugo', district: 'District 3' },
  { code: 'TABLON', name: 'Tablon', district: 'District 3' },
  { code: 'GUSA', name: 'Gusa', district: 'District 3' },
  { code: 'CUGMAN', name: 'Cugman', district: 'District 3' },
  { code: 'FS-CATANICO', name: 'F.S. Catanico', district: 'District 3' },
  { code: 'TAGPANGI', name: 'Tagpangi', district: 'District 4' },
  { code: 'TAGLIMAO', name: 'Taglimao', district: 'District 4' },
  { code: 'TIGNAPOLOAN', name: 'Tignapoloan', district: 'District 4' },
  { code: 'BAIKINGON', name: 'Baikingon', district: 'District 4' },
  { code: 'SAN-SIMON', name: 'San Simon', district: 'District 4' },
  { code: 'CANITOAN', name: 'Canitoan', district: 'District 4' },
  { code: 'INDAHAG', name: 'Indahag', district: 'District 4' },
  { code: 'PAGATPAT', name: 'Pagatpat', district: 'District 4' },
  { code: 'PIGSAG-AN', name: 'Pigsag-an', district: 'District 4' },
  { code: 'TUMPAGON', name: 'Tumpagon', district: 'District 4' },
  { code: 'TUBURAN', name: 'Tuburan', district: 'District 4' },
  { code: 'DANSOLIHON', name: 'Dansolihon', district: 'District 4' },
] as const

export const DEPARTMENTS = [
  { code: 'CRO', name: 'Civil Registry Office', shortName: 'CRO', description: 'Handles birth, death, and marriage certificates' },
  { code: 'BPLO', name: 'Business Permit and Licensing Office', shortName: 'BPLO', description: 'Processes business permits and licenses' },
  { code: 'TREASURY', name: "City Treasurer's Office", shortName: 'CTO', description: 'Handles tax collection and treasury services' },
  { code: 'ASSESSOR', name: "City Assessor's Office", shortName: 'CAO', description: 'Property assessment and valuation' },
  { code: 'CPDO', name: 'City Planning and Development Office', shortName: 'CPDO', description: 'City planning and development coordination' },
  { code: 'CEO', name: 'City Engineering Office', shortName: 'CEO', description: 'Infrastructure and engineering services' },
  { code: 'CHO', name: 'City Health Office', shortName: 'CHO', description: 'Public health services and programs' },
  { code: 'CSWDO', name: 'City Social Welfare and Development Office', shortName: 'CSWDO', description: 'Social welfare programs and services' },
  { code: 'CDRRMO', name: 'City Disaster Risk Reduction and Management Office', shortName: 'CDRRMO', description: 'Disaster preparedness and response' },
  { code: 'HRMO', name: 'Human Resource Management Office', shortName: 'HRMO', description: 'Human resources and personnel management' },
  { code: 'OCM', name: 'Office of the City Mayor', shortName: 'OCM', description: 'Executive office of the city mayor' },
  { code: 'OVCM', name: 'Office of the Vice City Mayor', shortName: 'OVCM', description: 'Legislative support office' },
] as const

export const COMPLAINT_CATEGORIES = [
  'Infrastructure',
  'Public Safety',
  'Environmental',
  'Health',
  'Traffic & Transportation',
  'Public Services',
  'Social Services',
  'Peace & Order',
  'Others',
] as const

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const

export const DATE_FORMAT = 'MMMM d, yyyy'
export const DATETIME_FORMAT = 'MMMM d, yyyy h:mm a'
