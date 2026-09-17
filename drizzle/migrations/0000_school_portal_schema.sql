-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL DEFAULT '',
  admission_number text UNIQUE,
  class_name text NOT NULL DEFAULT 'Grade 10',
  stream text NOT NULL DEFAULT 'STEM',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Announcements (public notices + portal notices)
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  is_urgent boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads public announcements" ON public.announcements FOR SELECT TO anon USING (is_public = true);
CREATE POLICY "Signed-in users read all announcements" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Timetable
CREATE TABLE public.timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_name text NOT NULL,
  day_of_week smallint NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  subject text NOT NULL,
  room text NOT NULL DEFAULT '',
  teacher text NOT NULL DEFAULT ''
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable_entries TO authenticated;
GRANT ALL ON public.timetable_entries TO service_role;
ALTER TABLE public.timetable_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed-in users read timetable" ON public.timetable_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage timetable" ON public.timetable_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Grades
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  subject text NOT NULL,
  term smallint NOT NULL,
  year smallint NOT NULL,
  score numeric(5,2) NOT NULL,
  grade text NOT NULL,
  teacher_comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own grades" ON public.grades FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admins manage grades" ON public.grades FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fees
CREATE TABLE public.fee_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  term smallint NOT NULL,
  year smallint NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  due_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_invoices TO authenticated;
GRANT ALL ON public.fee_invoices TO service_role;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own invoices" ON public.fee_invoices FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admins manage invoices" ON public.fee_invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  amount numeric(12,2) NOT NULL,
  method text NOT NULL DEFAULT 'M-Pesa',
  reference text NOT NULL DEFAULT '',
  paid_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_payments TO authenticated;
GRANT ALL ON public.fee_payments TO service_role;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own payments" ON public.fee_payments FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admins manage payments" ON public.fee_payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Starter records so a newly registered student sees a working portal.
-- Real results and fee records are entered by school staff later.
CREATE OR REPLACE FUNCTION public.seed_starter_records_for_student()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'student') ON CONFLICT DO NOTHING;
  INSERT INTO public.grades (student_id, subject, term, year, score, grade, teacher_comment) VALUES
    (NEW.id, 'Mathematics', 2, 2026, 91, 'A', 'Excellent problem solving.'),
    (NEW.id, 'Chemistry', 2, 2026, 86, 'A-', 'Strong practical work.'),
    (NEW.id, 'Physics', 2, 2026, 78, 'B+', 'Revise electricity topics.'),
    (NEW.id, 'English', 2, 2026, 82, 'A-', 'Good essays; watch grammar.'),
    (NEW.id, 'Kiswahili', 2, 2026, 74, 'B', 'Improve insha structure.'),
    (NEW.id, 'Biology', 2, 2026, 88, 'A', 'Consistent effort.'),
    (NEW.id, 'Geography', 2, 2026, 80, 'A-', 'Map work is improving.'),
    (NEW.id, 'Mathematics', 1, 2026, 85, 'A-', ''),
    (NEW.id, 'Chemistry', 1, 2026, 79, 'B+', ''),
    (NEW.id, 'Physics', 1, 2026, 72, 'B', ''),
    (NEW.id, 'English', 1, 2026, 80, 'A-', ''),
    (NEW.id, 'Kiswahili', 1, 2026, 70, 'B', ''),
    (NEW.id, 'Biology', 1, 2026, 84, 'A-', ''),
    (NEW.id, 'Geography', 1, 2026, 77, 'B+', '');
  INSERT INTO public.fee_invoices (student_id, term, year, description, amount, due_date) VALUES
    (NEW.id, 1, 2026, 'Term 1 tuition (Senior School)', 46500, '2026-01-15'),
    (NEW.id, 2, 2026, 'Term 2 tuition (Senior School)', 46500, '2026-05-12'),
    (NEW.id, 3, 2026, 'Term 3 tuition (Senior School)', 46500, '2026-09-08');
  INSERT INTO public.fee_payments (student_id, amount, method, reference, paid_at) VALUES
    (NEW.id, 46500, 'M-Pesa', 'QAX7K2LM9P', '2026-01-10 09:12:00+03'),
    (NEW.id, 30000, 'Bank transfer', 'KCB-118224', '2026-05-02 14:40:00+03'),
    (NEW.id, 16500, 'M-Pesa', 'QBT3M8NR4V', '2026-05-20 11:05:00+03'),
    (NEW.id, 38000, 'M-Pesa', 'QCZ9P1KT6W', '2026-09-05 08:30:00+03');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.seed_starter_records_for_student();

-- Shared timetable for Grade 10
INSERT INTO public.timetable_entries (class_name, day_of_week, start_time, end_time, subject, room, teacher) VALUES
('Grade 10',1,'08:00','08:40','Mathematics','Rm 4','Mr. Kamau'),
('Grade 10',1,'08:40','09:20','Chemistry','Lab 2','Mrs. Wanjiku'),
('Grade 10',1,'09:20','10:00','English','Rm 4','Ms. Achieng'),
('Grade 10',1,'10:30','11:10','Geography','Rm 7','Mr. Otieno'),
('Grade 10',1,'11:10','11:50','Physics','Lab 1','Mr. Mwangi'),
('Grade 10',1,'14:00','14:40','Kiswahili','Rm 4','Mwl. Njoroge'),
('Grade 10',2,'08:00','08:40','Biology','Lab 3','Dr. Nyambura'),
('Grade 10',2,'08:40','09:20','Mathematics','Rm 4','Mr. Kamau'),
('Grade 10',2,'09:20','10:00','Kiswahili','Rm 4','Mwl. Njoroge'),
('Grade 10',2,'10:30','11:10','English','Rm 4','Ms. Achieng'),
('Grade 10',2,'11:10','11:50','Chemistry','Lab 2','Mrs. Wanjiku'),
('Grade 10',2,'14:00','15:20','Games','Field',''),
('Grade 10',3,'08:00','08:40','Physics','Lab 1','Mr. Mwangi'),
('Grade 10',3,'08:40','09:20','Geography','Rm 7','Mr. Otieno'),
('Grade 10',3,'09:20','10:00','Mathematics','Rm 4','Mr. Kamau'),
('Grade 10',3,'10:30','11:10','Biology','Lab 3','Dr. Nyambura'),
('Grade 10',3,'11:10','11:50','English','Rm 4','Ms. Achieng'),
('Grade 10',3,'14:00','14:40','Computer Science','ICT Lab','Ms. Muthoni'),
('Grade 10',4,'08:00','08:40','Chemistry','Lab 2','Mrs. Wanjiku'),
('Grade 10',4,'08:40','09:20','English','Rm 4','Ms. Achieng'),
('Grade 10',4,'09:20','10:00','Physics','Lab 1','Mr. Mwangi'),
('Grade 10',4,'10:30','11:10','Mathematics','Rm 4','Mr. Kamau'),
('Grade 10',4,'11:10','11:50','Kiswahili','Rm 4','Mwl. Njoroge'),
('Grade 10',4,'14:00','14:40','CRE','Rm 9','Rev. Karanja'),
('Grade 10',5,'08:00','08:40','Mathematics','Rm 4','Mr. Kamau'),
('Grade 10',5,'08:40','09:20','Biology','Lab 3','Dr. Nyambura'),
('Grade 10',5,'09:20','10:00','Geography','Rm 7','Mr. Otieno'),
('Grade 10',5,'10:30','11:10','Chemistry','Lab 2','Mrs. Wanjiku'),
('Grade 10',5,'11:10','11:50','English','Rm 4','Ms. Achieng'),
('Grade 10',5,'14:00','14:40','Clubs & Societies','Various','');

INSERT INTO public.announcements (title, body, category, is_urgent, is_public, published_at) VALUES
('Under-15s lift the Kiambu Cup', 'A 2–1 final win over Thika closed a superb season for our junior football side. Congratulations to the squad and Coach Odhiambo.', 'Sport', false, true, '2026-09-14 10:00+03'),
('Science fair: three golds', 'Grade 11 learners took three gold awards at the county science fair with a smart irrigation model for tea farms.', 'Academics', false, true, '2026-09-10 09:00+03'),
('Music festival invites entries', 'Choral and instrumental slots are now open for the Kiambu Music Festival. Sign up with Mrs. Wairimu by Friday.', 'Culture', false, true, '2026-09-07 08:30+03'),
('Term 3 fee deadline: 8 September', 'Please clear outstanding Term 3 balances via M-Pesa Paybill 522522, account LTS/ADM No. Statements are available in the portal.', 'Fees', true, false, '2026-09-01 07:30+03'),
('Sports Day: final practice Friday', 'All houses report to the lower field at 2pm on Friday for the last rehearsal before Sports Day.', 'Sport', false, false, '2026-09-15 12:00+03'),
('Mid-term open day', 'Parents are welcome to the main hall on Saturday 26 September from 9am to meet class teachers.', 'General', false, true, '2026-09-12 08:00+03');