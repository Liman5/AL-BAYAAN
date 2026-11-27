-- ============================================================
-- AL-BAYAAN — Seed minimal (production)
-- École + années scolaires uniquement.
-- Aucun compte de démonstration n'est créé ici.
-- ============================================================

INSERT INTO schools (id, name, slug, address, phone, email, logo_url)
VALUES (
  'school-1',
  'AL-BAYAAN',
  'al-bayaan',
  'Adresse de l''école',
  '+213 555 000 000',
  'contact@albayan.edu',
  'https://www.image2url.com/r2/default/images/1779783874231-dae3f087-5437-4ef2-98c9-67a961155f8f.jpg'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  logo_url = EXCLUDED.logo_url,
  updated_at = now();

INSERT INTO academic_years (id, name, start_date, end_date, status, is_active)
VALUES
  ('ay-2024-2025', '2024-2025', '2024-09-01', '2025-07-01', 'previous', false),
  ('ay-2025-2026', '2025-2026', '2025-09-01', '2026-07-01', 'current', true),
  ('ay-2026-2027', '2026-2027', '2026-09-01', '2027-07-01', 'upcoming', false)
ON CONFLICT (name) DO UPDATE SET
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status,
  is_active = EXCLUDED.is_active;

