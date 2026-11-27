/**
 * Applique le schéma SQL AL-BAYAAN sur une base PostgreSQL vierge.
 * Prérequis : DATABASE_URL dans .env.local et le paquet `pg` (devDependency).
 * Usage : npm run db:apply
 * Les données de démonstration (08-data-seed.sql / 21-seed-teacher-data.sql) sont exclues.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const SQL_DIR = path.join(process.cwd(), 'prisma', 'sql');

const FILES = [
  '00-enums.sql',
  '01-tables-base.sql',
  '02-admin.sql',
  '03-classe-enseignants.sql',
  '04-eleves-parents.sql',
  '05-scolarite.sql',
  '06-paiements.sql',
  '07-annonces.sql',
  '10-rls-policies.sql',
  '13-grants.sql',
  '14-add-pending-student-status.sql',
  '15-add-pending-teacher-status.sql',
  '16-admin-select-all.sql',
  '17-teacher-data-access.sql',
  '18-course-schedules.sql',
  '19-matricule-system.sql',
  '20-id-defaults.sql',
  '22-passage-annee.sql',
  '23-first-login.sql',
  '24-homework-submissions.sql',
  '25-student-schedules.sql',
  '26-parents-independants.sql',
  '27-fix-rls-recursion.sql',
  '28-add-preschool-level.sql',
  '29-add-teacher-gender.sql',
];

function connectionString() {
  return process.env.DATABASE_URL
    .replace(/([?&])sslmode=[^&]*/i, '$1')
    .replace(/[?&]$/, '');
}

async function main() {
  const client = new Client({
    connectionString: connectionString(),
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const before = await client.query(`
    select count(*)::int as total
    from information_schema.tables
    where table_schema = 'public'
  `);

  if (before.rows[0].total > 0) {
    console.error(
      `ABANDON : le schéma public contient déjà ${before.rows[0].total} table(s).`,
    );
    await client.end();
    process.exit(1);
  }

  let applied = 0;

  for (const file of FILES) {
    const fullPath = path.join(SQL_DIR, file);
    const sql = fs.readFileSync(fullPath, 'utf8');
    const startedAt = Date.now();

    process.stdout.write(`APPLY ${file} ... `);
    try {
      await client.query(sql);
      applied += 1;
      console.log(`OK (${Date.now() - startedAt} ms)`);
    } catch (error) {
      console.log('ECHEC');
      console.error(`\nERREUR dans ${file} : ${error.message}`);
      if (error.position) {
        const position = Number(error.position);
        const around = sql.slice(Math.max(0, position - 200), position + 200);
        console.error('--- extrait autour de l’erreur ---');
        console.error(around);
        console.error('----------------------------------');
      }
      await client.end();
      process.exit(1);
    }
  }

  process.stdout.write('APPLY seed-core.sql ... ');
  const seedStartedAt = Date.now();
  try {
    const seedSql = fs.readFileSync(path.join(SQL_DIR, 'seed-core.sql'), 'utf8');
    await client.query(seedSql);
    console.log(`OK (${Date.now() - seedStartedAt} ms)`);
  } catch (error) {
    console.log('ECHEC');
    console.error(`\nERREUR dans seed-core.sql : ${error.message}`);
    await client.end();
    process.exit(1);
  }

  await client.query("NOTIFY pgrst, 'reload schema'");

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `);

  const enums = await client.query(`
    select t.typname
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typtype = 'e'
    order by t.typname
  `);

  const policies = await client.query(`
    select count(*)::int as total
    from pg_policies
    where schemaname = 'public'
  `);

  const functions = await client.query(`
    select count(*)::int as total
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  `);

  console.log('');
  console.log(`FICHIERS_APPLIQUES=${applied}`);
  console.log(`TABLES=${tables.rows.map((row) => row.table_name).join(',')}`);
  console.log(`ENUMS=${enums.rows.map((row) => row.typname).join(',')}`);
  console.log(`POLICIES=${policies.rows[0].total}`);
  console.log(`FUNCTIONS=${functions.rows[0].total}`);

  await client.end();
}

main().catch((error) => {
  console.error('ERREUR_GLOBALE:', error.message);
  process.exit(1);
});
