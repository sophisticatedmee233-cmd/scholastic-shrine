CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid,
  actor_email text NOT NULL DEFAULT '',
  action text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  target_id uuid,
  target_label text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT ''
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX audit_logs_created_idx ON public.audit_logs (created_at DESC);