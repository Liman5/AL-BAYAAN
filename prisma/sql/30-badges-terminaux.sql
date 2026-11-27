-- ============================================================
-- AL-BAYAAN — 30. Badges QR élèves, terminaux de présence,
--      événements de scan et file de notifications parentales
--
-- Ce script est IDEMPOTENT (IF NOT EXISTS partout) et
-- RÉTROCOMPATIBLE : il n'altère aucune table existante.
--
-- Sécurité :
--   * RLS activée sur les 5 nouvelles tables.
--   * AUCUNE politique permissive anon/authenticated :
--     seul le service role (routes serveur Next.js) y accède.
--   * Les GRANT par défaut (13-grants.sql) sont révoqués ici.
-- ============================================================

-- ------------------------------------------------------------
-- 1. BADGES QR ÉLÈVES
--    Un badge = un token opaque aléatoire (aucune donnée
--    personnelle dans le QR). Le matricule reste la référence
--    d'identité côté AL-BAYAAN.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_badges (
  id                TEXT PRIMARY KEY,
  student_id        TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  school_id         TEXT REFERENCES schools(id) ON DELETE SET NULL,
  academic_year_id  TEXT REFERENCES academic_years(id) ON DELETE SET NULL,

  -- Token imprimé dans le QR (256 bits, base32 Crockford → 52 car.).
  -- Opaque : ne contient ni nom, ni matricule, ni classe.
  token             TEXT NOT NULL,

  -- Empreinte SHA-256 du token (diagnostic, vérification future).
  token_sha256      TEXT NOT NULL,

  -- Préfixe public (8 car.) pour le support : permet d'identifier
  -- un badge sans manipuler le token complet.
  token_prefix      TEXT NOT NULL,

  status            TEXT NOT NULL DEFAULT 'active',
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  issued_by         TEXT,
  revoked_at        TIMESTAMPTZ,
  revoked_reason    TEXT,
  replaced_by       TEXT,

  printed_count     INTEGER NOT NULL DEFAULT 0,
  last_printed_at   TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT student_badges_status_check
    CHECK (status IN ('active', 'revoked', 'replaced')),
  CONSTRAINT student_badges_token_len_check
    CHECK (char_length(token) >= 32)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_badges_token
  ON student_badges (token);
CREATE INDEX IF NOT EXISTS idx_student_badges_token_sha
  ON student_badges (token_sha256);
CREATE INDEX IF NOT EXISTS idx_student_badges_student
  ON student_badges (student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_status
  ON student_badges (status);

-- Un seul badge ACTIF par élève et par année scolaire.
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_badges_one_active
  ON student_badges (student_id, COALESCE(academic_year_id, 'none'))
  WHERE status = 'active';

-- ------------------------------------------------------------
-- 2. TERMINAUX SCANNERS (appareils autorisés)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scanner_terminals (
  id                  TEXT PRIMARY KEY,
  school_id           TEXT REFERENCES schools(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,

  -- Empreinte du token d'appareil (le token n'est jamais stocké).
  token_hash          TEXT NOT NULL UNIQUE,

  -- Appairage : code à usage unique, stocké haché, expiration courte.
  pairing_code_hash   TEXT,
  pairing_expires_at  TIMESTAMPTZ,
  paired_at           TIMESTAMPTZ,

  status              TEXT NOT NULL DEFAULT 'pending',
  app_version         TEXT,
  device_model        TEXT,
  pending_events      INTEGER NOT NULL DEFAULT 0,
  last_seen_at        TIMESTAMPTZ,
  last_sync_at        TIMESTAMPTZ,
  revoked_at          TIMESTAMPTZ,
  revoked_reason      TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT scanner_terminals_status_check
    CHECK (status IN ('pending', 'active', 'suspended', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_scanner_terminals_school
  ON scanner_terminals (school_id);
CREATE INDEX IF NOT EXISTS idx_scanner_terminals_status
  ON scanner_terminals (status);

-- ------------------------------------------------------------
-- 3. ÉVÉNEMENTS DE PRÉSENCE ISSUS DES TERMINAUX
--    L'identifiant est l'UUID généré par le terminal :
--    il sert de clé d'idempotence (rejeu sans doublon).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS terminal_attendance_events (
  id               TEXT PRIMARY KEY,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  student_code     TEXT NOT NULL,
  class_id         TEXT REFERENCES classes(id) ON DELETE SET NULL,
  school_id        TEXT REFERENCES schools(id) ON DELETE SET NULL,
  terminal_id      TEXT REFERENCES scanner_terminals(id) ON DELETE SET NULL,

  local_date       DATE NOT NULL,
  scanned_at       TIMESTAMPTZ NOT NULL,
  session          TEXT NOT NULL DEFAULT 'morning',
  status           TEXT NOT NULL,
  source           TEXT NOT NULL DEFAULT 'qr',
  payload_version  INTEGER NOT NULL DEFAULT 1,
  idempotency_key  TEXT NOT NULL UNIQUE,
  received_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT terminal_attendance_status_check
    CHECK (status IN ('present', 'late')),
  CONSTRAINT terminal_attendance_session_check
    CHECK (session IN ('morning', 'afternoon', 'evening'))
);

CREATE INDEX IF NOT EXISTS idx_terminal_attendance_date
  ON terminal_attendance_events (local_date);
CREATE INDEX IF NOT EXISTS idx_terminal_attendance_student
  ON terminal_attendance_events (student_id, local_date);
CREATE INDEX IF NOT EXISTS idx_terminal_attendance_terminal
  ON terminal_attendance_events (terminal_id);
CREATE INDEX IF NOT EXISTS idx_terminal_attendance_school
  ON terminal_attendance_events (school_id, local_date);

-- Un seul événement par élève, par jour et par session : protège aussi
-- contre deux terminaux qui scanneraient le même élève simultanément.
CREATE UNIQUE INDEX IF NOT EXISTS idx_terminal_attendance_unique_session
  ON terminal_attendance_events (student_id, local_date, session);

-- ------------------------------------------------------------
-- 4. FILE DE NOTIFICATIONS PARENTALES (outbox serveur)
--    Une ligne = une intention d'envoi. Aucune notification
--    n'est envoyée si aucun fournisseur n'est configuré :
--    le statut reste alors `pending` avec provider = 'none'.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parent_notifications (
  id          TEXT PRIMARY KEY,
  event_id    TEXT NOT NULL
              REFERENCES terminal_attendance_events(id) ON DELETE CASCADE,
  student_id  TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id   TEXT REFERENCES parents(id) ON DELETE SET NULL,

  channel     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  provider    TEXT NOT NULL DEFAULT 'none',
  attempts    INTEGER NOT NULL DEFAULT 0,
  last_error  TEXT,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at     TIMESTAMPTZ,

  CONSTRAINT parent_notifications_channel_check
    CHECK (channel IN ('inapp', 'push', 'sms', 'whatsapp')),
  CONSTRAINT parent_notifications_status_check
    CHECK (status IN ('pending', 'queued', 'sent', 'failed', 'skipped')),
  CONSTRAINT parent_notifications_unique
    UNIQUE (event_id, parent_id, channel)
);

CREATE INDEX IF NOT EXISTS idx_parent_notifications_status
  ON parent_notifications (status);
CREATE INDEX IF NOT EXISTS idx_parent_notifications_student
  ON parent_notifications (student_id);

-- ------------------------------------------------------------
-- 5. PARAMÈTRES CENTRALISÉS DU SCANNER (par établissement)
--    Valeurs initiales RESTRICTIVES (mode confidentialité).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scanner_settings (
  school_id             TEXT PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,

  show_photo            BOOLEAN NOT NULL DEFAULT true,
  show_matricule        BOOLEAN NOT NULL DEFAULT true,
  show_class_name       BOOLEAN NOT NULL DEFAULT true,
  show_school_name      BOOLEAN NOT NULL DEFAULT true,
  show_time             BOOLEAN NOT NULL DEFAULT true,

  attendance_start_time TEXT NOT NULL DEFAULT '07:00',
  late_after_time       TEXT NOT NULL DEFAULT '07:30',
  session               TEXT NOT NULL DEFAULT 'morning',
  timezone              TEXT NOT NULL DEFAULT 'Africa/Lome',

  notify_parents        BOOLEAN NOT NULL DEFAULT false,
  sync_photos           BOOLEAN NOT NULL DEFAULT false,
  offline_grace_days    INTEGER NOT NULL DEFAULT 30,

  config_version        INTEGER NOT NULL DEFAULT 1,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT scanner_settings_session_check
    CHECK (session IN ('morning', 'afternoon', 'evening')),
  CONSTRAINT scanner_settings_grace_check
    CHECK (offline_grace_days BETWEEN 1 AND 365)
);

-- ------------------------------------------------------------
-- 6. SÉCURITÉ — RLS + révocation des GRANT par défaut
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scanner_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS terminal_attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS scanner_settings ENABLE ROW LEVEL SECURITY;

-- Aucune politique n'est créée : sans politique, RLS refuse tout
-- accès via anon/authenticated. Les routes Next.js utilisent la
-- clé service role (qui contourne RLS) et restent la seule porte.
REVOKE ALL ON public.student_badges FROM anon, authenticated;
REVOKE ALL ON public.scanner_terminals FROM anon, authenticated;
REVOKE ALL ON public.terminal_attendance_events FROM anon, authenticated;
REVOKE ALL ON public.parent_notifications FROM anon, authenticated;
REVOKE ALL ON public.scanner_settings FROM anon, authenticated;

-- ✅ Migration 30 appliquée.

