/**
 * Exécute un fichier SQL unique sur la base configurée par DATABASE_URL.
 * Usage : node scripts/apply-file.cjs prisma/sql/mon-fichier.sql
 * DATABASE_URL peut venir de l'environnement ou de .env.local.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnvFile() {
  if (process.env.DATABASE_URL) return;
  try {
    const content = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
      }
    }
  } catch {
    // .env.local absent : on utilise les variables d'environnement existantes.
  }
}

function connectionString() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL manquant : ajoutez-le dans .env.local.');
  }
  return process.env.DATABASE_URL
    .replace(/([?&])sslmode=[^&]*/i, '$1')
    .replace(/[?&]$/, '');
}

async function main() {
  loadEnvFile();

  const file = process.argv[2];
  if (!file) throw new Error('Chemin du fichier SQL manquant.');

  const client = new Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query(fs.readFileSync(file, 'utf8'));
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log(`SQL_APPLIQUE=${file}`);
  await client.end();
}

main().catch((error) => {
  console.error('ERREUR:', error.message);
  process.exit(1);
});
