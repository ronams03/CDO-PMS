# Cagayan de Oro City LGU Management System

A production-ready, fully functional web-based Government Management System for Cagayan de Oro City, Philippines.

## 🏛️ System Overview

The Integrated LGU Management System is a comprehensive platform designed to streamline local government operations, improve citizen services, and enhance administrative efficiency for Cagayan de Oro City.

### Key Features

- **Multi-role Authentication & Authorization** - Secure login with role-based access control
- **Resident Management** - Complete citizen records with demographic data
- **Barangay Management** - All 80+ barangays of CDO with officials information
- **Department Management** - City departments with services and permit types
- **Service Requests** - Submit, track, and process government service requests
- **Complaints System** - File and track complaints with status updates
- **Permits & Licensing** - Business permit applications and tracking
- **Announcements** - Public announcements and notifications
- **Dashboard Analytics** - Real-time statistics and charts
- **Audit Trail** - Complete activity logging for accountability

## 🚀 Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **UI Framework**: Tailwind CSS v4, shadcn/ui components
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT-based with secure cookies
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ or Bun runtime
- SQLite3

## 🛠️ Installation & Setup

### 1. Clone the repository

```bash
cd /home/z/my-project
```

### 2. Install dependencies

```bash
bun install
```

### 3. Configure environment

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-key-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Initialize the database

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Seed demo data
bun run db:seed
```

### 5. Start the development server

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── users/     # User management
│   │   │   ├── residents/ # Resident records
│   │   │   ├── barangays/ # Barangay management
│   │   │   ├── departments/ # Department management
│   │   │   ├── services/  # Government services
│   │   │   ├── requests/  # Service requests
│   │   │   ├── complaints/ # Complaints system
│   │   │   ├── permits/   # Permits & licenses
│   │   │   ├── announcements/ # Public announcements
│   │   │   ├── notifications/ # User notifications
│   │   │   ├── dashboard/ # Dashboard statistics
│   │   │   └── audit-logs/ # Activity logs
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main application page
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── auth/          # Authentication components
│   │   ├── dashboard/     # Dashboard components
│   │   └── layout/        # Layout components
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth state management
│   ├── hooks/
│   │   └── use-api.ts     # API utilities
│   └── lib/
│       ├── auth.ts        # Authentication logic
│       ├── constants.ts   # Application constants
│       ├── db.ts          # Database client
│       ├── utils.ts       # Utility functions
│       └── validators.ts  # Zod validation schemas
└── package.json
```

## 🔐 User Roles & Permissions

### Super Admin
- Full system access
- Manage all users and roles
- System configuration

### LGU Admin
- Manage departments and barangays
- User management (except Super Admin)
- View all reports and audit logs

### Department Head
- Manage department services
- Process requests and complaints
- View department reports

### Staff
- Process service requests
- Handle complaints
- Manage resident records

### Barangay Official
- Manage barangay residents
- Handle barangay-level complaints
- Post barangay announcements

### Citizen
- Submit service requests
- File complaints
- View own records

## 📊 Database Schema

### Core Tables

- **User** - System users with roles
- **Resident** - Citizen records
- **Barangay** - 80+ barangays of CDO
- **Department** - City departments
- **Service** - Government services offered
- **ServiceRequest** - Citizen service requests
- **Complaint** - Filed complaints
- **Permit** - Business permits and licenses
- **Announcement** - Public announcements
- **Notification** - User notifications
- **AuditLog** - Activity tracking

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Residents
- `GET /api/residents` - List residents
- `POST /api/residents` - Create resident
- `GET /api/residents/[id]` - Get resident
- `PUT /api/residents/[id]` - Update resident
- `DELETE /api/residents/[id]` - Delete resident

### Similar patterns for:
- `/api/barangays`
- `/api/departments`
- `/api/services`
- `/api/requests`
- `/api/complaints`
- `/api/permits`
- `/api/announcements`
- `/api/notifications`
- `/api/audit-logs`
- `/api/dashboard`

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- HTTP-only secure cookies
- Role-based access control
- Input validation (Zod schemas)
- SQL injection prevention (Prisma)
- XSS protection (React)
- Audit logging for sensitive actions

## 📱 Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🧪 Testing

Run the development server and log in with any demo account to test the system.

## 📝 Development Notes

### Adding a new module

1. Create API routes in `src/app/api/[module]/`
2. Add database model in `prisma/schema.prisma`
3. Create validation schema in `src/lib/validators.ts`
4. Add module component in `src/app/page.tsx`
5. Update navigation in `src/components/layout/DashboardLayout.tsx`

### Database migrations

```bash
# After modifying schema
bun run db:push

# Reset database (clears all data)
bun run db:reset

# Reseed demo data
bun run db:seed
```

## 🚀 Production Deployment

### Build for production

```bash
bun run build
```

### Environment variables for production

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-random-secret-key"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### Docker support

Create a `Dockerfile` for containerized deployment.

## 📄 License

This project is developed for the Cagayan de Oro City Government.

## 🤝 Support

For technical support or inquiries, contact the CDO LGU IT Department.

---

**Cagayan de Oro City** - The City of Golden Friendship
