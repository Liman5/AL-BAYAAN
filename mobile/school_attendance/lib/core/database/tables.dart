import 'package:drift/drift.dart';

/// ============================================================================
/// Tables SQLite du terminal de présence.
///
/// Principes :
///  - la base locale est la source de vérité opérationnelle du terminal ;
///  - aucune donnée obligatoire ne dépend d'Internet ;
///  - les événements de présence sont immuables après insertion ;
///  - les index couvrent les recherches QR / matricule / classe / date.
/// ============================================================================

/// Élèves importés localement (liste fournie par l'établissement).
@DataClassName('Student')
@TableIndex(name: 'idx_students_qr_token', columns: {#qrToken}, unique: true)
@TableIndex(name: 'idx_students_code', columns: {#studentCode}, unique: true)
@TableIndex(name: 'idx_students_class', columns: {#classId})
@TableIndex(name: 'idx_students_name', columns: {#lastName, #firstName})
class Students extends Table {
  /// Identifiant local stable (UUID généré à l'import).
  TextColumn get id => text()();

  /// Identifiant de l'élève sur la plateforme centrale (si connu).
  TextColumn get studentUuid => text().nullable()();

  /// Matricule scolaire (ex. EL-0248).
  TextColumn get studentCode => text()();

  TextColumn get firstName => text().withDefault(const Constant(''))();
  TextColumn get lastName => text().withDefault(const Constant(''))();
  TextColumn get classId => text().nullable()();
  TextColumn get className => text().withDefault(const Constant(''))();

  /// Photo copiée dans les documents de l'application (mode hors ligne).
  TextColumn get photoLocalPath => text().nullable()();

  /// URL distante d'origine, utilisée plus tard par la synchronisation.
  TextColumn get photoRemoteUrl => text().nullable()();

  /// Token opaque du badge QR (jamais de données personnelles dans le QR).
  TextColumn get qrToken => text()();

  /// Élève actif dans l'établissement.
  BoolColumn get isActive => boolean().withDefault(const Constant(true))();

  /// Badge révoqué (perte, remplacement) : le scan est refusé.
  BoolColumn get badgeRevoked => boolean().withDefault(const Constant(false))();

  /// Données de démonstration : identifiables et supprimables en un geste.
  BoolColumn get isDemo => boolean().withDefault(const Constant(false))();

  DateTimeColumn get updatedAt => dateTime()();
  DateTimeColumn get lastSyncedAt => dateTime().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Classes (référentiel léger, utilisé pour les filtres et statistiques).
@DataClassName('SchoolClass')
@TableIndex(name: 'idx_classes_remote', columns: {#remoteId})
class SchoolClasses extends Table {
  TextColumn get id => text()();
  TextColumn get remoteId => text().nullable()();
  TextColumn get name => text()();
  TextColumn get level => text().nullable()();
  DateTimeColumn get updatedAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Événements de présence — immuables après création.
@DataClassName('AttendanceRecord')
@TableIndex(
  name: 'idx_attendance_student_session',
  columns: {#studentId, #localDate, #session},
  unique: true,
)
@TableIndex(name: 'idx_attendance_date', columns: {#localDate})
@TableIndex(name: 'idx_attendance_sync', columns: {#syncStatus})
@TableIndex(name: 'idx_attendance_code', columns: {#studentCode})
@TableIndex(name: 'idx_attendance_class', columns: {#classId})
class AttendanceRecords extends Table {
  /// UUID de l'événement (idempotence côté serveur lors de la synchro).
  TextColumn get id => text()();

  TextColumn get studentId => text()();
  TextColumn get studentUuid => text().nullable()();
  TextColumn get studentCode => text()();
  TextColumn get classId => text().nullable()();
  TextColumn get className => text().withDefault(const Constant(''))();

  /// Horodatage UTC (référence serveur).
  DateTimeColumn get scannedAtUtc => dateTime()();

  /// Journée locale `yyyy-MM-dd` (référence établissement).
  TextColumn get localDate => text()();

  /// Minutes depuis minuit (tri/statistiques rapides).
  IntColumn get localMinutes => integer()();

  /// Session de présence (`morning` en v1, extensible).
  TextColumn get session => text().withDefault(const Constant('morning'))();

  /// `present` ou `late`.
  TextColumn get attendanceStatus => text()();

  TextColumn get terminalId => text()();
  TextColumn get source => text().withDefault(const Constant('qr'))();

  /// `pending` | `syncing` | `synced` | `failed`.
  TextColumn get syncStatus => text().withDefault(const Constant('pending'))();

  DateTimeColumn get syncedAt => dateTime().nullable()();
  TextColumn get serverRecordId => text().nullable()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get lastSyncError => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Paramètres du terminal (une seule ligne, id = 1).
@DataClassName('TerminalSettings')
class Settings extends Table {
  IntColumn get id => integer().withDefault(const Constant(1))();

  TextColumn get terminalId => text()();
  TextColumn get terminalDisplayName =>
      text().withDefault(const Constant('Terminal principal'))();

  TextColumn get schoolId => text().nullable()();
  TextColumn get schoolName =>
      text().withDefault(const Constant('AL-BAYAAN'))();
  TextColumn get schoolLogoLocalPath => text().nullable()();

  TextColumn get timezone => text().withDefault(const Constant('Africa/Lome'))();

  /// Heure d'ouverture théorique (informative).
  TextColumn get attendanceStartTime =>
      text().withDefault(const Constant('07:00'))();

  /// Heure limite : au-delà, la présence passe en « en retard ».
  TextColumn get lateAfterTime =>
      text().withDefault(const Constant('07:30'))();

  IntColumn get autoResetMillis => integer().withDefault(const Constant(2200))();

  BoolColumn get soundEnabled => boolean().withDefault(const Constant(true))();
  BoolColumn get hapticsEnabled => boolean().withDefault(const Constant(true))();
  BoolColumn get animationsEnabled =>
      boolean().withDefault(const Constant(true))();
  BoolColumn get keepScreenOn => boolean().withDefault(const Constant(true))();

  /// Objectif de caméra préféré du scanner : `front` (défaut) ou `back`.
  TextColumn get cameraFacing => text().withDefault(const Constant('front'))();

  /// Politique d'affichage imposée par la plateforme (mode confidentialité).
  BoolColumn get showPhoto => boolean().withDefault(const Constant(true))();
  BoolColumn get showMatricule => boolean().withDefault(const Constant(true))();
  BoolColumn get showClassName => boolean().withDefault(const Constant(true))();
  BoolColumn get showTime => boolean().withDefault(const Constant(true))();

  /// Mode hors ligne volontaire : aucune tentative réseau.
  BoolColumn get offlineMode => boolean().withDefault(const Constant(true))();

  IntColumn get retentionDays => integer().withDefault(const Constant(365))();

  DateTimeColumn get lastStudentSync => dateTime().nullable()();
  DateTimeColumn get lastAttendanceSync => dateTime().nullable()();

  /// Synchronisation vers la plateforme centrale : désactivée par défaut.
  BoolColumn get apiEnabled => boolean().withDefault(const Constant(false))();
  TextColumn get apiBaseUrl => text().nullable()();

  /// Diagnostic de la dernière tentative de synchronisation.
  DateTimeColumn get lastSyncAttempt => dateTime().nullable()();
  TextColumn get lastSyncError => text().nullable()();

  /// Retour vocal (Text-to-Speech) — messages définis par l'administrateur.
  BoolColumn get voiceEnabled => boolean().withDefault(const Constant(false))();
  TextColumn get voiceSuccess =>
      text().withDefault(const Constant('Présence enregistrée'))();
  TextColumn get voiceLate => text().withDefault(const Constant('En retard'))();
  TextColumn get voiceDuplicate =>
      text().withDefault(const Constant('Déjà enregistré'))();
  TextColumn get voiceRefused => text().withDefault(const Constant('Accès refusé'))();

  /// Code administrateur — jamais stocké en clair (sel + empreinte itérée).
  TextColumn get adminPinSalt => text().nullable()();
  TextColumn get adminPinHash => text().nullable()();
  IntColumn get adminPinIterations => integer().withDefault(const Constant(0))();

  @override
  Set<Column> get primaryKey => {id};
}

/// File d'attente de synchronisation (aucune perte d'événement).
@DataClassName('SyncQueueItem')
@TableIndex(name: 'idx_sync_status', columns: {#status})
@TableIndex(name: 'idx_sync_entity', columns: {#entityId})
class SyncQueue extends Table {
  TextColumn get id => text()();
  TextColumn get eventType => text()();
  TextColumn get entityId => text()();
  TextColumn get payloadJson => text()();
  DateTimeColumn get createdAt => dateTime()();
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  DateTimeColumn get lastAttemptAt => dateTime().nullable()();
  TextColumn get lastError => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}

/// Journaux techniques locaux (diagnostic terrain).
@DataClassName('TerminalLog')
@TableIndex(name: 'idx_logs_created', columns: {#createdAt})
class TerminalLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get level => text()();
  TextColumn get event => text()();
  TextColumn get details => text().nullable()();
  DateTimeColumn get createdAt => dateTime()();
}

