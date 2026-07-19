-- Reset admin password and fix identity provider_id
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email)='setahackleaders@gmail.com';
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'admin user missing';
  END IF;
  UPDATE auth.users
    SET encrypted_password = crypt('made by pixelnova12_12', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now(),
        aud = 'authenticated',
        role = 'authenticated'
    WHERE id = v_uid;
  UPDATE auth.identities
    SET identity_data = jsonb_build_object('sub', v_uid::text, 'email','setahackleaders@gmail.com','email_verified',true),
        provider_id = 'setahackleaders@gmail.com',
        updated_at = now()
    WHERE user_id = v_uid AND provider = 'email';
  INSERT INTO public.user_roles(user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
END $$;