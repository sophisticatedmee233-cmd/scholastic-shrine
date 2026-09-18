ALTER TABLE public.parent_students
  ADD COLUMN parent_name text NOT NULL DEFAULT 'Guardian',
  ADD COLUMN parent_email text NOT NULL DEFAULT '';