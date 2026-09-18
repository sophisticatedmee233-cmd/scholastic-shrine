CREATE TABLE public.parent_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  student_id uuid NOT NULL,
  relationship text NOT NULL DEFAULT 'Parent',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_students TO authenticated;
GRANT ALL ON public.parent_students TO service_role;

ALTER TABLE public.parent_students ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_parent_of(_parent_id uuid, _student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_students
    WHERE parent_id = _parent_id AND student_id = _student_id
  )
$$;

CREATE POLICY "Parents read own links" ON public.parent_students
  FOR SELECT TO authenticated USING (parent_id = auth.uid());

CREATE POLICY "Students read links about them" ON public.parent_students
  FOR SELECT TO authenticated USING (student_id = auth.uid());

CREATE POLICY "Admins manage parent links" ON public.parent_students
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Parents can read their children's records
CREATE POLICY "Parents read child profile" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), id));

CREATE POLICY "Parents read child grades" ON public.grades
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));

CREATE POLICY "Parents read child invoices" ON public.fee_invoices
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));

CREATE POLICY "Parents read child payments" ON public.fee_payments
  FOR SELECT TO authenticated USING (public.is_parent_of(auth.uid(), student_id));

-- Admin management of people records
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));