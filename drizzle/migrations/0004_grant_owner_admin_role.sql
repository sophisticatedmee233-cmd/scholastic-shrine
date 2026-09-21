INSERT INTO public.user_roles (user_id, role)
VALUES ('69dceaee-52c4-44f2-bb9b-2afc769f45a3', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;