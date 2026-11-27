import { createHash, randomBytes, timingSafeEqual } from 'crypto';

// ============================================================
// AL-BAYAAN — Badges QR élèves
//
// Un badge est un **token opaque** de 256 bits encodé en base32
// (alphabet Crockford, sans I/L/O/U pour éviter les confusions
// à la lecture humaine). Le QR ne contient AUCUNE donnée
// personnelle : ni nom, ni matricule, ni classe, ni école.
//
//   QR imprimé  →  TOKEN (52 caractères)
//   Côté serveur →  token, token_sha256, token_prefix
//   Côté terminal (hors ligne) →  correspondance token → élève
//
// Le matricule reste la référence d'identité métier dans
// AL-BAYAAN ; il est imprimé sur le badge pour l'humain mais
// n'est jamais encodé dans le QR.
// ============================================================

/** Alphabet base32 Crockford (pas de I, L, O, U). */
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Longueur du token généré (32 octets → 52 caractères base32). */
export const BADGE_TOKEN_LENGTH = 52;

/** Nombre d'octets d'entropie par badge. */
export const BADGE_TOKEN_BYTES = 32;

/** Charset accepté par le parseur QR du terminal Flutter. */
const TOKEN_PATTERN = /^[A-Za-z0-9._-]{8,128}$/;

/** Encode un buffer en base32 Crockford (majuscules, sans padding). */
function encodeBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += CROCKFORD[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += CROCKFORD[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Génère un token de badge cryptographiquement sûr.
 * Non séquentiel, haute entropie, aucune donnée personnelle.
 */
export function generateBadgeToken(): string {
  const token = encodeBase32(randomBytes(BADGE_TOKEN_BYTES));
  return token.slice(0, BADGE_TOKEN_LENGTH);
}

/** Empreinte SHA-256 (hex) d'un token — jamais le token en clair dans les logs. */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** Préfixe public (8 caractères) utilisé pour le support et les journaux. */
export function badgeTokenPrefix(token: string): string {
  return token.slice(0, 8);
}

/** Vérifie le format d'un token (défense contre les valeurs injectées). */
export function isValidBadgeToken(value: unknown): value is string {
  return typeof value === 'string' && TOKEN_PATTERN.test(value);
}

/**
 * Comparaison à temps constant de deux empreintes hexadécimales.
 * Utilisée pour l'authentification des terminaux.
 */
export function safeHashEquals(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  try {
    return timingSafeEqual(bufferA, bufferB);
  } catch {
    return false;
  }
}

/** Code d'appairage lisible : 8 caractères, sans caractères ambigus. */
const PAIRING_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePairingCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += PAIRING_ALPHABET[bytes[i] % PAIRING_ALPHABET.length];
  }
  return code;
}

/** Normalise un code d'appairage saisi (majuscules, sans espaces ni tirets). */
export function normalizePairingCode(value: string): string {
  return value.replace(/[\s-]/g, '').toUpperCase();
}
