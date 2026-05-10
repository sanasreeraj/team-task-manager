-- Migration: Add comments, project members, and designations

-- 1. Add designation to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Member';

-- 2. Create task_comments table for feedback logs
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by authenticated users."
  ON public.task_comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert comments."
  ON public.task_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments."
  ON public.task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create project_members junction table
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members viewable by authenticated users."
  ON public.project_members FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage project members."
  ON public.project_members FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can remove project members."
  ON public.project_members FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
