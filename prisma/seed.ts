import { PrismaClient, UserRole, Gender, CivilStatus, EmploymentStatus, RequestStatus, ComplaintStatus, ComplaintPriority, PermitStatus, AnnouncementStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.permitAttachment.deleteMany()
  await prisma.permit.deleteMany()
  await prisma.permitType.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.appointmentSlot.deleteMany()
  await prisma.complaintStatusHistory.deleteMany()
  await prisma.complaintAttachment.deleteMany()
  await prisma.complaint.deleteMany()
  await prisma.requestStatusHistory.deleteMany()
  await prisma.requestAttachment.deleteMany()
  await prisma.serviceRequest.deleteMany()
  await prisma.service.deleteMany()
  await prisma.household.deleteMany()
  await prisma.resident.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()
  await prisma.barangay.deleteMany()
  await prisma.complaintCategory.deleteMany()
  await prisma.documentCategory.deleteMany()

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: { code: 'CRO', name: 'Civil Registry Office', shortName: 'CRO', description: 'Handles birth, death, and marriage certificates', order: 1 },
    }),
    prisma.department.create({
      data: { code: 'BPLO', name: 'Business Permit and Licensing Office', shortName: 'BPLO', description: 'Processes business permits and licenses', order: 2 },
    }),
    prisma.department.create({
      data: { code: 'TREASURY', name: "City Treasurer's Office", shortName: 'CTO', description: 'Handles tax collection and treasury services', order: 3 },
    }),
    prisma.department.create({
      data: { code: 'ASSESSOR', name: "City Assessor's Office", shortName: 'CAO', description: 'Property assessment and valuation', order: 4 },
    }),
    prisma.department.create({
      data: { code: 'CPDO', name: 'City Planning and Development Office', shortName: 'CPDO', description: 'City planning and development coordination', order: 5 },
    }),
    prisma.department.create({
      data: { code: 'CEO', name: 'City Engineering Office', shortName: 'CEO', description: 'Infrastructure and engineering services', order: 6 },
    }),
    prisma.department.create({
      data: { code: 'CHO', name: 'City Health Office', shortName: 'CHO', description: 'Public health services and programs', order: 7 },
    }),
    prisma.department.create({
      data: { code: 'CSWDO', name: 'City Social Welfare and Development Office', shortName: 'CSWDO', description: 'Social welfare programs and services', order: 8 },
    }),
    prisma.department.create({
      data: { code: 'CDRRMO', name: 'City Disaster Risk Reduction and Management Office', shortName: 'CDRRMO', description: 'Disaster preparedness and response', order: 9 },
    }),
    prisma.department.create({
      data: { code: 'HRMO', name: 'Human Resource Management Office', shortName: 'HRMO', description: 'Human resources and personnel management', order: 10 },
    }),
  ])
  console.log(`Created ${departments.length} departments`)

  // Create Barangays
  const barangays = await Promise.all([
    prisma.barangay.create({ data: { code: '001', name: 'Barangay 1', district: 'Poblacion', population: 2500, captainName: 'Juan Dela Cruz', captainPhone: '+63-912-345-0001' } }),
    prisma.barangay.create({ data: { code: '002', name: 'Barangay 2', district: 'Poblacion', population: 2300, captainName: 'Maria Santos', captainPhone: '+63-912-345-0002' } }),
    prisma.barangay.create({ data: { code: 'CARMEN', name: 'Carmen', district: 'District 1', population: 45000, captainName: 'Pedro Reyes', captainPhone: '+63-912-345-0003' } }),
    prisma.barangay.create({ data: { code: 'PATAG', name: 'Patag', district: 'District 1', population: 32000, captainName: 'Ana Garcia', captainPhone: '+63-912-345-0004' } }),
    prisma.barangay.create({ data: { code: 'BALULANG', name: 'Balulang', district: 'District 1', population: 28000, captainName: 'Jose Mendoza', captainPhone: '+63-912-345-0005' } }),
    prisma.barangay.create({ data: { code: 'LUMBIA', name: 'Lumbia', district: 'District 1', population: 25000, captainName: 'Elena Torres', captainPhone: '+63-912-345-0006' } }),
    prisma.barangay.create({ data: { code: 'IPONAN', name: 'Iponan', district: 'District 1', population: 22000, captainName: 'Carlos Villanueva', captainPhone: '+63-912-345-0007' } }),
    prisma.barangay.create({ data: { code: 'BAYABAS', name: 'Bayabas', district: 'District 2', population: 18000, captainName: 'Rosa Fernandez', captainPhone: '+63-912-345-0008' } }),
    prisma.barangay.create({ data: { code: 'AGUSAN', name: 'Agusan', district: 'District 2', population: 35000, captainName: 'Miguel Cruz', captainPhone: '+63-912-345-0009' } }),
    prisma.barangay.create({ data: { code: 'MACABALAN', name: 'Macabalan', district: 'District 2', population: 30000, captainName: 'Carmen Aquino', captainPhone: '+63-912-345-0010' } }),
    prisma.barangay.create({ data: { code: 'PUNTOD', name: 'Puntod', district: 'District 2', population: 27000, captainName: 'Fernando Bautista', captainPhone: '+63-912-345-0011' } }),
    prisma.barangay.create({ data: { code: 'KAUSWAGAN', name: 'Kauswagan', district: 'District 2', population: 42000, captainName: 'Luzviminda Soriano', captainPhone: '+63-912-345-0012' } }),
    prisma.barangay.create({ data: { code: 'PUERTO', name: 'Puerto', district: 'District 3', population: 38000, captainName: 'Roberto Magbanua', captainPhone: '+63-912-345-0013' } }),
    prisma.barangay.create({ data: { code: 'GUSA', name: 'Gusa', district: 'District 3', population: 33000, captainName: 'Teresita Lim', captainPhone: '+63-912-345-0014' } }),
    prisma.barangay.create({ data: { code: 'CUGMAN', name: 'Cugman', district: 'District 3', population: 29000, captainName: 'Antonio Chua', captainPhone: '+63-912-345-0015' } }),
    prisma.barangay.create({ data: { code: 'BUGO', name: 'Bugo', district: 'District 3', population: 26000, captainName: 'Grace Uy', captainPhone: '+63-912-345-0016' } }),
  ])
  console.log(`Created ${barangays.length} barangays`)

  // Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'superadmin@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'City',
        lastName: 'Administrator',
        role: UserRole.LGU_ADMIN,
        isActive: true,
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'dept.civilreg@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Civil',
        lastName: 'Registrar',
        role: UserRole.DEPARTMENT_HEAD,
        isActive: true,
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff.civilreg@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'John',
        middleName: 'Reyes',
        lastName: 'Staff',
        role: UserRole.STAFF,
        isActive: true,
        departmentId: departments[0].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'captain.carmen@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Pedro',
        lastName: 'Reyes',
        role: UserRole.BARANGAY_OFFICIAL,
        isActive: true,
        barangayId: barangays[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'citizen@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Juan',
        middleName: 'Santos',
        lastName: 'Dela Cruz',
        role: UserRole.CITIZEN,
        isActive: true,
        barangayId: barangays[2].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff.bplo@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Maria',
        lastName: 'Process',
        role: UserRole.STAFF,
        isActive: true,
        departmentId: departments[1].id,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff.treasury@cdo.gov.ph',
        password: hashedPassword,
        firstName: 'Jose',
        lastName: 'Treasury',
        role: UserRole.STAFF,
        isActive: true,
        departmentId: departments[2].id,
      },
    }),
  ])
  console.log(`Created ${users.length} users`)

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: { departmentId: departments[0].id, code: 'BC', name: 'Birth Certificate', description: 'Request for birth certificate copy', requirements: 'Valid ID of requester', processingDays: 3, fee: 155 },
    }),
    prisma.service.create({
      data: { departmentId: departments[0].id, code: 'DC', name: 'Death Certificate', description: 'Request for death certificate copy', requirements: 'Valid ID of requester', processingDays: 3, fee: 155 },
    }),
    prisma.service.create({
      data: { departmentId: departments[0].id, code: 'MC', name: 'Marriage Certificate', description: 'Request for marriage certificate copy', requirements: 'Valid ID of requester', processingDays: 3, fee: 155 },
    }),
    prisma.service.create({
      data: { departmentId: departments[0].id, code: 'CENOMAR', name: 'Certificate of No Marriage', description: 'Certificate of no marriage record', requirements: 'Valid ID of requester', processingDays: 5, fee: 210 },
    }),
    prisma.service.create({
      data: { departmentId: departments[1].id, code: 'BP', name: 'Business Permit', description: 'New business permit application', requirements: 'DTI Registration, Barangay Clearance, Valid ID', processingDays: 7, fee: 500 },
    }),
    prisma.service.create({
      data: { departmentId: departments[1].id, code: 'BPR', name: 'Business Permit Renewal', description: 'Annual business permit renewal', requirements: 'Previous permit, Latest tax payment', processingDays: 5, fee: 500 },
    }),
    prisma.service.create({
      data: { departmentId: departments[2].id, code: 'CTR', name: 'Community Tax Certificate', description: 'Community tax certificate (cedula)', requirements: 'Valid ID', processingDays: 1, fee: 50 },
    }),
    prisma.service.create({
      data: { departmentId: departments[6].id, code: 'MCERT', name: 'Medical Certificate', description: 'Request for medical certificate', requirements: 'Valid ID', processingDays: 2, fee: 0 },
    }),
  ])
  console.log(`Created ${services.length} services`)

  // Create Permit Types
  const permitTypes = await Promise.all([
    prisma.permitType.create({
      data: { departmentId: departments[1].id, code: 'BP-NEW', name: 'New Business Permit', description: 'For new businesses', requirements: 'DTI/SEC Registration, Barangay Clearance, Location Sketch', processingDays: 7, fee: 5000, validityDays: 365 },
    }),
    prisma.permitType.create({
      data: { departmentId: departments[1].id, code: 'BP-RENEW', name: 'Business Permit Renewal', description: 'Annual renewal of business permit', requirements: 'Previous permit, Tax clearance', processingDays: 5, fee: 3000, validityDays: 365 },
    }),
    prisma.permitType.create({
      data: { departmentId: departments[5].id, code: 'BLDG', name: 'Building Permit', description: 'Construction permit', requirements: 'Lot title, Tax declaration, Plans and specs', processingDays: 14, fee: 10000, validityDays: 180 },
    }),
    prisma.permitType.create({
      data: { departmentId: departments[5].id, code: 'ELEC', name: 'Electrical Permit', description: 'Electrical installation permit', requirements: 'Building permit, Electrical plans', processingDays: 7, fee: 2000, validityDays: 180 },
    }),
  ])
  console.log(`Created ${permitTypes.length} permit types`)

  // Create Complaint Categories
  const complaintCategories = await Promise.all([
    prisma.complaintCategory.create({ data: { name: 'Infrastructure', description: 'Roads, bridges, drainage, public facilities' } }),
    prisma.complaintCategory.create({ data: { name: 'Public Safety', description: 'Crime, security, traffic accidents' } }),
    prisma.complaintCategory.create({ data: { name: 'Environmental', description: 'Pollution, waste management, illegal logging' } }),
    prisma.complaintCategory.create({ data: { name: 'Health', description: 'Public health concerns, disease outbreaks' } }),
    prisma.complaintCategory.create({ data: { name: 'Traffic & Transportation', description: 'Traffic violations, public transport issues' } }),
    prisma.complaintCategory.create({ data: { name: 'Public Services', description: 'Water, electricity, communication services' } }),
  ])
  console.log(`Created ${complaintCategories.length} complaint categories`)

  // Create Residents
  const residents = await Promise.all([
    prisma.resident.create({
      data: {
        userId: users[5].id,
        firstName: 'Juan',
        middleName: 'Santos',
        lastName: 'Dela Cruz',
        birthDate: new Date('1990-05-15'),
        gender: Gender.MALE,
        civilStatus: CivilStatus.MARRIED,
        nationality: 'Filipino',
        religion: 'Roman Catholic',
        occupation: 'Software Developer',
        employmentStatus: EmploymentStatus.EMPLOYED,
        educationLevel: 'College Graduate',
        bloodType: 'O+',
        email: 'juan.delacruz@email.com',
        phone: '+63-917-123-4567',
        addressLine1: 'Block 5, Lot 8, Carmen Subdivision',
        barangayId: barangays[2].id,
        postalCode: '9000',
        emergencyContactName: 'Maria Dela Cruz',
        emergencyContactPhone: '+63-918-765-4321',
        emergencyContactRelation: 'Spouse',
        isVoter: true,
        isHeadOfHousehold: true,
        seniorCitizen: false,
        pwd: false,
      },
    }),
  ])
  console.log(`Created ${residents.length} residents`)

  // Create Service Requests
  const serviceRequests = await Promise.all([
    prisma.serviceRequest.create({
      data: {
        referenceNumber: 'REQ-LKJH-ABCD',
        serviceId: services[0].id,
        residentId: residents[0].id,
        createdById: users[5].id,
        status: RequestStatus.PENDING,
        priority: ComplaintPriority.MEDIUM,
        purpose: 'Need birth certificate for passport application',
      },
    }),
    prisma.serviceRequest.create({
      data: {
        referenceNumber: 'REQ-MNBV-EFGH',
        serviceId: services[4].id,
        createdById: users[5].id,
        status: RequestStatus.UNDER_REVIEW,
        priority: ComplaintPriority.HIGH,
        purpose: 'Starting a new sari-sari store business',
        processedById: users[3].id,
      },
    }),
    prisma.serviceRequest.create({
      data: {
        referenceNumber: 'REQ-ZXCV-IJKL',
        serviceId: services[6].id,
        residentId: residents[0].id,
        createdById: users[4].id,
        status: RequestStatus.APPROVED,
        priority: ComplaintPriority.LOW,
        purpose: 'Community tax certificate for employment requirement',
        processedById: users[3].id,
      },
    }),
  ])
  console.log(`Created ${serviceRequests.length} service requests`)

  // Create Complaints
  const complaints = await Promise.all([
    prisma.complaint.create({
      data: {
        referenceNumber: 'CMP-QWER-TYUI',
        barangayId: barangays[2].id,
        residentId: residents[0].id,
        createdById: users[5].id,
        category: 'Infrastructure',
        title: 'Potholes on Main Street',
        description: 'Large potholes causing traffic accidents on the main street of Carmen near the public market.',
        location: 'Main Street, Carmen Public Market area',
        status: ComplaintStatus.IN_PROGRESS,
        priority: ComplaintPriority.HIGH,
        incidentDate: new Date('2024-01-15'),
        assignedToId: users[3].id,
      },
    }),
    prisma.complaint.create({
      data: {
        referenceNumber: 'CMP-ASDF-GHJK',
        barangayId: barangays[4].id,
        createdById: users[4].id,
        category: 'Environmental',
        title: 'Illegal Dumping of Waste',
        description: 'Residents are dumping waste in the vacant lot near the barangay hall.',
        location: 'Near Balulang Barangay Hall',
        status: ComplaintStatus.ACKNOWLEDGED,
        priority: ComplaintPriority.MEDIUM,
      },
    }),
    prisma.complaint.create({
      data: {
        referenceNumber: 'CMP-ZXCV-BNMK',
        barangayId: barangays[0].id,
        createdById: users[5].id,
        category: 'Public Safety',
        title: 'Poor Street Lighting',
        description: 'Street lights have been non-functional for 2 weeks, causing safety concerns.',
        location: 'Barangay 1, near city hall',
        status: ComplaintStatus.SUBMITTED,
        priority: ComplaintPriority.HIGH,
      },
    }),
  ])
  console.log(`Created ${complaints.length} complaints`)

  // Create Announcements
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        title: 'System Launch Announcement',
        content: 'We are pleased to announce the launch of the new Cagayan de Oro City LGU Management System. This system will streamline government services and improve citizen engagement.',
        category: 'General',
        priority: ComplaintPriority.HIGH,
        status: AnnouncementStatus.PUBLISHED,
        authorId: users[0].id,
        publishedAt: new Date(),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Business Permit Renewal Period',
        content: 'The annual business permit renewal period is now open. Please renew your permits before January 31 to avoid penalties. Visit the BPLO office or use this online system.',
        category: 'Business',
        priority: ComplaintPriority.HIGH,
        status: AnnouncementStatus.PUBLISHED,
        authorId: users[1].id,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Scheduled System Maintenance',
        content: 'The system will undergo scheduled maintenance on Saturday. Some services may be temporarily unavailable.',
        category: 'System',
        priority: ComplaintPriority.MEDIUM,
        status: AnnouncementStatus.PUBLISHED,
        authorId: users[0].id,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.announcement.create({
      data: {
        title: 'Health Advisory',
        content: 'The City Health Office reminds all residents to maintain proper hygiene and get vaccinated against common diseases. Free vaccination is available at all health centers.',
        category: 'Health',
        priority: ComplaintPriority.MEDIUM,
        status: AnnouncementStatus.PUBLISHED,
        authorId: users[1].id,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    }),
  ])
  console.log(`Created ${announcements.length} announcements`)

  // Create Audit Logs
  await Promise.all([
    prisma.auditLog.create({
      data: { userId: users[0].id, action: 'CREATE', entityType: 'User', entityId: users[1].id, newValues: JSON.stringify({ email: users[1].email, role: users[1].role }) },
    }),
    prisma.auditLog.create({
      data: { userId: users[0].id, action: 'CREATE', entityType: 'Department', entityId: departments[0].id, newValues: JSON.stringify({ name: departments[0].name }) },
    }),
    prisma.auditLog.create({
      data: { userId: users[5].id, action: 'CREATE', entityType: 'ServiceRequest', entityId: serviceRequests[0].id, newValues: JSON.stringify({ referenceNumber: serviceRequests[0].referenceNumber }) },
    }),
    prisma.auditLog.create({
      data: { userId: users[5].id, action: 'CREATE', entityType: 'Complaint', entityId: complaints[0].id, newValues: JSON.stringify({ referenceNumber: complaints[0].referenceNumber }) },
    }),
  ])
  console.log('Created audit logs')

  // Create Notifications
  await Promise.all([
    prisma.notification.create({
      data: { userId: users[5].id, title: 'Request Submitted', message: 'Your service request has been submitted successfully.', type: 'REQUEST', referenceId: serviceRequests[0].id },
    }),
    prisma.notification.create({
      data: { userId: users[3].id, title: 'New Request', message: 'A new service request requires your attention.', type: 'REQUEST', referenceId: serviceRequests[0].id },
    }),
    prisma.notification.create({
      data: { userId: users[5].id, title: 'Complaint Received', message: 'Your complaint has been received and is being processed.', type: 'COMPLAINT', referenceId: complaints[0].id },
    }),
  ])
  console.log('Created notifications')

  console.log('\n✅ Seed completed successfully!')
  console.log('\n=== Demo Accounts ===')
  console.log('Super Admin: superadmin@cdo.gov.ph / password123')
  console.log('LGU Admin: admin@cdo.gov.ph / password123')
  console.log('Dept Head: dept.civilreg@cdo.gov.ph / password123')
  console.log('Staff: staff.civilreg@cdo.gov.ph / password123')
  console.log('Barangay Official: captain.carmen@cdo.gov.ph / password123')
  console.log('Citizen: citizen@cdo.gov.ph / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
