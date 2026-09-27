CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  teacher_name text NOT NULL DEFAULT '',
  class_name text NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  instructions text NOT NULL DEFAULT '',
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in read assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage own assignments" ON public.assignments FOR ALL TO authenticated
  USING (teacher_id = auth.uid() AND public.has_role(auth.uid(),'teacher'))
  WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(),'teacher'));
CREATE POLICY "Admins manage assignments" ON public.assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.video_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  teacher_name text NOT NULL DEFAULT '',
  class_name text NOT NULL,
  subject text NOT NULL,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  meeting_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_classes TO authenticated;
GRANT ALL ON public.video_classes TO service_role;
ALTER TABLE public.video_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in read video classes" ON public.video_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers manage own video classes" ON public.video_classes FOR ALL TO authenticated
  USING (teacher_id = auth.uid() AND public.has_role(auth.uid(),'teacher'))
  WITH CHECK (teacher_id = auth.uid() AND public.has_role(auth.uid(),'teacher'));
CREATE POLICY "Admins manage video classes" ON public.video_classes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));