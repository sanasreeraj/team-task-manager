# Team Task Manager

A full-stack project management web application built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. Designed to replicate core workflows of Jira and Microsoft Planner — with role-based access control, drag-and-drop Kanban boards and real-time feedback threads.

## Features

### Authentication & Roles
- Email/password signup & login with Supabase Auth
- Role-based access control: **Admin** and **Member**
- Admin access via invite code during signup
- Password reset via email

### Dashboard
- Time-based greeting with personalized stats
- Task completion progress bar
- Status distribution bar chart
- Overdue tasks & recent tasks (clickable, linked to projects)
- Separate views for Admin (team-wide) and Member (personal)

### Project Management
- Create, edit, and delete projects (Admin)
- Inline project name/description editing
- Task count, completion %, and member count per project
- Add/remove team members to specific projects

### Task Management (Kanban Board)
- 4-column drag-and-drop board: **To Do → In Progress → Code Review → Done**
- Search by title, filter by priority, filter by assignee
- Inline task editing via modal (title, description, priority, due date, assignee)
- Task creation with initial status selection
- Priority levels: Low, Medium, High, Urgent
- Overdue date highlighting

### Feedback System
- Per-task comment thread in the edit modal
- All team members can leave feedback on any task
- Timestamped, author-attributed entries

### Team Management (Admin)
- Professional table view: Name, Phone, Email, Role, Designation, Joined Date
- Editable designations (Developer, Designer, Manager, etc. + custom)
- Remove members from team

### Settings
- Editable profile: Name and Phone (inline editing with validation)
- Light/Dark theme toggle
- Read-only fields: Email, Role, Joined Date

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Themes | next-themes |
| Toasts | react-hot-toast |
| Language | TypeScript |

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase project (free tier works)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sanasreeraj/team-task-manager.git
   cd team-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_ACCESS_CODE=your_admin_code
   ```

4. **Set up the database**
   
   Run the following SQL in your Supabase SQL Editor to create the required tables:

   ```sql
   -- Profiles table (auto-created on signup via trigger)
   create table if not exists profiles (
     id uuid references auth.users on delete cascade primary key,
     full_name text,
     phone_number text,
     role text default 'member',
     designation text default 'Member',
     created_at timestamptz default now()
   );

   -- Projects
   create table if not exists projects (
     id uuid default gen_random_uuid() primary key,
     name text not null,
     description text,
     created_by uuid references profiles(id),
     created_at timestamptz default now()
   );

   -- Tasks
   create table if not exists tasks (
     id uuid default gen_random_uuid() primary key,
     project_id uuid references projects(id) on delete cascade,
     title text not null,
     description text,
     status text default 'todo',
     priority text default 'medium',
     feedback text,
     assigned_to uuid references profiles(id),
     due_date date,
     created_at timestamptz default now()
   );

   -- Task Comments
   create table if not exists task_comments (
     id uuid default gen_random_uuid() primary key,
     task_id uuid references tasks(id) on delete cascade,
     user_id uuid references profiles(id),
     content text not null,
     created_at timestamptz default now()
   );

   -- Project Members
   create table if not exists project_members (
     id uuid default gen_random_uuid() primary key,
     project_id uuid references projects(id) on delete cascade,
     user_id uuid references profiles(id) on delete cascade,
     created_at timestamptz default now(),
     unique(project_id, user_id)
   );
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Signup, Forgot Password
│   ├── dashboard/
│   │   ├── page.tsx       # Dashboard with stats & charts
│   │   ├── projects/      # Project CRUD & detail pages
│   │   ├── tasks/         # Global Kanban board
│   │   ├── my-tasks/      # Admin's personal task view
│   │   ├── team/          # Team management (Admin)
│   │   └── settings/      # Profile & theme settings
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── KanbanBoard.tsx    # Drag-and-drop task board
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── ProjectMembers.tsx # Project member management
│   ├── EditableProjectHeader.tsx
│   ├── EditableField.tsx
│   ├── TeamControls.tsx
│   ├── ThemeToggle.tsx
│   └── ...
├── utils/supabase/        # Supabase client helpers
└── middleware.ts          # Auth session management
```

## License

MIT
