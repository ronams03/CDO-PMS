import { z } from 'zod'

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'LGU_ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'BARANGAY_OFFICIAL', 'CITIZEN']),
  departmentId: z.string().optional(),
  barangayId: z.string().optional(),
})

// User validators
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'LGU_ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'BARANGAY_OFFICIAL', 'CITIZEN']),
  departmentId: z.string().optional().nullable(),
  barangayId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  suffix: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  role: z.enum(['SUPER_ADMIN', 'LGU_ADMIN', 'DEPARTMENT_HEAD', 'STAFF', 'BARANGAY_OFFICIAL', 'CITIZEN']).optional(),
  departmentId: z.string().optional().nullable(),
  barangayId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Resident validators
export const residentCreateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional().nullable(),
  civilStatus: z.enum(['SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED', 'SEPARATED']).optional().nullable(),
  nationality: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  employmentStatus: z.enum(['EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'RETIRE', 'STUDENT']).optional().nullable(),
  educationLevel: z.string().optional().nullable(),
  bloodType: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  barangayId: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  isVoter: z.boolean().optional(),
  isHeadOfHousehold: z.boolean().optional(),
  householdId: z.string().optional().nullable(),
  fourPsMember: z.boolean().optional(),
  seniorCitizen: z.boolean().optional(),
  pwd: z.boolean().optional(),
  soloParent: z.boolean().optional(),
})

export const residentUpdateSchema = residentCreateSchema.partial()

// Barangay validators
export const barangayCreateSchema = z.object({
  code: z.string().min(1, 'Barangay code is required'),
  name: z.string().min(1, 'Barangay name is required'),
  district: z.string().optional().nullable(),
  population: z.number().int().positive().optional().nullable(),
  areaSqKm: z.number().positive().optional().nullable(),
  captainName: z.string().optional().nullable(),
  captainPhone: z.string().optional().nullable(),
  captainEmail: z.string().email().optional().nullable().or(z.literal('')),
  officeAddress: z.string().optional().nullable(),
  officeHours: z.string().optional().nullable(),
})

export const barangayUpdateSchema = barangayCreateSchema.partial()

// Department validators
export const departmentCreateSchema = z.object({
  code: z.string().min(1, 'Department code is required'),
  name: z.string().min(1, 'Department name is required'),
  shortName: z.string().min(1, 'Short name is required'),
  description: z.string().optional().nullable(),
  headName: z.string().optional().nullable(),
  headEmail: z.string().email().optional().nullable().or(z.literal('')),
  headPhone: z.string().optional().nullable(),
  officeAddress: z.string().optional().nullable(),
  officeHours: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
})

export const departmentUpdateSchema = departmentCreateSchema.partial()

// Service validators
export const serviceCreateSchema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  code: z.string().min(1, 'Service code is required'),
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  processingDays: z.number().int().min(1).optional(),
  fee: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

// Service Request validators
export const serviceRequestCreateSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  residentId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  remarks: z.string().optional().nullable(),
})

export const serviceRequestUpdateSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  adminRemarks: z.string().optional().nullable(),
})

// Complaint validators
export const complaintCreateSchema = z.object({
  barangayId: z.string().optional().nullable(),
  residentId: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional().nullable(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  incidentDate: z.string().optional().nullable(),
})

export const complaintUpdateSchema = z.object({
  status: z.enum(['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assignedToId: z.string().optional().nullable(),
  resolution: z.string().optional().nullable(),
})

// Permit validators
export const permitCreateSchema = z.object({
  permitTypeId: z.string().min(1, 'Permit type is required'),
  residentId: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  businessType: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
})

export const permitUpdateSchema = z.object({
  status: z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
})

// Announcement validators
export const announcementCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  expiresAt: z.string().optional().nullable(),
})

export const announcementUpdateSchema = announcementCreateSchema.partial()

// Appointment validators
export const appointmentCreateSchema = z.object({
  slotId: z.string().min(1, 'Time slot is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  remarks: z.string().optional().nullable(),
})

// Pagination validator
export const paginationSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
})

// Types
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type ResidentCreateInput = z.infer<typeof residentCreateSchema>
export type ResidentUpdateInput = z.infer<typeof residentUpdateSchema>
export type BarangayCreateInput = z.infer<typeof barangayCreateSchema>
export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
export type ServiceRequestCreateInput = z.infer<typeof serviceRequestCreateSchema>
export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>
export type PermitCreateInput = z.infer<typeof permitCreateSchema>
export type AnnouncementCreateInput = z.infer<typeof announcementCreateSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
