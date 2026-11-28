// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $StudentsTable extends Students with TableInfo<$StudentsTable, Student> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $StudentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _studentUuidMeta =
      const VerificationMeta('studentUuid');
  @override
  late final GeneratedColumn<String> studentUuid = GeneratedColumn<String>(
      'student_uuid', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _studentCodeMeta =
      const VerificationMeta('studentCode');
  @override
  late final GeneratedColumn<String> studentCode = GeneratedColumn<String>(
      'student_code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _firstNameMeta =
      const VerificationMeta('firstName');
  @override
  late final GeneratedColumn<String> firstName = GeneratedColumn<String>(
      'first_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _lastNameMeta =
      const VerificationMeta('lastName');
  @override
  late final GeneratedColumn<String> lastName = GeneratedColumn<String>(
      'last_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _classIdMeta =
      const VerificationMeta('classId');
  @override
  late final GeneratedColumn<String> classId = GeneratedColumn<String>(
      'class_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _classNameMeta =
      const VerificationMeta('className');
  @override
  late final GeneratedColumn<String> className = GeneratedColumn<String>(
      'class_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _photoLocalPathMeta =
      const VerificationMeta('photoLocalPath');
  @override
  late final GeneratedColumn<String> photoLocalPath = GeneratedColumn<String>(
      'photo_local_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _photoRemoteUrlMeta =
      const VerificationMeta('photoRemoteUrl');
  @override
  late final GeneratedColumn<String> photoRemoteUrl = GeneratedColumn<String>(
      'photo_remote_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _qrTokenMeta =
      const VerificationMeta('qrToken');
  @override
  late final GeneratedColumn<String> qrToken = GeneratedColumn<String>(
      'qr_token', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isActiveMeta =
      const VerificationMeta('isActive');
  @override
  late final GeneratedColumn<bool> isActive = GeneratedColumn<bool>(
      'is_active', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_active" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _badgeRevokedMeta =
      const VerificationMeta('badgeRevoked');
  @override
  late final GeneratedColumn<bool> badgeRevoked = GeneratedColumn<bool>(
      'badge_revoked', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("badge_revoked" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _isDemoMeta = const VerificationMeta('isDemo');
  @override
  late final GeneratedColumn<bool> isDemo = GeneratedColumn<bool>(
      'is_demo', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_demo" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _lastSyncedAtMeta =
      const VerificationMeta('lastSyncedAt');
  @override
  late final GeneratedColumn<DateTime> lastSyncedAt = GeneratedColumn<DateTime>(
      'last_synced_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        studentUuid,
        studentCode,
        firstName,
        lastName,
        classId,
        className,
        photoLocalPath,
        photoRemoteUrl,
        qrToken,
        isActive,
        badgeRevoked,
        isDemo,
        updatedAt,
        lastSyncedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'students';
  @override
  VerificationContext validateIntegrity(Insertable<Student> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('student_uuid')) {
      context.handle(
          _studentUuidMeta,
          studentUuid.isAcceptableOrUnknown(
              data['student_uuid']!, _studentUuidMeta));
    }
    if (data.containsKey('student_code')) {
      context.handle(
          _studentCodeMeta,
          studentCode.isAcceptableOrUnknown(
              data['student_code']!, _studentCodeMeta));
    } else if (isInserting) {
      context.missing(_studentCodeMeta);
    }
    if (data.containsKey('first_name')) {
      context.handle(_firstNameMeta,
          firstName.isAcceptableOrUnknown(data['first_name']!, _firstNameMeta));
    }
    if (data.containsKey('last_name')) {
      context.handle(_lastNameMeta,
          lastName.isAcceptableOrUnknown(data['last_name']!, _lastNameMeta));
    }
    if (data.containsKey('class_id')) {
      context.handle(_classIdMeta,
          classId.isAcceptableOrUnknown(data['class_id']!, _classIdMeta));
    }
    if (data.containsKey('class_name')) {
      context.handle(_classNameMeta,
          className.isAcceptableOrUnknown(data['class_name']!, _classNameMeta));
    }
    if (data.containsKey('photo_local_path')) {
      context.handle(
          _photoLocalPathMeta,
          photoLocalPath.isAcceptableOrUnknown(
              data['photo_local_path']!, _photoLocalPathMeta));
    }
    if (data.containsKey('photo_remote_url')) {
      context.handle(
          _photoRemoteUrlMeta,
          photoRemoteUrl.isAcceptableOrUnknown(
              data['photo_remote_url']!, _photoRemoteUrlMeta));
    }
    if (data.containsKey('qr_token')) {
      context.handle(_qrTokenMeta,
          qrToken.isAcceptableOrUnknown(data['qr_token']!, _qrTokenMeta));
    } else if (isInserting) {
      context.missing(_qrTokenMeta);
    }
    if (data.containsKey('is_active')) {
      context.handle(_isActiveMeta,
          isActive.isAcceptableOrUnknown(data['is_active']!, _isActiveMeta));
    }
    if (data.containsKey('badge_revoked')) {
      context.handle(
          _badgeRevokedMeta,
          badgeRevoked.isAcceptableOrUnknown(
              data['badge_revoked']!, _badgeRevokedMeta));
    }
    if (data.containsKey('is_demo')) {
      context.handle(_isDemoMeta,
          isDemo.isAcceptableOrUnknown(data['is_demo']!, _isDemoMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('last_synced_at')) {
      context.handle(
          _lastSyncedAtMeta,
          lastSyncedAt.isAcceptableOrUnknown(
              data['last_synced_at']!, _lastSyncedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  Student map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return Student(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      studentUuid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_uuid']),
      studentCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_code'])!,
      firstName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}first_name'])!,
      lastName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_name'])!,
      classId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}class_id']),
      className: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}class_name'])!,
      photoLocalPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}photo_local_path']),
      photoRemoteUrl: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}photo_remote_url']),
      qrToken: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}qr_token'])!,
      isActive: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_active'])!,
      badgeRevoked: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}badge_revoked'])!,
      isDemo: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_demo'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      lastSyncedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_synced_at']),
    );
  }

  @override
  $StudentsTable createAlias(String alias) {
    return $StudentsTable(attachedDatabase, alias);
  }
}

class Student extends DataClass implements Insertable<Student> {
  /// Identifiant local stable (UUID généré à l'import).
  final String id;

  /// Identifiant de l'élève sur la plateforme centrale (si connu).
  final String? studentUuid;

  /// Matricule scolaire (ex. EL-0248).
  final String studentCode;
  final String firstName;
  final String lastName;
  final String? classId;
  final String className;

  /// Photo copiée dans les documents de l'application (mode hors ligne).
  final String? photoLocalPath;

  /// URL distante d'origine, utilisée plus tard par la synchronisation.
  final String? photoRemoteUrl;

  /// Token opaque du badge QR (jamais de données personnelles dans le QR).
  final String qrToken;

  /// Élève actif dans l'établissement.
  final bool isActive;

  /// Badge révoqué (perte, remplacement) : le scan est refusé.
  final bool badgeRevoked;

  /// Données de démonstration : identifiables et supprimables en un geste.
  final bool isDemo;
  final DateTime updatedAt;
  final DateTime? lastSyncedAt;
  const Student(
      {required this.id,
      this.studentUuid,
      required this.studentCode,
      required this.firstName,
      required this.lastName,
      this.classId,
      required this.className,
      this.photoLocalPath,
      this.photoRemoteUrl,
      required this.qrToken,
      required this.isActive,
      required this.badgeRevoked,
      required this.isDemo,
      required this.updatedAt,
      this.lastSyncedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || studentUuid != null) {
      map['student_uuid'] = Variable<String>(studentUuid);
    }
    map['student_code'] = Variable<String>(studentCode);
    map['first_name'] = Variable<String>(firstName);
    map['last_name'] = Variable<String>(lastName);
    if (!nullToAbsent || classId != null) {
      map['class_id'] = Variable<String>(classId);
    }
    map['class_name'] = Variable<String>(className);
    if (!nullToAbsent || photoLocalPath != null) {
      map['photo_local_path'] = Variable<String>(photoLocalPath);
    }
    if (!nullToAbsent || photoRemoteUrl != null) {
      map['photo_remote_url'] = Variable<String>(photoRemoteUrl);
    }
    map['qr_token'] = Variable<String>(qrToken);
    map['is_active'] = Variable<bool>(isActive);
    map['badge_revoked'] = Variable<bool>(badgeRevoked);
    map['is_demo'] = Variable<bool>(isDemo);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    if (!nullToAbsent || lastSyncedAt != null) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt);
    }
    return map;
  }

  StudentsCompanion toCompanion(bool nullToAbsent) {
    return StudentsCompanion(
      id: Value(id),
      studentUuid: studentUuid == null && nullToAbsent
          ? const Value.absent()
          : Value(studentUuid),
      studentCode: Value(studentCode),
      firstName: Value(firstName),
      lastName: Value(lastName),
      classId: classId == null && nullToAbsent
          ? const Value.absent()
          : Value(classId),
      className: Value(className),
      photoLocalPath: photoLocalPath == null && nullToAbsent
          ? const Value.absent()
          : Value(photoLocalPath),
      photoRemoteUrl: photoRemoteUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(photoRemoteUrl),
      qrToken: Value(qrToken),
      isActive: Value(isActive),
      badgeRevoked: Value(badgeRevoked),
      isDemo: Value(isDemo),
      updatedAt: Value(updatedAt),
      lastSyncedAt: lastSyncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncedAt),
    );
  }

  factory Student.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return Student(
      id: serializer.fromJson<String>(json['id']),
      studentUuid: serializer.fromJson<String?>(json['studentUuid']),
      studentCode: serializer.fromJson<String>(json['studentCode']),
      firstName: serializer.fromJson<String>(json['firstName']),
      lastName: serializer.fromJson<String>(json['lastName']),
      classId: serializer.fromJson<String?>(json['classId']),
      className: serializer.fromJson<String>(json['className']),
      photoLocalPath: serializer.fromJson<String?>(json['photoLocalPath']),
      photoRemoteUrl: serializer.fromJson<String?>(json['photoRemoteUrl']),
      qrToken: serializer.fromJson<String>(json['qrToken']),
      isActive: serializer.fromJson<bool>(json['isActive']),
      badgeRevoked: serializer.fromJson<bool>(json['badgeRevoked']),
      isDemo: serializer.fromJson<bool>(json['isDemo']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      lastSyncedAt: serializer.fromJson<DateTime?>(json['lastSyncedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'studentUuid': serializer.toJson<String?>(studentUuid),
      'studentCode': serializer.toJson<String>(studentCode),
      'firstName': serializer.toJson<String>(firstName),
      'lastName': serializer.toJson<String>(lastName),
      'classId': serializer.toJson<String?>(classId),
      'className': serializer.toJson<String>(className),
      'photoLocalPath': serializer.toJson<String?>(photoLocalPath),
      'photoRemoteUrl': serializer.toJson<String?>(photoRemoteUrl),
      'qrToken': serializer.toJson<String>(qrToken),
      'isActive': serializer.toJson<bool>(isActive),
      'badgeRevoked': serializer.toJson<bool>(badgeRevoked),
      'isDemo': serializer.toJson<bool>(isDemo),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'lastSyncedAt': serializer.toJson<DateTime?>(lastSyncedAt),
    };
  }

  Student copyWith(
          {String? id,
          Value<String?> studentUuid = const Value.absent(),
          String? studentCode,
          String? firstName,
          String? lastName,
          Value<String?> classId = const Value.absent(),
          String? className,
          Value<String?> photoLocalPath = const Value.absent(),
          Value<String?> photoRemoteUrl = const Value.absent(),
          String? qrToken,
          bool? isActive,
          bool? badgeRevoked,
          bool? isDemo,
          DateTime? updatedAt,
          Value<DateTime?> lastSyncedAt = const Value.absent()}) =>
      Student(
        id: id ?? this.id,
        studentUuid: studentUuid.present ? studentUuid.value : this.studentUuid,
        studentCode: studentCode ?? this.studentCode,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        classId: classId.present ? classId.value : this.classId,
        className: className ?? this.className,
        photoLocalPath:
            photoLocalPath.present ? photoLocalPath.value : this.photoLocalPath,
        photoRemoteUrl:
            photoRemoteUrl.present ? photoRemoteUrl.value : this.photoRemoteUrl,
        qrToken: qrToken ?? this.qrToken,
        isActive: isActive ?? this.isActive,
        badgeRevoked: badgeRevoked ?? this.badgeRevoked,
        isDemo: isDemo ?? this.isDemo,
        updatedAt: updatedAt ?? this.updatedAt,
        lastSyncedAt:
            lastSyncedAt.present ? lastSyncedAt.value : this.lastSyncedAt,
      );
  Student copyWithCompanion(StudentsCompanion data) {
    return Student(
      id: data.id.present ? data.id.value : this.id,
      studentUuid:
          data.studentUuid.present ? data.studentUuid.value : this.studentUuid,
      studentCode:
          data.studentCode.present ? data.studentCode.value : this.studentCode,
      firstName: data.firstName.present ? data.firstName.value : this.firstName,
      lastName: data.lastName.present ? data.lastName.value : this.lastName,
      classId: data.classId.present ? data.classId.value : this.classId,
      className: data.className.present ? data.className.value : this.className,
      photoLocalPath: data.photoLocalPath.present
          ? data.photoLocalPath.value
          : this.photoLocalPath,
      photoRemoteUrl: data.photoRemoteUrl.present
          ? data.photoRemoteUrl.value
          : this.photoRemoteUrl,
      qrToken: data.qrToken.present ? data.qrToken.value : this.qrToken,
      isActive: data.isActive.present ? data.isActive.value : this.isActive,
      badgeRevoked: data.badgeRevoked.present
          ? data.badgeRevoked.value
          : this.badgeRevoked,
      isDemo: data.isDemo.present ? data.isDemo.value : this.isDemo,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      lastSyncedAt: data.lastSyncedAt.present
          ? data.lastSyncedAt.value
          : this.lastSyncedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('Student(')
          ..write('id: $id, ')
          ..write('studentUuid: $studentUuid, ')
          ..write('studentCode: $studentCode, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('classId: $classId, ')
          ..write('className: $className, ')
          ..write('photoLocalPath: $photoLocalPath, ')
          ..write('photoRemoteUrl: $photoRemoteUrl, ')
          ..write('qrToken: $qrToken, ')
          ..write('isActive: $isActive, ')
          ..write('badgeRevoked: $badgeRevoked, ')
          ..write('isDemo: $isDemo, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('lastSyncedAt: $lastSyncedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      studentUuid,
      studentCode,
      firstName,
      lastName,
      classId,
      className,
      photoLocalPath,
      photoRemoteUrl,
      qrToken,
      isActive,
      badgeRevoked,
      isDemo,
      updatedAt,
      lastSyncedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is Student &&
          other.id == this.id &&
          other.studentUuid == this.studentUuid &&
          other.studentCode == this.studentCode &&
          other.firstName == this.firstName &&
          other.lastName == this.lastName &&
          other.classId == this.classId &&
          other.className == this.className &&
          other.photoLocalPath == this.photoLocalPath &&
          other.photoRemoteUrl == this.photoRemoteUrl &&
          other.qrToken == this.qrToken &&
          other.isActive == this.isActive &&
          other.badgeRevoked == this.badgeRevoked &&
          other.isDemo == this.isDemo &&
          other.updatedAt == this.updatedAt &&
          other.lastSyncedAt == this.lastSyncedAt);
}

class StudentsCompanion extends UpdateCompanion<Student> {
  final Value<String> id;
  final Value<String?> studentUuid;
  final Value<String> studentCode;
  final Value<String> firstName;
  final Value<String> lastName;
  final Value<String?> classId;
  final Value<String> className;
  final Value<String?> photoLocalPath;
  final Value<String?> photoRemoteUrl;
  final Value<String> qrToken;
  final Value<bool> isActive;
  final Value<bool> badgeRevoked;
  final Value<bool> isDemo;
  final Value<DateTime> updatedAt;
  final Value<DateTime?> lastSyncedAt;
  final Value<int> rowid;
  const StudentsCompanion({
    this.id = const Value.absent(),
    this.studentUuid = const Value.absent(),
    this.studentCode = const Value.absent(),
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.classId = const Value.absent(),
    this.className = const Value.absent(),
    this.photoLocalPath = const Value.absent(),
    this.photoRemoteUrl = const Value.absent(),
    this.qrToken = const Value.absent(),
    this.isActive = const Value.absent(),
    this.badgeRevoked = const Value.absent(),
    this.isDemo = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  StudentsCompanion.insert({
    required String id,
    this.studentUuid = const Value.absent(),
    required String studentCode,
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.classId = const Value.absent(),
    this.className = const Value.absent(),
    this.photoLocalPath = const Value.absent(),
    this.photoRemoteUrl = const Value.absent(),
    required String qrToken,
    this.isActive = const Value.absent(),
    this.badgeRevoked = const Value.absent(),
    this.isDemo = const Value.absent(),
    required DateTime updatedAt,
    this.lastSyncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        studentCode = Value(studentCode),
        qrToken = Value(qrToken),
        updatedAt = Value(updatedAt);
  static Insertable<Student> custom({
    Expression<String>? id,
    Expression<String>? studentUuid,
    Expression<String>? studentCode,
    Expression<String>? firstName,
    Expression<String>? lastName,
    Expression<String>? classId,
    Expression<String>? className,
    Expression<String>? photoLocalPath,
    Expression<String>? photoRemoteUrl,
    Expression<String>? qrToken,
    Expression<bool>? isActive,
    Expression<bool>? badgeRevoked,
    Expression<bool>? isDemo,
    Expression<DateTime>? updatedAt,
    Expression<DateTime>? lastSyncedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (studentUuid != null) 'student_uuid': studentUuid,
      if (studentCode != null) 'student_code': studentCode,
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (classId != null) 'class_id': classId,
      if (className != null) 'class_name': className,
      if (photoLocalPath != null) 'photo_local_path': photoLocalPath,
      if (photoRemoteUrl != null) 'photo_remote_url': photoRemoteUrl,
      if (qrToken != null) 'qr_token': qrToken,
      if (isActive != null) 'is_active': isActive,
      if (badgeRevoked != null) 'badge_revoked': badgeRevoked,
      if (isDemo != null) 'is_demo': isDemo,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (lastSyncedAt != null) 'last_synced_at': lastSyncedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  StudentsCompanion copyWith(
      {Value<String>? id,
      Value<String?>? studentUuid,
      Value<String>? studentCode,
      Value<String>? firstName,
      Value<String>? lastName,
      Value<String?>? classId,
      Value<String>? className,
      Value<String?>? photoLocalPath,
      Value<String?>? photoRemoteUrl,
      Value<String>? qrToken,
      Value<bool>? isActive,
      Value<bool>? badgeRevoked,
      Value<bool>? isDemo,
      Value<DateTime>? updatedAt,
      Value<DateTime?>? lastSyncedAt,
      Value<int>? rowid}) {
    return StudentsCompanion(
      id: id ?? this.id,
      studentUuid: studentUuid ?? this.studentUuid,
      studentCode: studentCode ?? this.studentCode,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      photoLocalPath: photoLocalPath ?? this.photoLocalPath,
      photoRemoteUrl: photoRemoteUrl ?? this.photoRemoteUrl,
      qrToken: qrToken ?? this.qrToken,
      isActive: isActive ?? this.isActive,
      badgeRevoked: badgeRevoked ?? this.badgeRevoked,
      isDemo: isDemo ?? this.isDemo,
      updatedAt: updatedAt ?? this.updatedAt,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (studentUuid.present) {
      map['student_uuid'] = Variable<String>(studentUuid.value);
    }
    if (studentCode.present) {
      map['student_code'] = Variable<String>(studentCode.value);
    }
    if (firstName.present) {
      map['first_name'] = Variable<String>(firstName.value);
    }
    if (lastName.present) {
      map['last_name'] = Variable<String>(lastName.value);
    }
    if (classId.present) {
      map['class_id'] = Variable<String>(classId.value);
    }
    if (className.present) {
      map['class_name'] = Variable<String>(className.value);
    }
    if (photoLocalPath.present) {
      map['photo_local_path'] = Variable<String>(photoLocalPath.value);
    }
    if (photoRemoteUrl.present) {
      map['photo_remote_url'] = Variable<String>(photoRemoteUrl.value);
    }
    if (qrToken.present) {
      map['qr_token'] = Variable<String>(qrToken.value);
    }
    if (isActive.present) {
      map['is_active'] = Variable<bool>(isActive.value);
    }
    if (badgeRevoked.present) {
      map['badge_revoked'] = Variable<bool>(badgeRevoked.value);
    }
    if (isDemo.present) {
      map['is_demo'] = Variable<bool>(isDemo.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (lastSyncedAt.present) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('StudentsCompanion(')
          ..write('id: $id, ')
          ..write('studentUuid: $studentUuid, ')
          ..write('studentCode: $studentCode, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('classId: $classId, ')
          ..write('className: $className, ')
          ..write('photoLocalPath: $photoLocalPath, ')
          ..write('photoRemoteUrl: $photoRemoteUrl, ')
          ..write('qrToken: $qrToken, ')
          ..write('isActive: $isActive, ')
          ..write('badgeRevoked: $badgeRevoked, ')
          ..write('isDemo: $isDemo, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('lastSyncedAt: $lastSyncedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $StaffMembersTable extends StaffMembers
    with TableInfo<$StaffMembersTable, StaffMember> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $StaffMembersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _staffUuidMeta =
      const VerificationMeta('staffUuid');
  @override
  late final GeneratedColumn<String> staffUuid = GeneratedColumn<String>(
      'staff_uuid', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _staffCodeMeta =
      const VerificationMeta('staffCode');
  @override
  late final GeneratedColumn<String> staffCode = GeneratedColumn<String>(
      'staff_code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _firstNameMeta =
      const VerificationMeta('firstName');
  @override
  late final GeneratedColumn<String> firstName = GeneratedColumn<String>(
      'first_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _lastNameMeta =
      const VerificationMeta('lastName');
  @override
  late final GeneratedColumn<String> lastName = GeneratedColumn<String>(
      'last_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _staffTypeMeta =
      const VerificationMeta('staffType');
  @override
  late final GeneratedColumn<String> staffType = GeneratedColumn<String>(
      'staff_type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('teacher'));
  static const VerificationMeta _roleLabelMeta =
      const VerificationMeta('roleLabel');
  @override
  late final GeneratedColumn<String> roleLabel = GeneratedColumn<String>(
      'role_label', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Personnel'));
  static const VerificationMeta _photoLocalPathMeta =
      const VerificationMeta('photoLocalPath');
  @override
  late final GeneratedColumn<String> photoLocalPath = GeneratedColumn<String>(
      'photo_local_path', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _photoRemoteUrlMeta =
      const VerificationMeta('photoRemoteUrl');
  @override
  late final GeneratedColumn<String> photoRemoteUrl = GeneratedColumn<String>(
      'photo_remote_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _qrTokenMeta =
      const VerificationMeta('qrToken');
  @override
  late final GeneratedColumn<String> qrToken = GeneratedColumn<String>(
      'qr_token', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _isActiveMeta =
      const VerificationMeta('isActive');
  @override
  late final GeneratedColumn<bool> isActive = GeneratedColumn<bool>(
      'is_active', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("is_active" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _badgeRevokedMeta =
      const VerificationMeta('badgeRevoked');
  @override
  late final GeneratedColumn<bool> badgeRevoked = GeneratedColumn<bool>(
      'badge_revoked', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("badge_revoked" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _lastSyncedAtMeta =
      const VerificationMeta('lastSyncedAt');
  @override
  late final GeneratedColumn<DateTime> lastSyncedAt = GeneratedColumn<DateTime>(
      'last_synced_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        staffUuid,
        staffCode,
        firstName,
        lastName,
        staffType,
        roleLabel,
        photoLocalPath,
        photoRemoteUrl,
        qrToken,
        isActive,
        badgeRevoked,
        updatedAt,
        lastSyncedAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'staff_members';
  @override
  VerificationContext validateIntegrity(Insertable<StaffMember> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('staff_uuid')) {
      context.handle(_staffUuidMeta,
          staffUuid.isAcceptableOrUnknown(data['staff_uuid']!, _staffUuidMeta));
    }
    if (data.containsKey('staff_code')) {
      context.handle(_staffCodeMeta,
          staffCode.isAcceptableOrUnknown(data['staff_code']!, _staffCodeMeta));
    } else if (isInserting) {
      context.missing(_staffCodeMeta);
    }
    if (data.containsKey('first_name')) {
      context.handle(_firstNameMeta,
          firstName.isAcceptableOrUnknown(data['first_name']!, _firstNameMeta));
    }
    if (data.containsKey('last_name')) {
      context.handle(_lastNameMeta,
          lastName.isAcceptableOrUnknown(data['last_name']!, _lastNameMeta));
    }
    if (data.containsKey('staff_type')) {
      context.handle(_staffTypeMeta,
          staffType.isAcceptableOrUnknown(data['staff_type']!, _staffTypeMeta));
    }
    if (data.containsKey('role_label')) {
      context.handle(_roleLabelMeta,
          roleLabel.isAcceptableOrUnknown(data['role_label']!, _roleLabelMeta));
    }
    if (data.containsKey('photo_local_path')) {
      context.handle(
          _photoLocalPathMeta,
          photoLocalPath.isAcceptableOrUnknown(
              data['photo_local_path']!, _photoLocalPathMeta));
    }
    if (data.containsKey('photo_remote_url')) {
      context.handle(
          _photoRemoteUrlMeta,
          photoRemoteUrl.isAcceptableOrUnknown(
              data['photo_remote_url']!, _photoRemoteUrlMeta));
    }
    if (data.containsKey('qr_token')) {
      context.handle(_qrTokenMeta,
          qrToken.isAcceptableOrUnknown(data['qr_token']!, _qrTokenMeta));
    } else if (isInserting) {
      context.missing(_qrTokenMeta);
    }
    if (data.containsKey('is_active')) {
      context.handle(_isActiveMeta,
          isActive.isAcceptableOrUnknown(data['is_active']!, _isActiveMeta));
    }
    if (data.containsKey('badge_revoked')) {
      context.handle(
          _badgeRevokedMeta,
          badgeRevoked.isAcceptableOrUnknown(
              data['badge_revoked']!, _badgeRevokedMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    if (data.containsKey('last_synced_at')) {
      context.handle(
          _lastSyncedAtMeta,
          lastSyncedAt.isAcceptableOrUnknown(
              data['last_synced_at']!, _lastSyncedAtMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  StaffMember map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return StaffMember(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      staffUuid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}staff_uuid']),
      staffCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}staff_code'])!,
      firstName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}first_name'])!,
      lastName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_name'])!,
      staffType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}staff_type'])!,
      roleLabel: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}role_label'])!,
      photoLocalPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}photo_local_path']),
      photoRemoteUrl: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}photo_remote_url']),
      qrToken: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}qr_token'])!,
      isActive: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}is_active'])!,
      badgeRevoked: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}badge_revoked'])!,
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
      lastSyncedAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_synced_at']),
    );
  }

  @override
  $StaffMembersTable createAlias(String alias) {
    return $StaffMembersTable(attachedDatabase, alias);
  }
}

class StaffMember extends DataClass implements Insertable<StaffMember> {
  /// Identifiant local stable (`staff-<matricule>`).
  final String id;

  /// `users.id` côté plateforme.
  final String? staffUuid;

  /// Matricule du personnel (teacher_profiles.matricule ou admins.matricule).
  final String staffCode;
  final String firstName;
  final String lastName;

  /// `teacher` ou `admin`.
  final String staffType;

  /// Libellé affiché (« Enseignant · Mathématiques », « Administration »…).
  final String roleLabel;
  final String? photoLocalPath;
  final String? photoRemoteUrl;
  final String qrToken;
  final bool isActive;
  final bool badgeRevoked;
  final DateTime updatedAt;
  final DateTime? lastSyncedAt;
  const StaffMember(
      {required this.id,
      this.staffUuid,
      required this.staffCode,
      required this.firstName,
      required this.lastName,
      required this.staffType,
      required this.roleLabel,
      this.photoLocalPath,
      this.photoRemoteUrl,
      required this.qrToken,
      required this.isActive,
      required this.badgeRevoked,
      required this.updatedAt,
      this.lastSyncedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || staffUuid != null) {
      map['staff_uuid'] = Variable<String>(staffUuid);
    }
    map['staff_code'] = Variable<String>(staffCode);
    map['first_name'] = Variable<String>(firstName);
    map['last_name'] = Variable<String>(lastName);
    map['staff_type'] = Variable<String>(staffType);
    map['role_label'] = Variable<String>(roleLabel);
    if (!nullToAbsent || photoLocalPath != null) {
      map['photo_local_path'] = Variable<String>(photoLocalPath);
    }
    if (!nullToAbsent || photoRemoteUrl != null) {
      map['photo_remote_url'] = Variable<String>(photoRemoteUrl);
    }
    map['qr_token'] = Variable<String>(qrToken);
    map['is_active'] = Variable<bool>(isActive);
    map['badge_revoked'] = Variable<bool>(badgeRevoked);
    map['updated_at'] = Variable<DateTime>(updatedAt);
    if (!nullToAbsent || lastSyncedAt != null) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt);
    }
    return map;
  }

  StaffMembersCompanion toCompanion(bool nullToAbsent) {
    return StaffMembersCompanion(
      id: Value(id),
      staffUuid: staffUuid == null && nullToAbsent
          ? const Value.absent()
          : Value(staffUuid),
      staffCode: Value(staffCode),
      firstName: Value(firstName),
      lastName: Value(lastName),
      staffType: Value(staffType),
      roleLabel: Value(roleLabel),
      photoLocalPath: photoLocalPath == null && nullToAbsent
          ? const Value.absent()
          : Value(photoLocalPath),
      photoRemoteUrl: photoRemoteUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(photoRemoteUrl),
      qrToken: Value(qrToken),
      isActive: Value(isActive),
      badgeRevoked: Value(badgeRevoked),
      updatedAt: Value(updatedAt),
      lastSyncedAt: lastSyncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncedAt),
    );
  }

  factory StaffMember.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return StaffMember(
      id: serializer.fromJson<String>(json['id']),
      staffUuid: serializer.fromJson<String?>(json['staffUuid']),
      staffCode: serializer.fromJson<String>(json['staffCode']),
      firstName: serializer.fromJson<String>(json['firstName']),
      lastName: serializer.fromJson<String>(json['lastName']),
      staffType: serializer.fromJson<String>(json['staffType']),
      roleLabel: serializer.fromJson<String>(json['roleLabel']),
      photoLocalPath: serializer.fromJson<String?>(json['photoLocalPath']),
      photoRemoteUrl: serializer.fromJson<String?>(json['photoRemoteUrl']),
      qrToken: serializer.fromJson<String>(json['qrToken']),
      isActive: serializer.fromJson<bool>(json['isActive']),
      badgeRevoked: serializer.fromJson<bool>(json['badgeRevoked']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
      lastSyncedAt: serializer.fromJson<DateTime?>(json['lastSyncedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'staffUuid': serializer.toJson<String?>(staffUuid),
      'staffCode': serializer.toJson<String>(staffCode),
      'firstName': serializer.toJson<String>(firstName),
      'lastName': serializer.toJson<String>(lastName),
      'staffType': serializer.toJson<String>(staffType),
      'roleLabel': serializer.toJson<String>(roleLabel),
      'photoLocalPath': serializer.toJson<String?>(photoLocalPath),
      'photoRemoteUrl': serializer.toJson<String?>(photoRemoteUrl),
      'qrToken': serializer.toJson<String>(qrToken),
      'isActive': serializer.toJson<bool>(isActive),
      'badgeRevoked': serializer.toJson<bool>(badgeRevoked),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
      'lastSyncedAt': serializer.toJson<DateTime?>(lastSyncedAt),
    };
  }

  StaffMember copyWith(
          {String? id,
          Value<String?> staffUuid = const Value.absent(),
          String? staffCode,
          String? firstName,
          String? lastName,
          String? staffType,
          String? roleLabel,
          Value<String?> photoLocalPath = const Value.absent(),
          Value<String?> photoRemoteUrl = const Value.absent(),
          String? qrToken,
          bool? isActive,
          bool? badgeRevoked,
          DateTime? updatedAt,
          Value<DateTime?> lastSyncedAt = const Value.absent()}) =>
      StaffMember(
        id: id ?? this.id,
        staffUuid: staffUuid.present ? staffUuid.value : this.staffUuid,
        staffCode: staffCode ?? this.staffCode,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        staffType: staffType ?? this.staffType,
        roleLabel: roleLabel ?? this.roleLabel,
        photoLocalPath:
            photoLocalPath.present ? photoLocalPath.value : this.photoLocalPath,
        photoRemoteUrl:
            photoRemoteUrl.present ? photoRemoteUrl.value : this.photoRemoteUrl,
        qrToken: qrToken ?? this.qrToken,
        isActive: isActive ?? this.isActive,
        badgeRevoked: badgeRevoked ?? this.badgeRevoked,
        updatedAt: updatedAt ?? this.updatedAt,
        lastSyncedAt:
            lastSyncedAt.present ? lastSyncedAt.value : this.lastSyncedAt,
      );
  StaffMember copyWithCompanion(StaffMembersCompanion data) {
    return StaffMember(
      id: data.id.present ? data.id.value : this.id,
      staffUuid: data.staffUuid.present ? data.staffUuid.value : this.staffUuid,
      staffCode: data.staffCode.present ? data.staffCode.value : this.staffCode,
      firstName: data.firstName.present ? data.firstName.value : this.firstName,
      lastName: data.lastName.present ? data.lastName.value : this.lastName,
      staffType: data.staffType.present ? data.staffType.value : this.staffType,
      roleLabel: data.roleLabel.present ? data.roleLabel.value : this.roleLabel,
      photoLocalPath: data.photoLocalPath.present
          ? data.photoLocalPath.value
          : this.photoLocalPath,
      photoRemoteUrl: data.photoRemoteUrl.present
          ? data.photoRemoteUrl.value
          : this.photoRemoteUrl,
      qrToken: data.qrToken.present ? data.qrToken.value : this.qrToken,
      isActive: data.isActive.present ? data.isActive.value : this.isActive,
      badgeRevoked: data.badgeRevoked.present
          ? data.badgeRevoked.value
          : this.badgeRevoked,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
      lastSyncedAt: data.lastSyncedAt.present
          ? data.lastSyncedAt.value
          : this.lastSyncedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('StaffMember(')
          ..write('id: $id, ')
          ..write('staffUuid: $staffUuid, ')
          ..write('staffCode: $staffCode, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('staffType: $staffType, ')
          ..write('roleLabel: $roleLabel, ')
          ..write('photoLocalPath: $photoLocalPath, ')
          ..write('photoRemoteUrl: $photoRemoteUrl, ')
          ..write('qrToken: $qrToken, ')
          ..write('isActive: $isActive, ')
          ..write('badgeRevoked: $badgeRevoked, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('lastSyncedAt: $lastSyncedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      staffUuid,
      staffCode,
      firstName,
      lastName,
      staffType,
      roleLabel,
      photoLocalPath,
      photoRemoteUrl,
      qrToken,
      isActive,
      badgeRevoked,
      updatedAt,
      lastSyncedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is StaffMember &&
          other.id == this.id &&
          other.staffUuid == this.staffUuid &&
          other.staffCode == this.staffCode &&
          other.firstName == this.firstName &&
          other.lastName == this.lastName &&
          other.staffType == this.staffType &&
          other.roleLabel == this.roleLabel &&
          other.photoLocalPath == this.photoLocalPath &&
          other.photoRemoteUrl == this.photoRemoteUrl &&
          other.qrToken == this.qrToken &&
          other.isActive == this.isActive &&
          other.badgeRevoked == this.badgeRevoked &&
          other.updatedAt == this.updatedAt &&
          other.lastSyncedAt == this.lastSyncedAt);
}

class StaffMembersCompanion extends UpdateCompanion<StaffMember> {
  final Value<String> id;
  final Value<String?> staffUuid;
  final Value<String> staffCode;
  final Value<String> firstName;
  final Value<String> lastName;
  final Value<String> staffType;
  final Value<String> roleLabel;
  final Value<String?> photoLocalPath;
  final Value<String?> photoRemoteUrl;
  final Value<String> qrToken;
  final Value<bool> isActive;
  final Value<bool> badgeRevoked;
  final Value<DateTime> updatedAt;
  final Value<DateTime?> lastSyncedAt;
  final Value<int> rowid;
  const StaffMembersCompanion({
    this.id = const Value.absent(),
    this.staffUuid = const Value.absent(),
    this.staffCode = const Value.absent(),
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.staffType = const Value.absent(),
    this.roleLabel = const Value.absent(),
    this.photoLocalPath = const Value.absent(),
    this.photoRemoteUrl = const Value.absent(),
    this.qrToken = const Value.absent(),
    this.isActive = const Value.absent(),
    this.badgeRevoked = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.lastSyncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  StaffMembersCompanion.insert({
    required String id,
    this.staffUuid = const Value.absent(),
    required String staffCode,
    this.firstName = const Value.absent(),
    this.lastName = const Value.absent(),
    this.staffType = const Value.absent(),
    this.roleLabel = const Value.absent(),
    this.photoLocalPath = const Value.absent(),
    this.photoRemoteUrl = const Value.absent(),
    required String qrToken,
    this.isActive = const Value.absent(),
    this.badgeRevoked = const Value.absent(),
    required DateTime updatedAt,
    this.lastSyncedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        staffCode = Value(staffCode),
        qrToken = Value(qrToken),
        updatedAt = Value(updatedAt);
  static Insertable<StaffMember> custom({
    Expression<String>? id,
    Expression<String>? staffUuid,
    Expression<String>? staffCode,
    Expression<String>? firstName,
    Expression<String>? lastName,
    Expression<String>? staffType,
    Expression<String>? roleLabel,
    Expression<String>? photoLocalPath,
    Expression<String>? photoRemoteUrl,
    Expression<String>? qrToken,
    Expression<bool>? isActive,
    Expression<bool>? badgeRevoked,
    Expression<DateTime>? updatedAt,
    Expression<DateTime>? lastSyncedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (staffUuid != null) 'staff_uuid': staffUuid,
      if (staffCode != null) 'staff_code': staffCode,
      if (firstName != null) 'first_name': firstName,
      if (lastName != null) 'last_name': lastName,
      if (staffType != null) 'staff_type': staffType,
      if (roleLabel != null) 'role_label': roleLabel,
      if (photoLocalPath != null) 'photo_local_path': photoLocalPath,
      if (photoRemoteUrl != null) 'photo_remote_url': photoRemoteUrl,
      if (qrToken != null) 'qr_token': qrToken,
      if (isActive != null) 'is_active': isActive,
      if (badgeRevoked != null) 'badge_revoked': badgeRevoked,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (lastSyncedAt != null) 'last_synced_at': lastSyncedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  StaffMembersCompanion copyWith(
      {Value<String>? id,
      Value<String?>? staffUuid,
      Value<String>? staffCode,
      Value<String>? firstName,
      Value<String>? lastName,
      Value<String>? staffType,
      Value<String>? roleLabel,
      Value<String?>? photoLocalPath,
      Value<String?>? photoRemoteUrl,
      Value<String>? qrToken,
      Value<bool>? isActive,
      Value<bool>? badgeRevoked,
      Value<DateTime>? updatedAt,
      Value<DateTime?>? lastSyncedAt,
      Value<int>? rowid}) {
    return StaffMembersCompanion(
      id: id ?? this.id,
      staffUuid: staffUuid ?? this.staffUuid,
      staffCode: staffCode ?? this.staffCode,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      staffType: staffType ?? this.staffType,
      roleLabel: roleLabel ?? this.roleLabel,
      photoLocalPath: photoLocalPath ?? this.photoLocalPath,
      photoRemoteUrl: photoRemoteUrl ?? this.photoRemoteUrl,
      qrToken: qrToken ?? this.qrToken,
      isActive: isActive ?? this.isActive,
      badgeRevoked: badgeRevoked ?? this.badgeRevoked,
      updatedAt: updatedAt ?? this.updatedAt,
      lastSyncedAt: lastSyncedAt ?? this.lastSyncedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (staffUuid.present) {
      map['staff_uuid'] = Variable<String>(staffUuid.value);
    }
    if (staffCode.present) {
      map['staff_code'] = Variable<String>(staffCode.value);
    }
    if (firstName.present) {
      map['first_name'] = Variable<String>(firstName.value);
    }
    if (lastName.present) {
      map['last_name'] = Variable<String>(lastName.value);
    }
    if (staffType.present) {
      map['staff_type'] = Variable<String>(staffType.value);
    }
    if (roleLabel.present) {
      map['role_label'] = Variable<String>(roleLabel.value);
    }
    if (photoLocalPath.present) {
      map['photo_local_path'] = Variable<String>(photoLocalPath.value);
    }
    if (photoRemoteUrl.present) {
      map['photo_remote_url'] = Variable<String>(photoRemoteUrl.value);
    }
    if (qrToken.present) {
      map['qr_token'] = Variable<String>(qrToken.value);
    }
    if (isActive.present) {
      map['is_active'] = Variable<bool>(isActive.value);
    }
    if (badgeRevoked.present) {
      map['badge_revoked'] = Variable<bool>(badgeRevoked.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (lastSyncedAt.present) {
      map['last_synced_at'] = Variable<DateTime>(lastSyncedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('StaffMembersCompanion(')
          ..write('id: $id, ')
          ..write('staffUuid: $staffUuid, ')
          ..write('staffCode: $staffCode, ')
          ..write('firstName: $firstName, ')
          ..write('lastName: $lastName, ')
          ..write('staffType: $staffType, ')
          ..write('roleLabel: $roleLabel, ')
          ..write('photoLocalPath: $photoLocalPath, ')
          ..write('photoRemoteUrl: $photoRemoteUrl, ')
          ..write('qrToken: $qrToken, ')
          ..write('isActive: $isActive, ')
          ..write('badgeRevoked: $badgeRevoked, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('lastSyncedAt: $lastSyncedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SchoolClassesTable extends SchoolClasses
    with TableInfo<$SchoolClassesTable, SchoolClass> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SchoolClassesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _remoteIdMeta =
      const VerificationMeta('remoteId');
  @override
  late final GeneratedColumn<String> remoteId = GeneratedColumn<String>(
      'remote_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
      'name', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _levelMeta = const VerificationMeta('level');
  @override
  late final GeneratedColumn<String> level = GeneratedColumn<String>(
      'level', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _updatedAtMeta =
      const VerificationMeta('updatedAt');
  @override
  late final GeneratedColumn<DateTime> updatedAt = GeneratedColumn<DateTime>(
      'updated_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, remoteId, name, level, updatedAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'school_classes';
  @override
  VerificationContext validateIntegrity(Insertable<SchoolClass> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('remote_id')) {
      context.handle(_remoteIdMeta,
          remoteId.isAcceptableOrUnknown(data['remote_id']!, _remoteIdMeta));
    }
    if (data.containsKey('name')) {
      context.handle(
          _nameMeta, name.isAcceptableOrUnknown(data['name']!, _nameMeta));
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('level')) {
      context.handle(
          _levelMeta, level.isAcceptableOrUnknown(data['level']!, _levelMeta));
    }
    if (data.containsKey('updated_at')) {
      context.handle(_updatedAtMeta,
          updatedAt.isAcceptableOrUnknown(data['updated_at']!, _updatedAtMeta));
    } else if (isInserting) {
      context.missing(_updatedAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SchoolClass map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SchoolClass(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      remoteId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}remote_id']),
      name: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}name'])!,
      level: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}level']),
      updatedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}updated_at'])!,
    );
  }

  @override
  $SchoolClassesTable createAlias(String alias) {
    return $SchoolClassesTable(attachedDatabase, alias);
  }
}

class SchoolClass extends DataClass implements Insertable<SchoolClass> {
  final String id;
  final String? remoteId;
  final String name;
  final String? level;
  final DateTime updatedAt;
  const SchoolClass(
      {required this.id,
      this.remoteId,
      required this.name,
      this.level,
      required this.updatedAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || remoteId != null) {
      map['remote_id'] = Variable<String>(remoteId);
    }
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || level != null) {
      map['level'] = Variable<String>(level);
    }
    map['updated_at'] = Variable<DateTime>(updatedAt);
    return map;
  }

  SchoolClassesCompanion toCompanion(bool nullToAbsent) {
    return SchoolClassesCompanion(
      id: Value(id),
      remoteId: remoteId == null && nullToAbsent
          ? const Value.absent()
          : Value(remoteId),
      name: Value(name),
      level:
          level == null && nullToAbsent ? const Value.absent() : Value(level),
      updatedAt: Value(updatedAt),
    );
  }

  factory SchoolClass.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SchoolClass(
      id: serializer.fromJson<String>(json['id']),
      remoteId: serializer.fromJson<String?>(json['remoteId']),
      name: serializer.fromJson<String>(json['name']),
      level: serializer.fromJson<String?>(json['level']),
      updatedAt: serializer.fromJson<DateTime>(json['updatedAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'remoteId': serializer.toJson<String?>(remoteId),
      'name': serializer.toJson<String>(name),
      'level': serializer.toJson<String?>(level),
      'updatedAt': serializer.toJson<DateTime>(updatedAt),
    };
  }

  SchoolClass copyWith(
          {String? id,
          Value<String?> remoteId = const Value.absent(),
          String? name,
          Value<String?> level = const Value.absent(),
          DateTime? updatedAt}) =>
      SchoolClass(
        id: id ?? this.id,
        remoteId: remoteId.present ? remoteId.value : this.remoteId,
        name: name ?? this.name,
        level: level.present ? level.value : this.level,
        updatedAt: updatedAt ?? this.updatedAt,
      );
  SchoolClass copyWithCompanion(SchoolClassesCompanion data) {
    return SchoolClass(
      id: data.id.present ? data.id.value : this.id,
      remoteId: data.remoteId.present ? data.remoteId.value : this.remoteId,
      name: data.name.present ? data.name.value : this.name,
      level: data.level.present ? data.level.value : this.level,
      updatedAt: data.updatedAt.present ? data.updatedAt.value : this.updatedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SchoolClass(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('name: $name, ')
          ..write('level: $level, ')
          ..write('updatedAt: $updatedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, remoteId, name, level, updatedAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SchoolClass &&
          other.id == this.id &&
          other.remoteId == this.remoteId &&
          other.name == this.name &&
          other.level == this.level &&
          other.updatedAt == this.updatedAt);
}

class SchoolClassesCompanion extends UpdateCompanion<SchoolClass> {
  final Value<String> id;
  final Value<String?> remoteId;
  final Value<String> name;
  final Value<String?> level;
  final Value<DateTime> updatedAt;
  final Value<int> rowid;
  const SchoolClassesCompanion({
    this.id = const Value.absent(),
    this.remoteId = const Value.absent(),
    this.name = const Value.absent(),
    this.level = const Value.absent(),
    this.updatedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SchoolClassesCompanion.insert({
    required String id,
    this.remoteId = const Value.absent(),
    required String name,
    this.level = const Value.absent(),
    required DateTime updatedAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        name = Value(name),
        updatedAt = Value(updatedAt);
  static Insertable<SchoolClass> custom({
    Expression<String>? id,
    Expression<String>? remoteId,
    Expression<String>? name,
    Expression<String>? level,
    Expression<DateTime>? updatedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (remoteId != null) 'remote_id': remoteId,
      if (name != null) 'name': name,
      if (level != null) 'level': level,
      if (updatedAt != null) 'updated_at': updatedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SchoolClassesCompanion copyWith(
      {Value<String>? id,
      Value<String?>? remoteId,
      Value<String>? name,
      Value<String?>? level,
      Value<DateTime>? updatedAt,
      Value<int>? rowid}) {
    return SchoolClassesCompanion(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      name: name ?? this.name,
      level: level ?? this.level,
      updatedAt: updatedAt ?? this.updatedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (remoteId.present) {
      map['remote_id'] = Variable<String>(remoteId.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (level.present) {
      map['level'] = Variable<String>(level.value);
    }
    if (updatedAt.present) {
      map['updated_at'] = Variable<DateTime>(updatedAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SchoolClassesCompanion(')
          ..write('id: $id, ')
          ..write('remoteId: $remoteId, ')
          ..write('name: $name, ')
          ..write('level: $level, ')
          ..write('updatedAt: $updatedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $AttendanceRecordsTable extends AttendanceRecords
    with TableInfo<$AttendanceRecordsTable, AttendanceRecord> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $AttendanceRecordsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _studentIdMeta =
      const VerificationMeta('studentId');
  @override
  late final GeneratedColumn<String> studentId = GeneratedColumn<String>(
      'student_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _personTypeMeta =
      const VerificationMeta('personType');
  @override
  late final GeneratedColumn<String> personType = GeneratedColumn<String>(
      'person_type', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('student'));
  static const VerificationMeta _studentUuidMeta =
      const VerificationMeta('studentUuid');
  @override
  late final GeneratedColumn<String> studentUuid = GeneratedColumn<String>(
      'student_uuid', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _studentCodeMeta =
      const VerificationMeta('studentCode');
  @override
  late final GeneratedColumn<String> studentCode = GeneratedColumn<String>(
      'student_code', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _classIdMeta =
      const VerificationMeta('classId');
  @override
  late final GeneratedColumn<String> classId = GeneratedColumn<String>(
      'class_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _classNameMeta =
      const VerificationMeta('className');
  @override
  late final GeneratedColumn<String> className = GeneratedColumn<String>(
      'class_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant(''));
  static const VerificationMeta _scannedAtUtcMeta =
      const VerificationMeta('scannedAtUtc');
  @override
  late final GeneratedColumn<DateTime> scannedAtUtc = GeneratedColumn<DateTime>(
      'scanned_at_utc', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _localDateMeta =
      const VerificationMeta('localDate');
  @override
  late final GeneratedColumn<String> localDate = GeneratedColumn<String>(
      'local_date', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _localMinutesMeta =
      const VerificationMeta('localMinutes');
  @override
  late final GeneratedColumn<int> localMinutes = GeneratedColumn<int>(
      'local_minutes', aliasedName, false,
      type: DriftSqlType.int, requiredDuringInsert: true);
  static const VerificationMeta _sessionMeta =
      const VerificationMeta('session');
  @override
  late final GeneratedColumn<String> session = GeneratedColumn<String>(
      'session', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('morning'));
  static const VerificationMeta _attendanceStatusMeta =
      const VerificationMeta('attendanceStatus');
  @override
  late final GeneratedColumn<String> attendanceStatus = GeneratedColumn<String>(
      'attendance_status', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _terminalIdMeta =
      const VerificationMeta('terminalId');
  @override
  late final GeneratedColumn<String> terminalId = GeneratedColumn<String>(
      'terminal_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _sourceMeta = const VerificationMeta('source');
  @override
  late final GeneratedColumn<String> source = GeneratedColumn<String>(
      'source', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('qr'));
  static const VerificationMeta _syncStatusMeta =
      const VerificationMeta('syncStatus');
  @override
  late final GeneratedColumn<String> syncStatus = GeneratedColumn<String>(
      'sync_status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('pending'));
  static const VerificationMeta _syncedAtMeta =
      const VerificationMeta('syncedAt');
  @override
  late final GeneratedColumn<DateTime> syncedAt = GeneratedColumn<DateTime>(
      'synced_at', aliasedName, true,
      type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _serverRecordIdMeta =
      const VerificationMeta('serverRecordId');
  @override
  late final GeneratedColumn<String> serverRecordId = GeneratedColumn<String>(
      'server_record_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _lastSyncErrorMeta =
      const VerificationMeta('lastSyncError');
  @override
  late final GeneratedColumn<String> lastSyncError = GeneratedColumn<String>(
      'last_sync_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        studentId,
        personType,
        studentUuid,
        studentCode,
        classId,
        className,
        scannedAtUtc,
        localDate,
        localMinutes,
        session,
        attendanceStatus,
        terminalId,
        source,
        syncStatus,
        syncedAt,
        serverRecordId,
        retryCount,
        lastSyncError,
        createdAt
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'attendance_records';
  @override
  VerificationContext validateIntegrity(Insertable<AttendanceRecord> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('student_id')) {
      context.handle(_studentIdMeta,
          studentId.isAcceptableOrUnknown(data['student_id']!, _studentIdMeta));
    } else if (isInserting) {
      context.missing(_studentIdMeta);
    }
    if (data.containsKey('person_type')) {
      context.handle(
          _personTypeMeta,
          personType.isAcceptableOrUnknown(
              data['person_type']!, _personTypeMeta));
    }
    if (data.containsKey('student_uuid')) {
      context.handle(
          _studentUuidMeta,
          studentUuid.isAcceptableOrUnknown(
              data['student_uuid']!, _studentUuidMeta));
    }
    if (data.containsKey('student_code')) {
      context.handle(
          _studentCodeMeta,
          studentCode.isAcceptableOrUnknown(
              data['student_code']!, _studentCodeMeta));
    } else if (isInserting) {
      context.missing(_studentCodeMeta);
    }
    if (data.containsKey('class_id')) {
      context.handle(_classIdMeta,
          classId.isAcceptableOrUnknown(data['class_id']!, _classIdMeta));
    }
    if (data.containsKey('class_name')) {
      context.handle(_classNameMeta,
          className.isAcceptableOrUnknown(data['class_name']!, _classNameMeta));
    }
    if (data.containsKey('scanned_at_utc')) {
      context.handle(
          _scannedAtUtcMeta,
          scannedAtUtc.isAcceptableOrUnknown(
              data['scanned_at_utc']!, _scannedAtUtcMeta));
    } else if (isInserting) {
      context.missing(_scannedAtUtcMeta);
    }
    if (data.containsKey('local_date')) {
      context.handle(_localDateMeta,
          localDate.isAcceptableOrUnknown(data['local_date']!, _localDateMeta));
    } else if (isInserting) {
      context.missing(_localDateMeta);
    }
    if (data.containsKey('local_minutes')) {
      context.handle(
          _localMinutesMeta,
          localMinutes.isAcceptableOrUnknown(
              data['local_minutes']!, _localMinutesMeta));
    } else if (isInserting) {
      context.missing(_localMinutesMeta);
    }
    if (data.containsKey('session')) {
      context.handle(_sessionMeta,
          session.isAcceptableOrUnknown(data['session']!, _sessionMeta));
    }
    if (data.containsKey('attendance_status')) {
      context.handle(
          _attendanceStatusMeta,
          attendanceStatus.isAcceptableOrUnknown(
              data['attendance_status']!, _attendanceStatusMeta));
    } else if (isInserting) {
      context.missing(_attendanceStatusMeta);
    }
    if (data.containsKey('terminal_id')) {
      context.handle(
          _terminalIdMeta,
          terminalId.isAcceptableOrUnknown(
              data['terminal_id']!, _terminalIdMeta));
    } else if (isInserting) {
      context.missing(_terminalIdMeta);
    }
    if (data.containsKey('source')) {
      context.handle(_sourceMeta,
          source.isAcceptableOrUnknown(data['source']!, _sourceMeta));
    }
    if (data.containsKey('sync_status')) {
      context.handle(
          _syncStatusMeta,
          syncStatus.isAcceptableOrUnknown(
              data['sync_status']!, _syncStatusMeta));
    }
    if (data.containsKey('synced_at')) {
      context.handle(_syncedAtMeta,
          syncedAt.isAcceptableOrUnknown(data['synced_at']!, _syncedAtMeta));
    }
    if (data.containsKey('server_record_id')) {
      context.handle(
          _serverRecordIdMeta,
          serverRecordId.isAcceptableOrUnknown(
              data['server_record_id']!, _serverRecordIdMeta));
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    if (data.containsKey('last_sync_error')) {
      context.handle(
          _lastSyncErrorMeta,
          lastSyncError.isAcceptableOrUnknown(
              data['last_sync_error']!, _lastSyncErrorMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  AttendanceRecord map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return AttendanceRecord(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      studentId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_id'])!,
      personType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}person_type'])!,
      studentUuid: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_uuid']),
      studentCode: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}student_code'])!,
      classId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}class_id']),
      className: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}class_name'])!,
      scannedAtUtc: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}scanned_at_utc'])!,
      localDate: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}local_date'])!,
      localMinutes: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}local_minutes'])!,
      session: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}session'])!,
      attendanceStatus: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}attendance_status'])!,
      terminalId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}terminal_id'])!,
      source: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}source'])!,
      syncStatus: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}sync_status'])!,
      syncedAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}synced_at']),
      serverRecordId: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}server_record_id']),
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
      lastSyncError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_sync_error']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $AttendanceRecordsTable createAlias(String alias) {
    return $AttendanceRecordsTable(attachedDatabase, alias);
  }
}

class AttendanceRecord extends DataClass
    implements Insertable<AttendanceRecord> {
  /// UUID de l'événement (idempotence côté serveur lors de la synchro).
  final String id;
  final String studentId;

  /// `student` ou `staff` : distingue un élève d'un membre du personnel.
  /// Pour le personnel, `studentId` contient le `users.id` correspondant.
  final String personType;
  final String? studentUuid;
  final String studentCode;
  final String? classId;
  final String className;

  /// Horodatage UTC (référence serveur).
  final DateTime scannedAtUtc;

  /// Journée locale `yyyy-MM-dd` (référence établissement).
  final String localDate;

  /// Minutes depuis minuit (tri/statistiques rapides).
  final int localMinutes;

  /// Session de présence (`morning` en v1, extensible).
  final String session;

  /// `present` ou `late`.
  final String attendanceStatus;
  final String terminalId;
  final String source;

  /// `pending` | `syncing` | `synced` | `failed`.
  final String syncStatus;
  final DateTime? syncedAt;
  final String? serverRecordId;
  final int retryCount;
  final String? lastSyncError;
  final DateTime createdAt;
  const AttendanceRecord(
      {required this.id,
      required this.studentId,
      required this.personType,
      this.studentUuid,
      required this.studentCode,
      this.classId,
      required this.className,
      required this.scannedAtUtc,
      required this.localDate,
      required this.localMinutes,
      required this.session,
      required this.attendanceStatus,
      required this.terminalId,
      required this.source,
      required this.syncStatus,
      this.syncedAt,
      this.serverRecordId,
      required this.retryCount,
      this.lastSyncError,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['student_id'] = Variable<String>(studentId);
    map['person_type'] = Variable<String>(personType);
    if (!nullToAbsent || studentUuid != null) {
      map['student_uuid'] = Variable<String>(studentUuid);
    }
    map['student_code'] = Variable<String>(studentCode);
    if (!nullToAbsent || classId != null) {
      map['class_id'] = Variable<String>(classId);
    }
    map['class_name'] = Variable<String>(className);
    map['scanned_at_utc'] = Variable<DateTime>(scannedAtUtc);
    map['local_date'] = Variable<String>(localDate);
    map['local_minutes'] = Variable<int>(localMinutes);
    map['session'] = Variable<String>(session);
    map['attendance_status'] = Variable<String>(attendanceStatus);
    map['terminal_id'] = Variable<String>(terminalId);
    map['source'] = Variable<String>(source);
    map['sync_status'] = Variable<String>(syncStatus);
    if (!nullToAbsent || syncedAt != null) {
      map['synced_at'] = Variable<DateTime>(syncedAt);
    }
    if (!nullToAbsent || serverRecordId != null) {
      map['server_record_id'] = Variable<String>(serverRecordId);
    }
    map['retry_count'] = Variable<int>(retryCount);
    if (!nullToAbsent || lastSyncError != null) {
      map['last_sync_error'] = Variable<String>(lastSyncError);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  AttendanceRecordsCompanion toCompanion(bool nullToAbsent) {
    return AttendanceRecordsCompanion(
      id: Value(id),
      studentId: Value(studentId),
      personType: Value(personType),
      studentUuid: studentUuid == null && nullToAbsent
          ? const Value.absent()
          : Value(studentUuid),
      studentCode: Value(studentCode),
      classId: classId == null && nullToAbsent
          ? const Value.absent()
          : Value(classId),
      className: Value(className),
      scannedAtUtc: Value(scannedAtUtc),
      localDate: Value(localDate),
      localMinutes: Value(localMinutes),
      session: Value(session),
      attendanceStatus: Value(attendanceStatus),
      terminalId: Value(terminalId),
      source: Value(source),
      syncStatus: Value(syncStatus),
      syncedAt: syncedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(syncedAt),
      serverRecordId: serverRecordId == null && nullToAbsent
          ? const Value.absent()
          : Value(serverRecordId),
      retryCount: Value(retryCount),
      lastSyncError: lastSyncError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncError),
      createdAt: Value(createdAt),
    );
  }

  factory AttendanceRecord.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return AttendanceRecord(
      id: serializer.fromJson<String>(json['id']),
      studentId: serializer.fromJson<String>(json['studentId']),
      personType: serializer.fromJson<String>(json['personType']),
      studentUuid: serializer.fromJson<String?>(json['studentUuid']),
      studentCode: serializer.fromJson<String>(json['studentCode']),
      classId: serializer.fromJson<String?>(json['classId']),
      className: serializer.fromJson<String>(json['className']),
      scannedAtUtc: serializer.fromJson<DateTime>(json['scannedAtUtc']),
      localDate: serializer.fromJson<String>(json['localDate']),
      localMinutes: serializer.fromJson<int>(json['localMinutes']),
      session: serializer.fromJson<String>(json['session']),
      attendanceStatus: serializer.fromJson<String>(json['attendanceStatus']),
      terminalId: serializer.fromJson<String>(json['terminalId']),
      source: serializer.fromJson<String>(json['source']),
      syncStatus: serializer.fromJson<String>(json['syncStatus']),
      syncedAt: serializer.fromJson<DateTime?>(json['syncedAt']),
      serverRecordId: serializer.fromJson<String?>(json['serverRecordId']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      lastSyncError: serializer.fromJson<String?>(json['lastSyncError']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'studentId': serializer.toJson<String>(studentId),
      'personType': serializer.toJson<String>(personType),
      'studentUuid': serializer.toJson<String?>(studentUuid),
      'studentCode': serializer.toJson<String>(studentCode),
      'classId': serializer.toJson<String?>(classId),
      'className': serializer.toJson<String>(className),
      'scannedAtUtc': serializer.toJson<DateTime>(scannedAtUtc),
      'localDate': serializer.toJson<String>(localDate),
      'localMinutes': serializer.toJson<int>(localMinutes),
      'session': serializer.toJson<String>(session),
      'attendanceStatus': serializer.toJson<String>(attendanceStatus),
      'terminalId': serializer.toJson<String>(terminalId),
      'source': serializer.toJson<String>(source),
      'syncStatus': serializer.toJson<String>(syncStatus),
      'syncedAt': serializer.toJson<DateTime?>(syncedAt),
      'serverRecordId': serializer.toJson<String?>(serverRecordId),
      'retryCount': serializer.toJson<int>(retryCount),
      'lastSyncError': serializer.toJson<String?>(lastSyncError),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  AttendanceRecord copyWith(
          {String? id,
          String? studentId,
          String? personType,
          Value<String?> studentUuid = const Value.absent(),
          String? studentCode,
          Value<String?> classId = const Value.absent(),
          String? className,
          DateTime? scannedAtUtc,
          String? localDate,
          int? localMinutes,
          String? session,
          String? attendanceStatus,
          String? terminalId,
          String? source,
          String? syncStatus,
          Value<DateTime?> syncedAt = const Value.absent(),
          Value<String?> serverRecordId = const Value.absent(),
          int? retryCount,
          Value<String?> lastSyncError = const Value.absent(),
          DateTime? createdAt}) =>
      AttendanceRecord(
        id: id ?? this.id,
        studentId: studentId ?? this.studentId,
        personType: personType ?? this.personType,
        studentUuid: studentUuid.present ? studentUuid.value : this.studentUuid,
        studentCode: studentCode ?? this.studentCode,
        classId: classId.present ? classId.value : this.classId,
        className: className ?? this.className,
        scannedAtUtc: scannedAtUtc ?? this.scannedAtUtc,
        localDate: localDate ?? this.localDate,
        localMinutes: localMinutes ?? this.localMinutes,
        session: session ?? this.session,
        attendanceStatus: attendanceStatus ?? this.attendanceStatus,
        terminalId: terminalId ?? this.terminalId,
        source: source ?? this.source,
        syncStatus: syncStatus ?? this.syncStatus,
        syncedAt: syncedAt.present ? syncedAt.value : this.syncedAt,
        serverRecordId:
            serverRecordId.present ? serverRecordId.value : this.serverRecordId,
        retryCount: retryCount ?? this.retryCount,
        lastSyncError:
            lastSyncError.present ? lastSyncError.value : this.lastSyncError,
        createdAt: createdAt ?? this.createdAt,
      );
  AttendanceRecord copyWithCompanion(AttendanceRecordsCompanion data) {
    return AttendanceRecord(
      id: data.id.present ? data.id.value : this.id,
      studentId: data.studentId.present ? data.studentId.value : this.studentId,
      personType:
          data.personType.present ? data.personType.value : this.personType,
      studentUuid:
          data.studentUuid.present ? data.studentUuid.value : this.studentUuid,
      studentCode:
          data.studentCode.present ? data.studentCode.value : this.studentCode,
      classId: data.classId.present ? data.classId.value : this.classId,
      className: data.className.present ? data.className.value : this.className,
      scannedAtUtc: data.scannedAtUtc.present
          ? data.scannedAtUtc.value
          : this.scannedAtUtc,
      localDate: data.localDate.present ? data.localDate.value : this.localDate,
      localMinutes: data.localMinutes.present
          ? data.localMinutes.value
          : this.localMinutes,
      session: data.session.present ? data.session.value : this.session,
      attendanceStatus: data.attendanceStatus.present
          ? data.attendanceStatus.value
          : this.attendanceStatus,
      terminalId:
          data.terminalId.present ? data.terminalId.value : this.terminalId,
      source: data.source.present ? data.source.value : this.source,
      syncStatus:
          data.syncStatus.present ? data.syncStatus.value : this.syncStatus,
      syncedAt: data.syncedAt.present ? data.syncedAt.value : this.syncedAt,
      serverRecordId: data.serverRecordId.present
          ? data.serverRecordId.value
          : this.serverRecordId,
      retryCount:
          data.retryCount.present ? data.retryCount.value : this.retryCount,
      lastSyncError: data.lastSyncError.present
          ? data.lastSyncError.value
          : this.lastSyncError,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('AttendanceRecord(')
          ..write('id: $id, ')
          ..write('studentId: $studentId, ')
          ..write('personType: $personType, ')
          ..write('studentUuid: $studentUuid, ')
          ..write('studentCode: $studentCode, ')
          ..write('classId: $classId, ')
          ..write('className: $className, ')
          ..write('scannedAtUtc: $scannedAtUtc, ')
          ..write('localDate: $localDate, ')
          ..write('localMinutes: $localMinutes, ')
          ..write('session: $session, ')
          ..write('attendanceStatus: $attendanceStatus, ')
          ..write('terminalId: $terminalId, ')
          ..write('source: $source, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncedAt: $syncedAt, ')
          ..write('serverRecordId: $serverRecordId, ')
          ..write('retryCount: $retryCount, ')
          ..write('lastSyncError: $lastSyncError, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
      id,
      studentId,
      personType,
      studentUuid,
      studentCode,
      classId,
      className,
      scannedAtUtc,
      localDate,
      localMinutes,
      session,
      attendanceStatus,
      terminalId,
      source,
      syncStatus,
      syncedAt,
      serverRecordId,
      retryCount,
      lastSyncError,
      createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is AttendanceRecord &&
          other.id == this.id &&
          other.studentId == this.studentId &&
          other.personType == this.personType &&
          other.studentUuid == this.studentUuid &&
          other.studentCode == this.studentCode &&
          other.classId == this.classId &&
          other.className == this.className &&
          other.scannedAtUtc == this.scannedAtUtc &&
          other.localDate == this.localDate &&
          other.localMinutes == this.localMinutes &&
          other.session == this.session &&
          other.attendanceStatus == this.attendanceStatus &&
          other.terminalId == this.terminalId &&
          other.source == this.source &&
          other.syncStatus == this.syncStatus &&
          other.syncedAt == this.syncedAt &&
          other.serverRecordId == this.serverRecordId &&
          other.retryCount == this.retryCount &&
          other.lastSyncError == this.lastSyncError &&
          other.createdAt == this.createdAt);
}

class AttendanceRecordsCompanion extends UpdateCompanion<AttendanceRecord> {
  final Value<String> id;
  final Value<String> studentId;
  final Value<String> personType;
  final Value<String?> studentUuid;
  final Value<String> studentCode;
  final Value<String?> classId;
  final Value<String> className;
  final Value<DateTime> scannedAtUtc;
  final Value<String> localDate;
  final Value<int> localMinutes;
  final Value<String> session;
  final Value<String> attendanceStatus;
  final Value<String> terminalId;
  final Value<String> source;
  final Value<String> syncStatus;
  final Value<DateTime?> syncedAt;
  final Value<String?> serverRecordId;
  final Value<int> retryCount;
  final Value<String?> lastSyncError;
  final Value<DateTime> createdAt;
  final Value<int> rowid;
  const AttendanceRecordsCompanion({
    this.id = const Value.absent(),
    this.studentId = const Value.absent(),
    this.personType = const Value.absent(),
    this.studentUuid = const Value.absent(),
    this.studentCode = const Value.absent(),
    this.classId = const Value.absent(),
    this.className = const Value.absent(),
    this.scannedAtUtc = const Value.absent(),
    this.localDate = const Value.absent(),
    this.localMinutes = const Value.absent(),
    this.session = const Value.absent(),
    this.attendanceStatus = const Value.absent(),
    this.terminalId = const Value.absent(),
    this.source = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.syncedAt = const Value.absent(),
    this.serverRecordId = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.lastSyncError = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  AttendanceRecordsCompanion.insert({
    required String id,
    required String studentId,
    this.personType = const Value.absent(),
    this.studentUuid = const Value.absent(),
    required String studentCode,
    this.classId = const Value.absent(),
    this.className = const Value.absent(),
    required DateTime scannedAtUtc,
    required String localDate,
    required int localMinutes,
    this.session = const Value.absent(),
    required String attendanceStatus,
    required String terminalId,
    this.source = const Value.absent(),
    this.syncStatus = const Value.absent(),
    this.syncedAt = const Value.absent(),
    this.serverRecordId = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.lastSyncError = const Value.absent(),
    required DateTime createdAt,
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        studentId = Value(studentId),
        studentCode = Value(studentCode),
        scannedAtUtc = Value(scannedAtUtc),
        localDate = Value(localDate),
        localMinutes = Value(localMinutes),
        attendanceStatus = Value(attendanceStatus),
        terminalId = Value(terminalId),
        createdAt = Value(createdAt);
  static Insertable<AttendanceRecord> custom({
    Expression<String>? id,
    Expression<String>? studentId,
    Expression<String>? personType,
    Expression<String>? studentUuid,
    Expression<String>? studentCode,
    Expression<String>? classId,
    Expression<String>? className,
    Expression<DateTime>? scannedAtUtc,
    Expression<String>? localDate,
    Expression<int>? localMinutes,
    Expression<String>? session,
    Expression<String>? attendanceStatus,
    Expression<String>? terminalId,
    Expression<String>? source,
    Expression<String>? syncStatus,
    Expression<DateTime>? syncedAt,
    Expression<String>? serverRecordId,
    Expression<int>? retryCount,
    Expression<String>? lastSyncError,
    Expression<DateTime>? createdAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (studentId != null) 'student_id': studentId,
      if (personType != null) 'person_type': personType,
      if (studentUuid != null) 'student_uuid': studentUuid,
      if (studentCode != null) 'student_code': studentCode,
      if (classId != null) 'class_id': classId,
      if (className != null) 'class_name': className,
      if (scannedAtUtc != null) 'scanned_at_utc': scannedAtUtc,
      if (localDate != null) 'local_date': localDate,
      if (localMinutes != null) 'local_minutes': localMinutes,
      if (session != null) 'session': session,
      if (attendanceStatus != null) 'attendance_status': attendanceStatus,
      if (terminalId != null) 'terminal_id': terminalId,
      if (source != null) 'source': source,
      if (syncStatus != null) 'sync_status': syncStatus,
      if (syncedAt != null) 'synced_at': syncedAt,
      if (serverRecordId != null) 'server_record_id': serverRecordId,
      if (retryCount != null) 'retry_count': retryCount,
      if (lastSyncError != null) 'last_sync_error': lastSyncError,
      if (createdAt != null) 'created_at': createdAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  AttendanceRecordsCompanion copyWith(
      {Value<String>? id,
      Value<String>? studentId,
      Value<String>? personType,
      Value<String?>? studentUuid,
      Value<String>? studentCode,
      Value<String?>? classId,
      Value<String>? className,
      Value<DateTime>? scannedAtUtc,
      Value<String>? localDate,
      Value<int>? localMinutes,
      Value<String>? session,
      Value<String>? attendanceStatus,
      Value<String>? terminalId,
      Value<String>? source,
      Value<String>? syncStatus,
      Value<DateTime?>? syncedAt,
      Value<String?>? serverRecordId,
      Value<int>? retryCount,
      Value<String?>? lastSyncError,
      Value<DateTime>? createdAt,
      Value<int>? rowid}) {
    return AttendanceRecordsCompanion(
      id: id ?? this.id,
      studentId: studentId ?? this.studentId,
      personType: personType ?? this.personType,
      studentUuid: studentUuid ?? this.studentUuid,
      studentCode: studentCode ?? this.studentCode,
      classId: classId ?? this.classId,
      className: className ?? this.className,
      scannedAtUtc: scannedAtUtc ?? this.scannedAtUtc,
      localDate: localDate ?? this.localDate,
      localMinutes: localMinutes ?? this.localMinutes,
      session: session ?? this.session,
      attendanceStatus: attendanceStatus ?? this.attendanceStatus,
      terminalId: terminalId ?? this.terminalId,
      source: source ?? this.source,
      syncStatus: syncStatus ?? this.syncStatus,
      syncedAt: syncedAt ?? this.syncedAt,
      serverRecordId: serverRecordId ?? this.serverRecordId,
      retryCount: retryCount ?? this.retryCount,
      lastSyncError: lastSyncError ?? this.lastSyncError,
      createdAt: createdAt ?? this.createdAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (studentId.present) {
      map['student_id'] = Variable<String>(studentId.value);
    }
    if (personType.present) {
      map['person_type'] = Variable<String>(personType.value);
    }
    if (studentUuid.present) {
      map['student_uuid'] = Variable<String>(studentUuid.value);
    }
    if (studentCode.present) {
      map['student_code'] = Variable<String>(studentCode.value);
    }
    if (classId.present) {
      map['class_id'] = Variable<String>(classId.value);
    }
    if (className.present) {
      map['class_name'] = Variable<String>(className.value);
    }
    if (scannedAtUtc.present) {
      map['scanned_at_utc'] = Variable<DateTime>(scannedAtUtc.value);
    }
    if (localDate.present) {
      map['local_date'] = Variable<String>(localDate.value);
    }
    if (localMinutes.present) {
      map['local_minutes'] = Variable<int>(localMinutes.value);
    }
    if (session.present) {
      map['session'] = Variable<String>(session.value);
    }
    if (attendanceStatus.present) {
      map['attendance_status'] = Variable<String>(attendanceStatus.value);
    }
    if (terminalId.present) {
      map['terminal_id'] = Variable<String>(terminalId.value);
    }
    if (source.present) {
      map['source'] = Variable<String>(source.value);
    }
    if (syncStatus.present) {
      map['sync_status'] = Variable<String>(syncStatus.value);
    }
    if (syncedAt.present) {
      map['synced_at'] = Variable<DateTime>(syncedAt.value);
    }
    if (serverRecordId.present) {
      map['server_record_id'] = Variable<String>(serverRecordId.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (lastSyncError.present) {
      map['last_sync_error'] = Variable<String>(lastSyncError.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('AttendanceRecordsCompanion(')
          ..write('id: $id, ')
          ..write('studentId: $studentId, ')
          ..write('personType: $personType, ')
          ..write('studentUuid: $studentUuid, ')
          ..write('studentCode: $studentCode, ')
          ..write('classId: $classId, ')
          ..write('className: $className, ')
          ..write('scannedAtUtc: $scannedAtUtc, ')
          ..write('localDate: $localDate, ')
          ..write('localMinutes: $localMinutes, ')
          ..write('session: $session, ')
          ..write('attendanceStatus: $attendanceStatus, ')
          ..write('terminalId: $terminalId, ')
          ..write('source: $source, ')
          ..write('syncStatus: $syncStatus, ')
          ..write('syncedAt: $syncedAt, ')
          ..write('serverRecordId: $serverRecordId, ')
          ..write('retryCount: $retryCount, ')
          ..write('lastSyncError: $lastSyncError, ')
          ..write('createdAt: $createdAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $SettingsTable extends Settings
    with TableInfo<$SettingsTable, TerminalSettings> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SettingsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(1));
  static const VerificationMeta _terminalIdMeta =
      const VerificationMeta('terminalId');
  @override
  late final GeneratedColumn<String> terminalId = GeneratedColumn<String>(
      'terminal_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _terminalDisplayNameMeta =
      const VerificationMeta('terminalDisplayName');
  @override
  late final GeneratedColumn<String> terminalDisplayName =
      GeneratedColumn<String>('terminal_display_name', aliasedName, false,
          type: DriftSqlType.string,
          requiredDuringInsert: false,
          defaultValue: const Constant('Terminal principal'));
  static const VerificationMeta _schoolIdMeta =
      const VerificationMeta('schoolId');
  @override
  late final GeneratedColumn<String> schoolId = GeneratedColumn<String>(
      'school_id', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _schoolNameMeta =
      const VerificationMeta('schoolName');
  @override
  late final GeneratedColumn<String> schoolName = GeneratedColumn<String>(
      'school_name', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('AL-BAYAAN'));
  static const VerificationMeta _schoolLogoLocalPathMeta =
      const VerificationMeta('schoolLogoLocalPath');
  @override
  late final GeneratedColumn<String> schoolLogoLocalPath =
      GeneratedColumn<String>('school_logo_local_path', aliasedName, true,
          type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _timezoneMeta =
      const VerificationMeta('timezone');
  @override
  late final GeneratedColumn<String> timezone = GeneratedColumn<String>(
      'timezone', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Africa/Lome'));
  static const VerificationMeta _attendanceStartTimeMeta =
      const VerificationMeta('attendanceStartTime');
  @override
  late final GeneratedColumn<String> attendanceStartTime =
      GeneratedColumn<String>('attendance_start_time', aliasedName, false,
          type: DriftSqlType.string,
          requiredDuringInsert: false,
          defaultValue: const Constant('07:00'));
  static const VerificationMeta _lateAfterTimeMeta =
      const VerificationMeta('lateAfterTime');
  @override
  late final GeneratedColumn<String> lateAfterTime = GeneratedColumn<String>(
      'late_after_time', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('07:30'));
  static const VerificationMeta _autoResetMillisMeta =
      const VerificationMeta('autoResetMillis');
  @override
  late final GeneratedColumn<int> autoResetMillis = GeneratedColumn<int>(
      'auto_reset_millis', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(2200));
  static const VerificationMeta _soundEnabledMeta =
      const VerificationMeta('soundEnabled');
  @override
  late final GeneratedColumn<bool> soundEnabled = GeneratedColumn<bool>(
      'sound_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("sound_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _hapticsEnabledMeta =
      const VerificationMeta('hapticsEnabled');
  @override
  late final GeneratedColumn<bool> hapticsEnabled = GeneratedColumn<bool>(
      'haptics_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("haptics_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _animationsEnabledMeta =
      const VerificationMeta('animationsEnabled');
  @override
  late final GeneratedColumn<bool> animationsEnabled = GeneratedColumn<bool>(
      'animations_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("animations_enabled" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _keepScreenOnMeta =
      const VerificationMeta('keepScreenOn');
  @override
  late final GeneratedColumn<bool> keepScreenOn = GeneratedColumn<bool>(
      'keep_screen_on', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("keep_screen_on" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _cameraFacingMeta =
      const VerificationMeta('cameraFacing');
  @override
  late final GeneratedColumn<String> cameraFacing = GeneratedColumn<String>(
      'camera_facing', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('front'));
  static const VerificationMeta _showPhotoMeta =
      const VerificationMeta('showPhoto');
  @override
  late final GeneratedColumn<bool> showPhoto = GeneratedColumn<bool>(
      'show_photo', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("show_photo" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _showMatriculeMeta =
      const VerificationMeta('showMatricule');
  @override
  late final GeneratedColumn<bool> showMatricule = GeneratedColumn<bool>(
      'show_matricule', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("show_matricule" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _showClassNameMeta =
      const VerificationMeta('showClassName');
  @override
  late final GeneratedColumn<bool> showClassName = GeneratedColumn<bool>(
      'show_class_name', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("show_class_name" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _showTimeMeta =
      const VerificationMeta('showTime');
  @override
  late final GeneratedColumn<bool> showTime = GeneratedColumn<bool>(
      'show_time', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("show_time" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _offlineModeMeta =
      const VerificationMeta('offlineMode');
  @override
  late final GeneratedColumn<bool> offlineMode = GeneratedColumn<bool>(
      'offline_mode', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("offline_mode" IN (0, 1))'),
      defaultValue: const Constant(true));
  static const VerificationMeta _retentionDaysMeta =
      const VerificationMeta('retentionDays');
  @override
  late final GeneratedColumn<int> retentionDays = GeneratedColumn<int>(
      'retention_days', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(365));
  static const VerificationMeta _lastStudentSyncMeta =
      const VerificationMeta('lastStudentSync');
  @override
  late final GeneratedColumn<DateTime> lastStudentSync =
      GeneratedColumn<DateTime>('last_student_sync', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastAttendanceSyncMeta =
      const VerificationMeta('lastAttendanceSync');
  @override
  late final GeneratedColumn<DateTime> lastAttendanceSync =
      GeneratedColumn<DateTime>('last_attendance_sync', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _apiEnabledMeta =
      const VerificationMeta('apiEnabled');
  @override
  late final GeneratedColumn<bool> apiEnabled = GeneratedColumn<bool>(
      'api_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('CHECK ("api_enabled" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _apiBaseUrlMeta =
      const VerificationMeta('apiBaseUrl');
  @override
  late final GeneratedColumn<String> apiBaseUrl = GeneratedColumn<String>(
      'api_base_url', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _lastSyncAttemptMeta =
      const VerificationMeta('lastSyncAttempt');
  @override
  late final GeneratedColumn<DateTime> lastSyncAttempt =
      GeneratedColumn<DateTime>('last_sync_attempt', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastSyncErrorMeta =
      const VerificationMeta('lastSyncError');
  @override
  late final GeneratedColumn<String> lastSyncError = GeneratedColumn<String>(
      'last_sync_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _voiceEnabledMeta =
      const VerificationMeta('voiceEnabled');
  @override
  late final GeneratedColumn<bool> voiceEnabled = GeneratedColumn<bool>(
      'voice_enabled', aliasedName, false,
      type: DriftSqlType.bool,
      requiredDuringInsert: false,
      defaultConstraints: GeneratedColumn.constraintIsAlways(
          'CHECK ("voice_enabled" IN (0, 1))'),
      defaultValue: const Constant(false));
  static const VerificationMeta _voiceSuccessMeta =
      const VerificationMeta('voiceSuccess');
  @override
  late final GeneratedColumn<String> voiceSuccess = GeneratedColumn<String>(
      'voice_success', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Présence enregistrée'));
  static const VerificationMeta _voiceLateMeta =
      const VerificationMeta('voiceLate');
  @override
  late final GeneratedColumn<String> voiceLate = GeneratedColumn<String>(
      'voice_late', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('En retard'));
  static const VerificationMeta _voiceDuplicateMeta =
      const VerificationMeta('voiceDuplicate');
  @override
  late final GeneratedColumn<String> voiceDuplicate = GeneratedColumn<String>(
      'voice_duplicate', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Déjà enregistré'));
  static const VerificationMeta _voiceRefusedMeta =
      const VerificationMeta('voiceRefused');
  @override
  late final GeneratedColumn<String> voiceRefused = GeneratedColumn<String>(
      'voice_refused', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('Accès refusé'));
  static const VerificationMeta _adminPinSaltMeta =
      const VerificationMeta('adminPinSalt');
  @override
  late final GeneratedColumn<String> adminPinSalt = GeneratedColumn<String>(
      'admin_pin_salt', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _adminPinHashMeta =
      const VerificationMeta('adminPinHash');
  @override
  late final GeneratedColumn<String> adminPinHash = GeneratedColumn<String>(
      'admin_pin_hash', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _adminPinIterationsMeta =
      const VerificationMeta('adminPinIterations');
  @override
  late final GeneratedColumn<int> adminPinIterations = GeneratedColumn<int>(
      'admin_pin_iterations', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  @override
  List<GeneratedColumn> get $columns => [
        id,
        terminalId,
        terminalDisplayName,
        schoolId,
        schoolName,
        schoolLogoLocalPath,
        timezone,
        attendanceStartTime,
        lateAfterTime,
        autoResetMillis,
        soundEnabled,
        hapticsEnabled,
        animationsEnabled,
        keepScreenOn,
        cameraFacing,
        showPhoto,
        showMatricule,
        showClassName,
        showTime,
        offlineMode,
        retentionDays,
        lastStudentSync,
        lastAttendanceSync,
        apiEnabled,
        apiBaseUrl,
        lastSyncAttempt,
        lastSyncError,
        voiceEnabled,
        voiceSuccess,
        voiceLate,
        voiceDuplicate,
        voiceRefused,
        adminPinSalt,
        adminPinHash,
        adminPinIterations
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'settings';
  @override
  VerificationContext validateIntegrity(Insertable<TerminalSettings> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('terminal_id')) {
      context.handle(
          _terminalIdMeta,
          terminalId.isAcceptableOrUnknown(
              data['terminal_id']!, _terminalIdMeta));
    } else if (isInserting) {
      context.missing(_terminalIdMeta);
    }
    if (data.containsKey('terminal_display_name')) {
      context.handle(
          _terminalDisplayNameMeta,
          terminalDisplayName.isAcceptableOrUnknown(
              data['terminal_display_name']!, _terminalDisplayNameMeta));
    }
    if (data.containsKey('school_id')) {
      context.handle(_schoolIdMeta,
          schoolId.isAcceptableOrUnknown(data['school_id']!, _schoolIdMeta));
    }
    if (data.containsKey('school_name')) {
      context.handle(
          _schoolNameMeta,
          schoolName.isAcceptableOrUnknown(
              data['school_name']!, _schoolNameMeta));
    }
    if (data.containsKey('school_logo_local_path')) {
      context.handle(
          _schoolLogoLocalPathMeta,
          schoolLogoLocalPath.isAcceptableOrUnknown(
              data['school_logo_local_path']!, _schoolLogoLocalPathMeta));
    }
    if (data.containsKey('timezone')) {
      context.handle(_timezoneMeta,
          timezone.isAcceptableOrUnknown(data['timezone']!, _timezoneMeta));
    }
    if (data.containsKey('attendance_start_time')) {
      context.handle(
          _attendanceStartTimeMeta,
          attendanceStartTime.isAcceptableOrUnknown(
              data['attendance_start_time']!, _attendanceStartTimeMeta));
    }
    if (data.containsKey('late_after_time')) {
      context.handle(
          _lateAfterTimeMeta,
          lateAfterTime.isAcceptableOrUnknown(
              data['late_after_time']!, _lateAfterTimeMeta));
    }
    if (data.containsKey('auto_reset_millis')) {
      context.handle(
          _autoResetMillisMeta,
          autoResetMillis.isAcceptableOrUnknown(
              data['auto_reset_millis']!, _autoResetMillisMeta));
    }
    if (data.containsKey('sound_enabled')) {
      context.handle(
          _soundEnabledMeta,
          soundEnabled.isAcceptableOrUnknown(
              data['sound_enabled']!, _soundEnabledMeta));
    }
    if (data.containsKey('haptics_enabled')) {
      context.handle(
          _hapticsEnabledMeta,
          hapticsEnabled.isAcceptableOrUnknown(
              data['haptics_enabled']!, _hapticsEnabledMeta));
    }
    if (data.containsKey('animations_enabled')) {
      context.handle(
          _animationsEnabledMeta,
          animationsEnabled.isAcceptableOrUnknown(
              data['animations_enabled']!, _animationsEnabledMeta));
    }
    if (data.containsKey('keep_screen_on')) {
      context.handle(
          _keepScreenOnMeta,
          keepScreenOn.isAcceptableOrUnknown(
              data['keep_screen_on']!, _keepScreenOnMeta));
    }
    if (data.containsKey('camera_facing')) {
      context.handle(
          _cameraFacingMeta,
          cameraFacing.isAcceptableOrUnknown(
              data['camera_facing']!, _cameraFacingMeta));
    }
    if (data.containsKey('show_photo')) {
      context.handle(_showPhotoMeta,
          showPhoto.isAcceptableOrUnknown(data['show_photo']!, _showPhotoMeta));
    }
    if (data.containsKey('show_matricule')) {
      context.handle(
          _showMatriculeMeta,
          showMatricule.isAcceptableOrUnknown(
              data['show_matricule']!, _showMatriculeMeta));
    }
    if (data.containsKey('show_class_name')) {
      context.handle(
          _showClassNameMeta,
          showClassName.isAcceptableOrUnknown(
              data['show_class_name']!, _showClassNameMeta));
    }
    if (data.containsKey('show_time')) {
      context.handle(_showTimeMeta,
          showTime.isAcceptableOrUnknown(data['show_time']!, _showTimeMeta));
    }
    if (data.containsKey('offline_mode')) {
      context.handle(
          _offlineModeMeta,
          offlineMode.isAcceptableOrUnknown(
              data['offline_mode']!, _offlineModeMeta));
    }
    if (data.containsKey('retention_days')) {
      context.handle(
          _retentionDaysMeta,
          retentionDays.isAcceptableOrUnknown(
              data['retention_days']!, _retentionDaysMeta));
    }
    if (data.containsKey('last_student_sync')) {
      context.handle(
          _lastStudentSyncMeta,
          lastStudentSync.isAcceptableOrUnknown(
              data['last_student_sync']!, _lastStudentSyncMeta));
    }
    if (data.containsKey('last_attendance_sync')) {
      context.handle(
          _lastAttendanceSyncMeta,
          lastAttendanceSync.isAcceptableOrUnknown(
              data['last_attendance_sync']!, _lastAttendanceSyncMeta));
    }
    if (data.containsKey('api_enabled')) {
      context.handle(
          _apiEnabledMeta,
          apiEnabled.isAcceptableOrUnknown(
              data['api_enabled']!, _apiEnabledMeta));
    }
    if (data.containsKey('api_base_url')) {
      context.handle(
          _apiBaseUrlMeta,
          apiBaseUrl.isAcceptableOrUnknown(
              data['api_base_url']!, _apiBaseUrlMeta));
    }
    if (data.containsKey('last_sync_attempt')) {
      context.handle(
          _lastSyncAttemptMeta,
          lastSyncAttempt.isAcceptableOrUnknown(
              data['last_sync_attempt']!, _lastSyncAttemptMeta));
    }
    if (data.containsKey('last_sync_error')) {
      context.handle(
          _lastSyncErrorMeta,
          lastSyncError.isAcceptableOrUnknown(
              data['last_sync_error']!, _lastSyncErrorMeta));
    }
    if (data.containsKey('voice_enabled')) {
      context.handle(
          _voiceEnabledMeta,
          voiceEnabled.isAcceptableOrUnknown(
              data['voice_enabled']!, _voiceEnabledMeta));
    }
    if (data.containsKey('voice_success')) {
      context.handle(
          _voiceSuccessMeta,
          voiceSuccess.isAcceptableOrUnknown(
              data['voice_success']!, _voiceSuccessMeta));
    }
    if (data.containsKey('voice_late')) {
      context.handle(_voiceLateMeta,
          voiceLate.isAcceptableOrUnknown(data['voice_late']!, _voiceLateMeta));
    }
    if (data.containsKey('voice_duplicate')) {
      context.handle(
          _voiceDuplicateMeta,
          voiceDuplicate.isAcceptableOrUnknown(
              data['voice_duplicate']!, _voiceDuplicateMeta));
    }
    if (data.containsKey('voice_refused')) {
      context.handle(
          _voiceRefusedMeta,
          voiceRefused.isAcceptableOrUnknown(
              data['voice_refused']!, _voiceRefusedMeta));
    }
    if (data.containsKey('admin_pin_salt')) {
      context.handle(
          _adminPinSaltMeta,
          adminPinSalt.isAcceptableOrUnknown(
              data['admin_pin_salt']!, _adminPinSaltMeta));
    }
    if (data.containsKey('admin_pin_hash')) {
      context.handle(
          _adminPinHashMeta,
          adminPinHash.isAcceptableOrUnknown(
              data['admin_pin_hash']!, _adminPinHashMeta));
    }
    if (data.containsKey('admin_pin_iterations')) {
      context.handle(
          _adminPinIterationsMeta,
          adminPinIterations.isAcceptableOrUnknown(
              data['admin_pin_iterations']!, _adminPinIterationsMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  TerminalSettings map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return TerminalSettings(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      terminalId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}terminal_id'])!,
      terminalDisplayName: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}terminal_display_name'])!,
      schoolId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}school_id']),
      schoolName: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}school_name'])!,
      schoolLogoLocalPath: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}school_logo_local_path']),
      timezone: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}timezone'])!,
      attendanceStartTime: attachedDatabase.typeMapping.read(
          DriftSqlType.string,
          data['${effectivePrefix}attendance_start_time'])!,
      lateAfterTime: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}late_after_time'])!,
      autoResetMillis: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}auto_reset_millis'])!,
      soundEnabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}sound_enabled'])!,
      hapticsEnabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}haptics_enabled'])!,
      animationsEnabled: attachedDatabase.typeMapping.read(
          DriftSqlType.bool, data['${effectivePrefix}animations_enabled'])!,
      keepScreenOn: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}keep_screen_on'])!,
      cameraFacing: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}camera_facing'])!,
      showPhoto: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}show_photo'])!,
      showMatricule: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}show_matricule'])!,
      showClassName: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}show_class_name'])!,
      showTime: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}show_time'])!,
      offlineMode: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}offline_mode'])!,
      retentionDays: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retention_days'])!,
      lastStudentSync: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_student_sync']),
      lastAttendanceSync: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime,
          data['${effectivePrefix}last_attendance_sync']),
      apiEnabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}api_enabled'])!,
      apiBaseUrl: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}api_base_url']),
      lastSyncAttempt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_sync_attempt']),
      lastSyncError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_sync_error']),
      voiceEnabled: attachedDatabase.typeMapping
          .read(DriftSqlType.bool, data['${effectivePrefix}voice_enabled'])!,
      voiceSuccess: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}voice_success'])!,
      voiceLate: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}voice_late'])!,
      voiceDuplicate: attachedDatabase.typeMapping.read(
          DriftSqlType.string, data['${effectivePrefix}voice_duplicate'])!,
      voiceRefused: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}voice_refused'])!,
      adminPinSalt: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}admin_pin_salt']),
      adminPinHash: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}admin_pin_hash']),
      adminPinIterations: attachedDatabase.typeMapping.read(
          DriftSqlType.int, data['${effectivePrefix}admin_pin_iterations'])!,
    );
  }

  @override
  $SettingsTable createAlias(String alias) {
    return $SettingsTable(attachedDatabase, alias);
  }
}

class TerminalSettings extends DataClass
    implements Insertable<TerminalSettings> {
  final int id;
  final String terminalId;
  final String terminalDisplayName;
  final String? schoolId;
  final String schoolName;
  final String? schoolLogoLocalPath;
  final String timezone;

  /// Heure d'ouverture théorique (informative).
  final String attendanceStartTime;

  /// Heure limite : au-delà, la présence passe en « en retard ».
  final String lateAfterTime;
  final int autoResetMillis;
  final bool soundEnabled;
  final bool hapticsEnabled;
  final bool animationsEnabled;
  final bool keepScreenOn;

  /// Objectif de caméra préféré du scanner : `front` (défaut) ou `back`.
  final String cameraFacing;

  /// Politique d'affichage imposée par la plateforme (mode confidentialité).
  final bool showPhoto;
  final bool showMatricule;
  final bool showClassName;
  final bool showTime;

  /// Mode hors ligne volontaire : aucune tentative réseau.
  final bool offlineMode;
  final int retentionDays;
  final DateTime? lastStudentSync;
  final DateTime? lastAttendanceSync;

  /// Synchronisation vers la plateforme centrale : désactivée par défaut.
  final bool apiEnabled;
  final String? apiBaseUrl;

  /// Diagnostic de la dernière tentative de synchronisation.
  final DateTime? lastSyncAttempt;
  final String? lastSyncError;

  /// Retour vocal (Text-to-Speech) — messages définis par l'administrateur.
  final bool voiceEnabled;
  final String voiceSuccess;
  final String voiceLate;
  final String voiceDuplicate;
  final String voiceRefused;

  /// Code administrateur — jamais stocké en clair (sel + empreinte itérée).
  final String? adminPinSalt;
  final String? adminPinHash;
  final int adminPinIterations;
  const TerminalSettings(
      {required this.id,
      required this.terminalId,
      required this.terminalDisplayName,
      this.schoolId,
      required this.schoolName,
      this.schoolLogoLocalPath,
      required this.timezone,
      required this.attendanceStartTime,
      required this.lateAfterTime,
      required this.autoResetMillis,
      required this.soundEnabled,
      required this.hapticsEnabled,
      required this.animationsEnabled,
      required this.keepScreenOn,
      required this.cameraFacing,
      required this.showPhoto,
      required this.showMatricule,
      required this.showClassName,
      required this.showTime,
      required this.offlineMode,
      required this.retentionDays,
      this.lastStudentSync,
      this.lastAttendanceSync,
      required this.apiEnabled,
      this.apiBaseUrl,
      this.lastSyncAttempt,
      this.lastSyncError,
      required this.voiceEnabled,
      required this.voiceSuccess,
      required this.voiceLate,
      required this.voiceDuplicate,
      required this.voiceRefused,
      this.adminPinSalt,
      this.adminPinHash,
      required this.adminPinIterations});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['terminal_id'] = Variable<String>(terminalId);
    map['terminal_display_name'] = Variable<String>(terminalDisplayName);
    if (!nullToAbsent || schoolId != null) {
      map['school_id'] = Variable<String>(schoolId);
    }
    map['school_name'] = Variable<String>(schoolName);
    if (!nullToAbsent || schoolLogoLocalPath != null) {
      map['school_logo_local_path'] = Variable<String>(schoolLogoLocalPath);
    }
    map['timezone'] = Variable<String>(timezone);
    map['attendance_start_time'] = Variable<String>(attendanceStartTime);
    map['late_after_time'] = Variable<String>(lateAfterTime);
    map['auto_reset_millis'] = Variable<int>(autoResetMillis);
    map['sound_enabled'] = Variable<bool>(soundEnabled);
    map['haptics_enabled'] = Variable<bool>(hapticsEnabled);
    map['animations_enabled'] = Variable<bool>(animationsEnabled);
    map['keep_screen_on'] = Variable<bool>(keepScreenOn);
    map['camera_facing'] = Variable<String>(cameraFacing);
    map['show_photo'] = Variable<bool>(showPhoto);
    map['show_matricule'] = Variable<bool>(showMatricule);
    map['show_class_name'] = Variable<bool>(showClassName);
    map['show_time'] = Variable<bool>(showTime);
    map['offline_mode'] = Variable<bool>(offlineMode);
    map['retention_days'] = Variable<int>(retentionDays);
    if (!nullToAbsent || lastStudentSync != null) {
      map['last_student_sync'] = Variable<DateTime>(lastStudentSync);
    }
    if (!nullToAbsent || lastAttendanceSync != null) {
      map['last_attendance_sync'] = Variable<DateTime>(lastAttendanceSync);
    }
    map['api_enabled'] = Variable<bool>(apiEnabled);
    if (!nullToAbsent || apiBaseUrl != null) {
      map['api_base_url'] = Variable<String>(apiBaseUrl);
    }
    if (!nullToAbsent || lastSyncAttempt != null) {
      map['last_sync_attempt'] = Variable<DateTime>(lastSyncAttempt);
    }
    if (!nullToAbsent || lastSyncError != null) {
      map['last_sync_error'] = Variable<String>(lastSyncError);
    }
    map['voice_enabled'] = Variable<bool>(voiceEnabled);
    map['voice_success'] = Variable<String>(voiceSuccess);
    map['voice_late'] = Variable<String>(voiceLate);
    map['voice_duplicate'] = Variable<String>(voiceDuplicate);
    map['voice_refused'] = Variable<String>(voiceRefused);
    if (!nullToAbsent || adminPinSalt != null) {
      map['admin_pin_salt'] = Variable<String>(adminPinSalt);
    }
    if (!nullToAbsent || adminPinHash != null) {
      map['admin_pin_hash'] = Variable<String>(adminPinHash);
    }
    map['admin_pin_iterations'] = Variable<int>(adminPinIterations);
    return map;
  }

  SettingsCompanion toCompanion(bool nullToAbsent) {
    return SettingsCompanion(
      id: Value(id),
      terminalId: Value(terminalId),
      terminalDisplayName: Value(terminalDisplayName),
      schoolId: schoolId == null && nullToAbsent
          ? const Value.absent()
          : Value(schoolId),
      schoolName: Value(schoolName),
      schoolLogoLocalPath: schoolLogoLocalPath == null && nullToAbsent
          ? const Value.absent()
          : Value(schoolLogoLocalPath),
      timezone: Value(timezone),
      attendanceStartTime: Value(attendanceStartTime),
      lateAfterTime: Value(lateAfterTime),
      autoResetMillis: Value(autoResetMillis),
      soundEnabled: Value(soundEnabled),
      hapticsEnabled: Value(hapticsEnabled),
      animationsEnabled: Value(animationsEnabled),
      keepScreenOn: Value(keepScreenOn),
      cameraFacing: Value(cameraFacing),
      showPhoto: Value(showPhoto),
      showMatricule: Value(showMatricule),
      showClassName: Value(showClassName),
      showTime: Value(showTime),
      offlineMode: Value(offlineMode),
      retentionDays: Value(retentionDays),
      lastStudentSync: lastStudentSync == null && nullToAbsent
          ? const Value.absent()
          : Value(lastStudentSync),
      lastAttendanceSync: lastAttendanceSync == null && nullToAbsent
          ? const Value.absent()
          : Value(lastAttendanceSync),
      apiEnabled: Value(apiEnabled),
      apiBaseUrl: apiBaseUrl == null && nullToAbsent
          ? const Value.absent()
          : Value(apiBaseUrl),
      lastSyncAttempt: lastSyncAttempt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncAttempt),
      lastSyncError: lastSyncError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastSyncError),
      voiceEnabled: Value(voiceEnabled),
      voiceSuccess: Value(voiceSuccess),
      voiceLate: Value(voiceLate),
      voiceDuplicate: Value(voiceDuplicate),
      voiceRefused: Value(voiceRefused),
      adminPinSalt: adminPinSalt == null && nullToAbsent
          ? const Value.absent()
          : Value(adminPinSalt),
      adminPinHash: adminPinHash == null && nullToAbsent
          ? const Value.absent()
          : Value(adminPinHash),
      adminPinIterations: Value(adminPinIterations),
    );
  }

  factory TerminalSettings.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return TerminalSettings(
      id: serializer.fromJson<int>(json['id']),
      terminalId: serializer.fromJson<String>(json['terminalId']),
      terminalDisplayName:
          serializer.fromJson<String>(json['terminalDisplayName']),
      schoolId: serializer.fromJson<String?>(json['schoolId']),
      schoolName: serializer.fromJson<String>(json['schoolName']),
      schoolLogoLocalPath:
          serializer.fromJson<String?>(json['schoolLogoLocalPath']),
      timezone: serializer.fromJson<String>(json['timezone']),
      attendanceStartTime:
          serializer.fromJson<String>(json['attendanceStartTime']),
      lateAfterTime: serializer.fromJson<String>(json['lateAfterTime']),
      autoResetMillis: serializer.fromJson<int>(json['autoResetMillis']),
      soundEnabled: serializer.fromJson<bool>(json['soundEnabled']),
      hapticsEnabled: serializer.fromJson<bool>(json['hapticsEnabled']),
      animationsEnabled: serializer.fromJson<bool>(json['animationsEnabled']),
      keepScreenOn: serializer.fromJson<bool>(json['keepScreenOn']),
      cameraFacing: serializer.fromJson<String>(json['cameraFacing']),
      showPhoto: serializer.fromJson<bool>(json['showPhoto']),
      showMatricule: serializer.fromJson<bool>(json['showMatricule']),
      showClassName: serializer.fromJson<bool>(json['showClassName']),
      showTime: serializer.fromJson<bool>(json['showTime']),
      offlineMode: serializer.fromJson<bool>(json['offlineMode']),
      retentionDays: serializer.fromJson<int>(json['retentionDays']),
      lastStudentSync: serializer.fromJson<DateTime?>(json['lastStudentSync']),
      lastAttendanceSync:
          serializer.fromJson<DateTime?>(json['lastAttendanceSync']),
      apiEnabled: serializer.fromJson<bool>(json['apiEnabled']),
      apiBaseUrl: serializer.fromJson<String?>(json['apiBaseUrl']),
      lastSyncAttempt: serializer.fromJson<DateTime?>(json['lastSyncAttempt']),
      lastSyncError: serializer.fromJson<String?>(json['lastSyncError']),
      voiceEnabled: serializer.fromJson<bool>(json['voiceEnabled']),
      voiceSuccess: serializer.fromJson<String>(json['voiceSuccess']),
      voiceLate: serializer.fromJson<String>(json['voiceLate']),
      voiceDuplicate: serializer.fromJson<String>(json['voiceDuplicate']),
      voiceRefused: serializer.fromJson<String>(json['voiceRefused']),
      adminPinSalt: serializer.fromJson<String?>(json['adminPinSalt']),
      adminPinHash: serializer.fromJson<String?>(json['adminPinHash']),
      adminPinIterations: serializer.fromJson<int>(json['adminPinIterations']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'terminalId': serializer.toJson<String>(terminalId),
      'terminalDisplayName': serializer.toJson<String>(terminalDisplayName),
      'schoolId': serializer.toJson<String?>(schoolId),
      'schoolName': serializer.toJson<String>(schoolName),
      'schoolLogoLocalPath': serializer.toJson<String?>(schoolLogoLocalPath),
      'timezone': serializer.toJson<String>(timezone),
      'attendanceStartTime': serializer.toJson<String>(attendanceStartTime),
      'lateAfterTime': serializer.toJson<String>(lateAfterTime),
      'autoResetMillis': serializer.toJson<int>(autoResetMillis),
      'soundEnabled': serializer.toJson<bool>(soundEnabled),
      'hapticsEnabled': serializer.toJson<bool>(hapticsEnabled),
      'animationsEnabled': serializer.toJson<bool>(animationsEnabled),
      'keepScreenOn': serializer.toJson<bool>(keepScreenOn),
      'cameraFacing': serializer.toJson<String>(cameraFacing),
      'showPhoto': serializer.toJson<bool>(showPhoto),
      'showMatricule': serializer.toJson<bool>(showMatricule),
      'showClassName': serializer.toJson<bool>(showClassName),
      'showTime': serializer.toJson<bool>(showTime),
      'offlineMode': serializer.toJson<bool>(offlineMode),
      'retentionDays': serializer.toJson<int>(retentionDays),
      'lastStudentSync': serializer.toJson<DateTime?>(lastStudentSync),
      'lastAttendanceSync': serializer.toJson<DateTime?>(lastAttendanceSync),
      'apiEnabled': serializer.toJson<bool>(apiEnabled),
      'apiBaseUrl': serializer.toJson<String?>(apiBaseUrl),
      'lastSyncAttempt': serializer.toJson<DateTime?>(lastSyncAttempt),
      'lastSyncError': serializer.toJson<String?>(lastSyncError),
      'voiceEnabled': serializer.toJson<bool>(voiceEnabled),
      'voiceSuccess': serializer.toJson<String>(voiceSuccess),
      'voiceLate': serializer.toJson<String>(voiceLate),
      'voiceDuplicate': serializer.toJson<String>(voiceDuplicate),
      'voiceRefused': serializer.toJson<String>(voiceRefused),
      'adminPinSalt': serializer.toJson<String?>(adminPinSalt),
      'adminPinHash': serializer.toJson<String?>(adminPinHash),
      'adminPinIterations': serializer.toJson<int>(adminPinIterations),
    };
  }

  TerminalSettings copyWith(
          {int? id,
          String? terminalId,
          String? terminalDisplayName,
          Value<String?> schoolId = const Value.absent(),
          String? schoolName,
          Value<String?> schoolLogoLocalPath = const Value.absent(),
          String? timezone,
          String? attendanceStartTime,
          String? lateAfterTime,
          int? autoResetMillis,
          bool? soundEnabled,
          bool? hapticsEnabled,
          bool? animationsEnabled,
          bool? keepScreenOn,
          String? cameraFacing,
          bool? showPhoto,
          bool? showMatricule,
          bool? showClassName,
          bool? showTime,
          bool? offlineMode,
          int? retentionDays,
          Value<DateTime?> lastStudentSync = const Value.absent(),
          Value<DateTime?> lastAttendanceSync = const Value.absent(),
          bool? apiEnabled,
          Value<String?> apiBaseUrl = const Value.absent(),
          Value<DateTime?> lastSyncAttempt = const Value.absent(),
          Value<String?> lastSyncError = const Value.absent(),
          bool? voiceEnabled,
          String? voiceSuccess,
          String? voiceLate,
          String? voiceDuplicate,
          String? voiceRefused,
          Value<String?> adminPinSalt = const Value.absent(),
          Value<String?> adminPinHash = const Value.absent(),
          int? adminPinIterations}) =>
      TerminalSettings(
        id: id ?? this.id,
        terminalId: terminalId ?? this.terminalId,
        terminalDisplayName: terminalDisplayName ?? this.terminalDisplayName,
        schoolId: schoolId.present ? schoolId.value : this.schoolId,
        schoolName: schoolName ?? this.schoolName,
        schoolLogoLocalPath: schoolLogoLocalPath.present
            ? schoolLogoLocalPath.value
            : this.schoolLogoLocalPath,
        timezone: timezone ?? this.timezone,
        attendanceStartTime: attendanceStartTime ?? this.attendanceStartTime,
        lateAfterTime: lateAfterTime ?? this.lateAfterTime,
        autoResetMillis: autoResetMillis ?? this.autoResetMillis,
        soundEnabled: soundEnabled ?? this.soundEnabled,
        hapticsEnabled: hapticsEnabled ?? this.hapticsEnabled,
        animationsEnabled: animationsEnabled ?? this.animationsEnabled,
        keepScreenOn: keepScreenOn ?? this.keepScreenOn,
        cameraFacing: cameraFacing ?? this.cameraFacing,
        showPhoto: showPhoto ?? this.showPhoto,
        showMatricule: showMatricule ?? this.showMatricule,
        showClassName: showClassName ?? this.showClassName,
        showTime: showTime ?? this.showTime,
        offlineMode: offlineMode ?? this.offlineMode,
        retentionDays: retentionDays ?? this.retentionDays,
        lastStudentSync: lastStudentSync.present
            ? lastStudentSync.value
            : this.lastStudentSync,
        lastAttendanceSync: lastAttendanceSync.present
            ? lastAttendanceSync.value
            : this.lastAttendanceSync,
        apiEnabled: apiEnabled ?? this.apiEnabled,
        apiBaseUrl: apiBaseUrl.present ? apiBaseUrl.value : this.apiBaseUrl,
        lastSyncAttempt: lastSyncAttempt.present
            ? lastSyncAttempt.value
            : this.lastSyncAttempt,
        lastSyncError:
            lastSyncError.present ? lastSyncError.value : this.lastSyncError,
        voiceEnabled: voiceEnabled ?? this.voiceEnabled,
        voiceSuccess: voiceSuccess ?? this.voiceSuccess,
        voiceLate: voiceLate ?? this.voiceLate,
        voiceDuplicate: voiceDuplicate ?? this.voiceDuplicate,
        voiceRefused: voiceRefused ?? this.voiceRefused,
        adminPinSalt:
            adminPinSalt.present ? adminPinSalt.value : this.adminPinSalt,
        adminPinHash:
            adminPinHash.present ? adminPinHash.value : this.adminPinHash,
        adminPinIterations: adminPinIterations ?? this.adminPinIterations,
      );
  TerminalSettings copyWithCompanion(SettingsCompanion data) {
    return TerminalSettings(
      id: data.id.present ? data.id.value : this.id,
      terminalId:
          data.terminalId.present ? data.terminalId.value : this.terminalId,
      terminalDisplayName: data.terminalDisplayName.present
          ? data.terminalDisplayName.value
          : this.terminalDisplayName,
      schoolId: data.schoolId.present ? data.schoolId.value : this.schoolId,
      schoolName:
          data.schoolName.present ? data.schoolName.value : this.schoolName,
      schoolLogoLocalPath: data.schoolLogoLocalPath.present
          ? data.schoolLogoLocalPath.value
          : this.schoolLogoLocalPath,
      timezone: data.timezone.present ? data.timezone.value : this.timezone,
      attendanceStartTime: data.attendanceStartTime.present
          ? data.attendanceStartTime.value
          : this.attendanceStartTime,
      lateAfterTime: data.lateAfterTime.present
          ? data.lateAfterTime.value
          : this.lateAfterTime,
      autoResetMillis: data.autoResetMillis.present
          ? data.autoResetMillis.value
          : this.autoResetMillis,
      soundEnabled: data.soundEnabled.present
          ? data.soundEnabled.value
          : this.soundEnabled,
      hapticsEnabled: data.hapticsEnabled.present
          ? data.hapticsEnabled.value
          : this.hapticsEnabled,
      animationsEnabled: data.animationsEnabled.present
          ? data.animationsEnabled.value
          : this.animationsEnabled,
      keepScreenOn: data.keepScreenOn.present
          ? data.keepScreenOn.value
          : this.keepScreenOn,
      cameraFacing: data.cameraFacing.present
          ? data.cameraFacing.value
          : this.cameraFacing,
      showPhoto: data.showPhoto.present ? data.showPhoto.value : this.showPhoto,
      showMatricule: data.showMatricule.present
          ? data.showMatricule.value
          : this.showMatricule,
      showClassName: data.showClassName.present
          ? data.showClassName.value
          : this.showClassName,
      showTime: data.showTime.present ? data.showTime.value : this.showTime,
      offlineMode:
          data.offlineMode.present ? data.offlineMode.value : this.offlineMode,
      retentionDays: data.retentionDays.present
          ? data.retentionDays.value
          : this.retentionDays,
      lastStudentSync: data.lastStudentSync.present
          ? data.lastStudentSync.value
          : this.lastStudentSync,
      lastAttendanceSync: data.lastAttendanceSync.present
          ? data.lastAttendanceSync.value
          : this.lastAttendanceSync,
      apiEnabled:
          data.apiEnabled.present ? data.apiEnabled.value : this.apiEnabled,
      apiBaseUrl:
          data.apiBaseUrl.present ? data.apiBaseUrl.value : this.apiBaseUrl,
      lastSyncAttempt: data.lastSyncAttempt.present
          ? data.lastSyncAttempt.value
          : this.lastSyncAttempt,
      lastSyncError: data.lastSyncError.present
          ? data.lastSyncError.value
          : this.lastSyncError,
      voiceEnabled: data.voiceEnabled.present
          ? data.voiceEnabled.value
          : this.voiceEnabled,
      voiceSuccess: data.voiceSuccess.present
          ? data.voiceSuccess.value
          : this.voiceSuccess,
      voiceLate: data.voiceLate.present ? data.voiceLate.value : this.voiceLate,
      voiceDuplicate: data.voiceDuplicate.present
          ? data.voiceDuplicate.value
          : this.voiceDuplicate,
      voiceRefused: data.voiceRefused.present
          ? data.voiceRefused.value
          : this.voiceRefused,
      adminPinSalt: data.adminPinSalt.present
          ? data.adminPinSalt.value
          : this.adminPinSalt,
      adminPinHash: data.adminPinHash.present
          ? data.adminPinHash.value
          : this.adminPinHash,
      adminPinIterations: data.adminPinIterations.present
          ? data.adminPinIterations.value
          : this.adminPinIterations,
    );
  }

  @override
  String toString() {
    return (StringBuffer('TerminalSettings(')
          ..write('id: $id, ')
          ..write('terminalId: $terminalId, ')
          ..write('terminalDisplayName: $terminalDisplayName, ')
          ..write('schoolId: $schoolId, ')
          ..write('schoolName: $schoolName, ')
          ..write('schoolLogoLocalPath: $schoolLogoLocalPath, ')
          ..write('timezone: $timezone, ')
          ..write('attendanceStartTime: $attendanceStartTime, ')
          ..write('lateAfterTime: $lateAfterTime, ')
          ..write('autoResetMillis: $autoResetMillis, ')
          ..write('soundEnabled: $soundEnabled, ')
          ..write('hapticsEnabled: $hapticsEnabled, ')
          ..write('animationsEnabled: $animationsEnabled, ')
          ..write('keepScreenOn: $keepScreenOn, ')
          ..write('cameraFacing: $cameraFacing, ')
          ..write('showPhoto: $showPhoto, ')
          ..write('showMatricule: $showMatricule, ')
          ..write('showClassName: $showClassName, ')
          ..write('showTime: $showTime, ')
          ..write('offlineMode: $offlineMode, ')
          ..write('retentionDays: $retentionDays, ')
          ..write('lastStudentSync: $lastStudentSync, ')
          ..write('lastAttendanceSync: $lastAttendanceSync, ')
          ..write('apiEnabled: $apiEnabled, ')
          ..write('apiBaseUrl: $apiBaseUrl, ')
          ..write('lastSyncAttempt: $lastSyncAttempt, ')
          ..write('lastSyncError: $lastSyncError, ')
          ..write('voiceEnabled: $voiceEnabled, ')
          ..write('voiceSuccess: $voiceSuccess, ')
          ..write('voiceLate: $voiceLate, ')
          ..write('voiceDuplicate: $voiceDuplicate, ')
          ..write('voiceRefused: $voiceRefused, ')
          ..write('adminPinSalt: $adminPinSalt, ')
          ..write('adminPinHash: $adminPinHash, ')
          ..write('adminPinIterations: $adminPinIterations')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hashAll([
        id,
        terminalId,
        terminalDisplayName,
        schoolId,
        schoolName,
        schoolLogoLocalPath,
        timezone,
        attendanceStartTime,
        lateAfterTime,
        autoResetMillis,
        soundEnabled,
        hapticsEnabled,
        animationsEnabled,
        keepScreenOn,
        cameraFacing,
        showPhoto,
        showMatricule,
        showClassName,
        showTime,
        offlineMode,
        retentionDays,
        lastStudentSync,
        lastAttendanceSync,
        apiEnabled,
        apiBaseUrl,
        lastSyncAttempt,
        lastSyncError,
        voiceEnabled,
        voiceSuccess,
        voiceLate,
        voiceDuplicate,
        voiceRefused,
        adminPinSalt,
        adminPinHash,
        adminPinIterations
      ]);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is TerminalSettings &&
          other.id == this.id &&
          other.terminalId == this.terminalId &&
          other.terminalDisplayName == this.terminalDisplayName &&
          other.schoolId == this.schoolId &&
          other.schoolName == this.schoolName &&
          other.schoolLogoLocalPath == this.schoolLogoLocalPath &&
          other.timezone == this.timezone &&
          other.attendanceStartTime == this.attendanceStartTime &&
          other.lateAfterTime == this.lateAfterTime &&
          other.autoResetMillis == this.autoResetMillis &&
          other.soundEnabled == this.soundEnabled &&
          other.hapticsEnabled == this.hapticsEnabled &&
          other.animationsEnabled == this.animationsEnabled &&
          other.keepScreenOn == this.keepScreenOn &&
          other.cameraFacing == this.cameraFacing &&
          other.showPhoto == this.showPhoto &&
          other.showMatricule == this.showMatricule &&
          other.showClassName == this.showClassName &&
          other.showTime == this.showTime &&
          other.offlineMode == this.offlineMode &&
          other.retentionDays == this.retentionDays &&
          other.lastStudentSync == this.lastStudentSync &&
          other.lastAttendanceSync == this.lastAttendanceSync &&
          other.apiEnabled == this.apiEnabled &&
          other.apiBaseUrl == this.apiBaseUrl &&
          other.lastSyncAttempt == this.lastSyncAttempt &&
          other.lastSyncError == this.lastSyncError &&
          other.voiceEnabled == this.voiceEnabled &&
          other.voiceSuccess == this.voiceSuccess &&
          other.voiceLate == this.voiceLate &&
          other.voiceDuplicate == this.voiceDuplicate &&
          other.voiceRefused == this.voiceRefused &&
          other.adminPinSalt == this.adminPinSalt &&
          other.adminPinHash == this.adminPinHash &&
          other.adminPinIterations == this.adminPinIterations);
}

class SettingsCompanion extends UpdateCompanion<TerminalSettings> {
  final Value<int> id;
  final Value<String> terminalId;
  final Value<String> terminalDisplayName;
  final Value<String?> schoolId;
  final Value<String> schoolName;
  final Value<String?> schoolLogoLocalPath;
  final Value<String> timezone;
  final Value<String> attendanceStartTime;
  final Value<String> lateAfterTime;
  final Value<int> autoResetMillis;
  final Value<bool> soundEnabled;
  final Value<bool> hapticsEnabled;
  final Value<bool> animationsEnabled;
  final Value<bool> keepScreenOn;
  final Value<String> cameraFacing;
  final Value<bool> showPhoto;
  final Value<bool> showMatricule;
  final Value<bool> showClassName;
  final Value<bool> showTime;
  final Value<bool> offlineMode;
  final Value<int> retentionDays;
  final Value<DateTime?> lastStudentSync;
  final Value<DateTime?> lastAttendanceSync;
  final Value<bool> apiEnabled;
  final Value<String?> apiBaseUrl;
  final Value<DateTime?> lastSyncAttempt;
  final Value<String?> lastSyncError;
  final Value<bool> voiceEnabled;
  final Value<String> voiceSuccess;
  final Value<String> voiceLate;
  final Value<String> voiceDuplicate;
  final Value<String> voiceRefused;
  final Value<String?> adminPinSalt;
  final Value<String?> adminPinHash;
  final Value<int> adminPinIterations;
  const SettingsCompanion({
    this.id = const Value.absent(),
    this.terminalId = const Value.absent(),
    this.terminalDisplayName = const Value.absent(),
    this.schoolId = const Value.absent(),
    this.schoolName = const Value.absent(),
    this.schoolLogoLocalPath = const Value.absent(),
    this.timezone = const Value.absent(),
    this.attendanceStartTime = const Value.absent(),
    this.lateAfterTime = const Value.absent(),
    this.autoResetMillis = const Value.absent(),
    this.soundEnabled = const Value.absent(),
    this.hapticsEnabled = const Value.absent(),
    this.animationsEnabled = const Value.absent(),
    this.keepScreenOn = const Value.absent(),
    this.cameraFacing = const Value.absent(),
    this.showPhoto = const Value.absent(),
    this.showMatricule = const Value.absent(),
    this.showClassName = const Value.absent(),
    this.showTime = const Value.absent(),
    this.offlineMode = const Value.absent(),
    this.retentionDays = const Value.absent(),
    this.lastStudentSync = const Value.absent(),
    this.lastAttendanceSync = const Value.absent(),
    this.apiEnabled = const Value.absent(),
    this.apiBaseUrl = const Value.absent(),
    this.lastSyncAttempt = const Value.absent(),
    this.lastSyncError = const Value.absent(),
    this.voiceEnabled = const Value.absent(),
    this.voiceSuccess = const Value.absent(),
    this.voiceLate = const Value.absent(),
    this.voiceDuplicate = const Value.absent(),
    this.voiceRefused = const Value.absent(),
    this.adminPinSalt = const Value.absent(),
    this.adminPinHash = const Value.absent(),
    this.adminPinIterations = const Value.absent(),
  });
  SettingsCompanion.insert({
    this.id = const Value.absent(),
    required String terminalId,
    this.terminalDisplayName = const Value.absent(),
    this.schoolId = const Value.absent(),
    this.schoolName = const Value.absent(),
    this.schoolLogoLocalPath = const Value.absent(),
    this.timezone = const Value.absent(),
    this.attendanceStartTime = const Value.absent(),
    this.lateAfterTime = const Value.absent(),
    this.autoResetMillis = const Value.absent(),
    this.soundEnabled = const Value.absent(),
    this.hapticsEnabled = const Value.absent(),
    this.animationsEnabled = const Value.absent(),
    this.keepScreenOn = const Value.absent(),
    this.cameraFacing = const Value.absent(),
    this.showPhoto = const Value.absent(),
    this.showMatricule = const Value.absent(),
    this.showClassName = const Value.absent(),
    this.showTime = const Value.absent(),
    this.offlineMode = const Value.absent(),
    this.retentionDays = const Value.absent(),
    this.lastStudentSync = const Value.absent(),
    this.lastAttendanceSync = const Value.absent(),
    this.apiEnabled = const Value.absent(),
    this.apiBaseUrl = const Value.absent(),
    this.lastSyncAttempt = const Value.absent(),
    this.lastSyncError = const Value.absent(),
    this.voiceEnabled = const Value.absent(),
    this.voiceSuccess = const Value.absent(),
    this.voiceLate = const Value.absent(),
    this.voiceDuplicate = const Value.absent(),
    this.voiceRefused = const Value.absent(),
    this.adminPinSalt = const Value.absent(),
    this.adminPinHash = const Value.absent(),
    this.adminPinIterations = const Value.absent(),
  }) : terminalId = Value(terminalId);
  static Insertable<TerminalSettings> custom({
    Expression<int>? id,
    Expression<String>? terminalId,
    Expression<String>? terminalDisplayName,
    Expression<String>? schoolId,
    Expression<String>? schoolName,
    Expression<String>? schoolLogoLocalPath,
    Expression<String>? timezone,
    Expression<String>? attendanceStartTime,
    Expression<String>? lateAfterTime,
    Expression<int>? autoResetMillis,
    Expression<bool>? soundEnabled,
    Expression<bool>? hapticsEnabled,
    Expression<bool>? animationsEnabled,
    Expression<bool>? keepScreenOn,
    Expression<String>? cameraFacing,
    Expression<bool>? showPhoto,
    Expression<bool>? showMatricule,
    Expression<bool>? showClassName,
    Expression<bool>? showTime,
    Expression<bool>? offlineMode,
    Expression<int>? retentionDays,
    Expression<DateTime>? lastStudentSync,
    Expression<DateTime>? lastAttendanceSync,
    Expression<bool>? apiEnabled,
    Expression<String>? apiBaseUrl,
    Expression<DateTime>? lastSyncAttempt,
    Expression<String>? lastSyncError,
    Expression<bool>? voiceEnabled,
    Expression<String>? voiceSuccess,
    Expression<String>? voiceLate,
    Expression<String>? voiceDuplicate,
    Expression<String>? voiceRefused,
    Expression<String>? adminPinSalt,
    Expression<String>? adminPinHash,
    Expression<int>? adminPinIterations,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (terminalId != null) 'terminal_id': terminalId,
      if (terminalDisplayName != null)
        'terminal_display_name': terminalDisplayName,
      if (schoolId != null) 'school_id': schoolId,
      if (schoolName != null) 'school_name': schoolName,
      if (schoolLogoLocalPath != null)
        'school_logo_local_path': schoolLogoLocalPath,
      if (timezone != null) 'timezone': timezone,
      if (attendanceStartTime != null)
        'attendance_start_time': attendanceStartTime,
      if (lateAfterTime != null) 'late_after_time': lateAfterTime,
      if (autoResetMillis != null) 'auto_reset_millis': autoResetMillis,
      if (soundEnabled != null) 'sound_enabled': soundEnabled,
      if (hapticsEnabled != null) 'haptics_enabled': hapticsEnabled,
      if (animationsEnabled != null) 'animations_enabled': animationsEnabled,
      if (keepScreenOn != null) 'keep_screen_on': keepScreenOn,
      if (cameraFacing != null) 'camera_facing': cameraFacing,
      if (showPhoto != null) 'show_photo': showPhoto,
      if (showMatricule != null) 'show_matricule': showMatricule,
      if (showClassName != null) 'show_class_name': showClassName,
      if (showTime != null) 'show_time': showTime,
      if (offlineMode != null) 'offline_mode': offlineMode,
      if (retentionDays != null) 'retention_days': retentionDays,
      if (lastStudentSync != null) 'last_student_sync': lastStudentSync,
      if (lastAttendanceSync != null)
        'last_attendance_sync': lastAttendanceSync,
      if (apiEnabled != null) 'api_enabled': apiEnabled,
      if (apiBaseUrl != null) 'api_base_url': apiBaseUrl,
      if (lastSyncAttempt != null) 'last_sync_attempt': lastSyncAttempt,
      if (lastSyncError != null) 'last_sync_error': lastSyncError,
      if (voiceEnabled != null) 'voice_enabled': voiceEnabled,
      if (voiceSuccess != null) 'voice_success': voiceSuccess,
      if (voiceLate != null) 'voice_late': voiceLate,
      if (voiceDuplicate != null) 'voice_duplicate': voiceDuplicate,
      if (voiceRefused != null) 'voice_refused': voiceRefused,
      if (adminPinSalt != null) 'admin_pin_salt': adminPinSalt,
      if (adminPinHash != null) 'admin_pin_hash': adminPinHash,
      if (adminPinIterations != null)
        'admin_pin_iterations': adminPinIterations,
    });
  }

  SettingsCompanion copyWith(
      {Value<int>? id,
      Value<String>? terminalId,
      Value<String>? terminalDisplayName,
      Value<String?>? schoolId,
      Value<String>? schoolName,
      Value<String?>? schoolLogoLocalPath,
      Value<String>? timezone,
      Value<String>? attendanceStartTime,
      Value<String>? lateAfterTime,
      Value<int>? autoResetMillis,
      Value<bool>? soundEnabled,
      Value<bool>? hapticsEnabled,
      Value<bool>? animationsEnabled,
      Value<bool>? keepScreenOn,
      Value<String>? cameraFacing,
      Value<bool>? showPhoto,
      Value<bool>? showMatricule,
      Value<bool>? showClassName,
      Value<bool>? showTime,
      Value<bool>? offlineMode,
      Value<int>? retentionDays,
      Value<DateTime?>? lastStudentSync,
      Value<DateTime?>? lastAttendanceSync,
      Value<bool>? apiEnabled,
      Value<String?>? apiBaseUrl,
      Value<DateTime?>? lastSyncAttempt,
      Value<String?>? lastSyncError,
      Value<bool>? voiceEnabled,
      Value<String>? voiceSuccess,
      Value<String>? voiceLate,
      Value<String>? voiceDuplicate,
      Value<String>? voiceRefused,
      Value<String?>? adminPinSalt,
      Value<String?>? adminPinHash,
      Value<int>? adminPinIterations}) {
    return SettingsCompanion(
      id: id ?? this.id,
      terminalId: terminalId ?? this.terminalId,
      terminalDisplayName: terminalDisplayName ?? this.terminalDisplayName,
      schoolId: schoolId ?? this.schoolId,
      schoolName: schoolName ?? this.schoolName,
      schoolLogoLocalPath: schoolLogoLocalPath ?? this.schoolLogoLocalPath,
      timezone: timezone ?? this.timezone,
      attendanceStartTime: attendanceStartTime ?? this.attendanceStartTime,
      lateAfterTime: lateAfterTime ?? this.lateAfterTime,
      autoResetMillis: autoResetMillis ?? this.autoResetMillis,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      hapticsEnabled: hapticsEnabled ?? this.hapticsEnabled,
      animationsEnabled: animationsEnabled ?? this.animationsEnabled,
      keepScreenOn: keepScreenOn ?? this.keepScreenOn,
      cameraFacing: cameraFacing ?? this.cameraFacing,
      showPhoto: showPhoto ?? this.showPhoto,
      showMatricule: showMatricule ?? this.showMatricule,
      showClassName: showClassName ?? this.showClassName,
      showTime: showTime ?? this.showTime,
      offlineMode: offlineMode ?? this.offlineMode,
      retentionDays: retentionDays ?? this.retentionDays,
      lastStudentSync: lastStudentSync ?? this.lastStudentSync,
      lastAttendanceSync: lastAttendanceSync ?? this.lastAttendanceSync,
      apiEnabled: apiEnabled ?? this.apiEnabled,
      apiBaseUrl: apiBaseUrl ?? this.apiBaseUrl,
      lastSyncAttempt: lastSyncAttempt ?? this.lastSyncAttempt,
      lastSyncError: lastSyncError ?? this.lastSyncError,
      voiceEnabled: voiceEnabled ?? this.voiceEnabled,
      voiceSuccess: voiceSuccess ?? this.voiceSuccess,
      voiceLate: voiceLate ?? this.voiceLate,
      voiceDuplicate: voiceDuplicate ?? this.voiceDuplicate,
      voiceRefused: voiceRefused ?? this.voiceRefused,
      adminPinSalt: adminPinSalt ?? this.adminPinSalt,
      adminPinHash: adminPinHash ?? this.adminPinHash,
      adminPinIterations: adminPinIterations ?? this.adminPinIterations,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (terminalId.present) {
      map['terminal_id'] = Variable<String>(terminalId.value);
    }
    if (terminalDisplayName.present) {
      map['terminal_display_name'] =
          Variable<String>(terminalDisplayName.value);
    }
    if (schoolId.present) {
      map['school_id'] = Variable<String>(schoolId.value);
    }
    if (schoolName.present) {
      map['school_name'] = Variable<String>(schoolName.value);
    }
    if (schoolLogoLocalPath.present) {
      map['school_logo_local_path'] =
          Variable<String>(schoolLogoLocalPath.value);
    }
    if (timezone.present) {
      map['timezone'] = Variable<String>(timezone.value);
    }
    if (attendanceStartTime.present) {
      map['attendance_start_time'] =
          Variable<String>(attendanceStartTime.value);
    }
    if (lateAfterTime.present) {
      map['late_after_time'] = Variable<String>(lateAfterTime.value);
    }
    if (autoResetMillis.present) {
      map['auto_reset_millis'] = Variable<int>(autoResetMillis.value);
    }
    if (soundEnabled.present) {
      map['sound_enabled'] = Variable<bool>(soundEnabled.value);
    }
    if (hapticsEnabled.present) {
      map['haptics_enabled'] = Variable<bool>(hapticsEnabled.value);
    }
    if (animationsEnabled.present) {
      map['animations_enabled'] = Variable<bool>(animationsEnabled.value);
    }
    if (keepScreenOn.present) {
      map['keep_screen_on'] = Variable<bool>(keepScreenOn.value);
    }
    if (cameraFacing.present) {
      map['camera_facing'] = Variable<String>(cameraFacing.value);
    }
    if (showPhoto.present) {
      map['show_photo'] = Variable<bool>(showPhoto.value);
    }
    if (showMatricule.present) {
      map['show_matricule'] = Variable<bool>(showMatricule.value);
    }
    if (showClassName.present) {
      map['show_class_name'] = Variable<bool>(showClassName.value);
    }
    if (showTime.present) {
      map['show_time'] = Variable<bool>(showTime.value);
    }
    if (offlineMode.present) {
      map['offline_mode'] = Variable<bool>(offlineMode.value);
    }
    if (retentionDays.present) {
      map['retention_days'] = Variable<int>(retentionDays.value);
    }
    if (lastStudentSync.present) {
      map['last_student_sync'] = Variable<DateTime>(lastStudentSync.value);
    }
    if (lastAttendanceSync.present) {
      map['last_attendance_sync'] =
          Variable<DateTime>(lastAttendanceSync.value);
    }
    if (apiEnabled.present) {
      map['api_enabled'] = Variable<bool>(apiEnabled.value);
    }
    if (apiBaseUrl.present) {
      map['api_base_url'] = Variable<String>(apiBaseUrl.value);
    }
    if (lastSyncAttempt.present) {
      map['last_sync_attempt'] = Variable<DateTime>(lastSyncAttempt.value);
    }
    if (lastSyncError.present) {
      map['last_sync_error'] = Variable<String>(lastSyncError.value);
    }
    if (voiceEnabled.present) {
      map['voice_enabled'] = Variable<bool>(voiceEnabled.value);
    }
    if (voiceSuccess.present) {
      map['voice_success'] = Variable<String>(voiceSuccess.value);
    }
    if (voiceLate.present) {
      map['voice_late'] = Variable<String>(voiceLate.value);
    }
    if (voiceDuplicate.present) {
      map['voice_duplicate'] = Variable<String>(voiceDuplicate.value);
    }
    if (voiceRefused.present) {
      map['voice_refused'] = Variable<String>(voiceRefused.value);
    }
    if (adminPinSalt.present) {
      map['admin_pin_salt'] = Variable<String>(adminPinSalt.value);
    }
    if (adminPinHash.present) {
      map['admin_pin_hash'] = Variable<String>(adminPinHash.value);
    }
    if (adminPinIterations.present) {
      map['admin_pin_iterations'] = Variable<int>(adminPinIterations.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SettingsCompanion(')
          ..write('id: $id, ')
          ..write('terminalId: $terminalId, ')
          ..write('terminalDisplayName: $terminalDisplayName, ')
          ..write('schoolId: $schoolId, ')
          ..write('schoolName: $schoolName, ')
          ..write('schoolLogoLocalPath: $schoolLogoLocalPath, ')
          ..write('timezone: $timezone, ')
          ..write('attendanceStartTime: $attendanceStartTime, ')
          ..write('lateAfterTime: $lateAfterTime, ')
          ..write('autoResetMillis: $autoResetMillis, ')
          ..write('soundEnabled: $soundEnabled, ')
          ..write('hapticsEnabled: $hapticsEnabled, ')
          ..write('animationsEnabled: $animationsEnabled, ')
          ..write('keepScreenOn: $keepScreenOn, ')
          ..write('cameraFacing: $cameraFacing, ')
          ..write('showPhoto: $showPhoto, ')
          ..write('showMatricule: $showMatricule, ')
          ..write('showClassName: $showClassName, ')
          ..write('showTime: $showTime, ')
          ..write('offlineMode: $offlineMode, ')
          ..write('retentionDays: $retentionDays, ')
          ..write('lastStudentSync: $lastStudentSync, ')
          ..write('lastAttendanceSync: $lastAttendanceSync, ')
          ..write('apiEnabled: $apiEnabled, ')
          ..write('apiBaseUrl: $apiBaseUrl, ')
          ..write('lastSyncAttempt: $lastSyncAttempt, ')
          ..write('lastSyncError: $lastSyncError, ')
          ..write('voiceEnabled: $voiceEnabled, ')
          ..write('voiceSuccess: $voiceSuccess, ')
          ..write('voiceLate: $voiceLate, ')
          ..write('voiceDuplicate: $voiceDuplicate, ')
          ..write('voiceRefused: $voiceRefused, ')
          ..write('adminPinSalt: $adminPinSalt, ')
          ..write('adminPinHash: $adminPinHash, ')
          ..write('adminPinIterations: $adminPinIterations')
          ..write(')'))
        .toString();
  }
}

class $SyncQueueTable extends SyncQueue
    with TableInfo<$SyncQueueTable, SyncQueueItem> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $SyncQueueTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
      'id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _eventTypeMeta =
      const VerificationMeta('eventType');
  @override
  late final GeneratedColumn<String> eventType = GeneratedColumn<String>(
      'event_type', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _entityIdMeta =
      const VerificationMeta('entityId');
  @override
  late final GeneratedColumn<String> entityId = GeneratedColumn<String>(
      'entity_id', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _payloadJsonMeta =
      const VerificationMeta('payloadJson');
  @override
  late final GeneratedColumn<String> payloadJson = GeneratedColumn<String>(
      'payload_json', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  static const VerificationMeta _retryCountMeta =
      const VerificationMeta('retryCount');
  @override
  late final GeneratedColumn<int> retryCount = GeneratedColumn<int>(
      'retry_count', aliasedName, false,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultValue: const Constant(0));
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
      'status', aliasedName, false,
      type: DriftSqlType.string,
      requiredDuringInsert: false,
      defaultValue: const Constant('pending'));
  static const VerificationMeta _lastAttemptAtMeta =
      const VerificationMeta('lastAttemptAt');
  @override
  late final GeneratedColumn<DateTime> lastAttemptAt =
      GeneratedColumn<DateTime>('last_attempt_at', aliasedName, true,
          type: DriftSqlType.dateTime, requiredDuringInsert: false);
  static const VerificationMeta _lastErrorMeta =
      const VerificationMeta('lastError');
  @override
  late final GeneratedColumn<String> lastError = GeneratedColumn<String>(
      'last_error', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  @override
  List<GeneratedColumn> get $columns => [
        id,
        eventType,
        entityId,
        payloadJson,
        createdAt,
        retryCount,
        status,
        lastAttemptAt,
        lastError
      ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'sync_queue';
  @override
  VerificationContext validateIntegrity(Insertable<SyncQueueItem> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('event_type')) {
      context.handle(_eventTypeMeta,
          eventType.isAcceptableOrUnknown(data['event_type']!, _eventTypeMeta));
    } else if (isInserting) {
      context.missing(_eventTypeMeta);
    }
    if (data.containsKey('entity_id')) {
      context.handle(_entityIdMeta,
          entityId.isAcceptableOrUnknown(data['entity_id']!, _entityIdMeta));
    } else if (isInserting) {
      context.missing(_entityIdMeta);
    }
    if (data.containsKey('payload_json')) {
      context.handle(
          _payloadJsonMeta,
          payloadJson.isAcceptableOrUnknown(
              data['payload_json']!, _payloadJsonMeta));
    } else if (isInserting) {
      context.missing(_payloadJsonMeta);
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('retry_count')) {
      context.handle(
          _retryCountMeta,
          retryCount.isAcceptableOrUnknown(
              data['retry_count']!, _retryCountMeta));
    }
    if (data.containsKey('status')) {
      context.handle(_statusMeta,
          status.isAcceptableOrUnknown(data['status']!, _statusMeta));
    }
    if (data.containsKey('last_attempt_at')) {
      context.handle(
          _lastAttemptAtMeta,
          lastAttemptAt.isAcceptableOrUnknown(
              data['last_attempt_at']!, _lastAttemptAtMeta));
    }
    if (data.containsKey('last_error')) {
      context.handle(_lastErrorMeta,
          lastError.isAcceptableOrUnknown(data['last_error']!, _lastErrorMeta));
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  SyncQueueItem map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return SyncQueueItem(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}id'])!,
      eventType: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}event_type'])!,
      entityId: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}entity_id'])!,
      payloadJson: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}payload_json'])!,
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
      retryCount: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}retry_count'])!,
      status: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}status'])!,
      lastAttemptAt: attachedDatabase.typeMapping.read(
          DriftSqlType.dateTime, data['${effectivePrefix}last_attempt_at']),
      lastError: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}last_error']),
    );
  }

  @override
  $SyncQueueTable createAlias(String alias) {
    return $SyncQueueTable(attachedDatabase, alias);
  }
}

class SyncQueueItem extends DataClass implements Insertable<SyncQueueItem> {
  final String id;
  final String eventType;
  final String entityId;
  final String payloadJson;
  final DateTime createdAt;
  final int retryCount;
  final String status;
  final DateTime? lastAttemptAt;
  final String? lastError;
  const SyncQueueItem(
      {required this.id,
      required this.eventType,
      required this.entityId,
      required this.payloadJson,
      required this.createdAt,
      required this.retryCount,
      required this.status,
      this.lastAttemptAt,
      this.lastError});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['event_type'] = Variable<String>(eventType);
    map['entity_id'] = Variable<String>(entityId);
    map['payload_json'] = Variable<String>(payloadJson);
    map['created_at'] = Variable<DateTime>(createdAt);
    map['retry_count'] = Variable<int>(retryCount);
    map['status'] = Variable<String>(status);
    if (!nullToAbsent || lastAttemptAt != null) {
      map['last_attempt_at'] = Variable<DateTime>(lastAttemptAt);
    }
    if (!nullToAbsent || lastError != null) {
      map['last_error'] = Variable<String>(lastError);
    }
    return map;
  }

  SyncQueueCompanion toCompanion(bool nullToAbsent) {
    return SyncQueueCompanion(
      id: Value(id),
      eventType: Value(eventType),
      entityId: Value(entityId),
      payloadJson: Value(payloadJson),
      createdAt: Value(createdAt),
      retryCount: Value(retryCount),
      status: Value(status),
      lastAttemptAt: lastAttemptAt == null && nullToAbsent
          ? const Value.absent()
          : Value(lastAttemptAt),
      lastError: lastError == null && nullToAbsent
          ? const Value.absent()
          : Value(lastError),
    );
  }

  factory SyncQueueItem.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return SyncQueueItem(
      id: serializer.fromJson<String>(json['id']),
      eventType: serializer.fromJson<String>(json['eventType']),
      entityId: serializer.fromJson<String>(json['entityId']),
      payloadJson: serializer.fromJson<String>(json['payloadJson']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      retryCount: serializer.fromJson<int>(json['retryCount']),
      status: serializer.fromJson<String>(json['status']),
      lastAttemptAt: serializer.fromJson<DateTime?>(json['lastAttemptAt']),
      lastError: serializer.fromJson<String?>(json['lastError']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'eventType': serializer.toJson<String>(eventType),
      'entityId': serializer.toJson<String>(entityId),
      'payloadJson': serializer.toJson<String>(payloadJson),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'retryCount': serializer.toJson<int>(retryCount),
      'status': serializer.toJson<String>(status),
      'lastAttemptAt': serializer.toJson<DateTime?>(lastAttemptAt),
      'lastError': serializer.toJson<String?>(lastError),
    };
  }

  SyncQueueItem copyWith(
          {String? id,
          String? eventType,
          String? entityId,
          String? payloadJson,
          DateTime? createdAt,
          int? retryCount,
          String? status,
          Value<DateTime?> lastAttemptAt = const Value.absent(),
          Value<String?> lastError = const Value.absent()}) =>
      SyncQueueItem(
        id: id ?? this.id,
        eventType: eventType ?? this.eventType,
        entityId: entityId ?? this.entityId,
        payloadJson: payloadJson ?? this.payloadJson,
        createdAt: createdAt ?? this.createdAt,
        retryCount: retryCount ?? this.retryCount,
        status: status ?? this.status,
        lastAttemptAt:
            lastAttemptAt.present ? lastAttemptAt.value : this.lastAttemptAt,
        lastError: lastError.present ? lastError.value : this.lastError,
      );
  SyncQueueItem copyWithCompanion(SyncQueueCompanion data) {
    return SyncQueueItem(
      id: data.id.present ? data.id.value : this.id,
      eventType: data.eventType.present ? data.eventType.value : this.eventType,
      entityId: data.entityId.present ? data.entityId.value : this.entityId,
      payloadJson:
          data.payloadJson.present ? data.payloadJson.value : this.payloadJson,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      retryCount:
          data.retryCount.present ? data.retryCount.value : this.retryCount,
      status: data.status.present ? data.status.value : this.status,
      lastAttemptAt: data.lastAttemptAt.present
          ? data.lastAttemptAt.value
          : this.lastAttemptAt,
      lastError: data.lastError.present ? data.lastError.value : this.lastError,
    );
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueItem(')
          ..write('id: $id, ')
          ..write('eventType: $eventType, ')
          ..write('entityId: $entityId, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('lastAttemptAt: $lastAttemptAt, ')
          ..write('lastError: $lastError')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, eventType, entityId, payloadJson,
      createdAt, retryCount, status, lastAttemptAt, lastError);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is SyncQueueItem &&
          other.id == this.id &&
          other.eventType == this.eventType &&
          other.entityId == this.entityId &&
          other.payloadJson == this.payloadJson &&
          other.createdAt == this.createdAt &&
          other.retryCount == this.retryCount &&
          other.status == this.status &&
          other.lastAttemptAt == this.lastAttemptAt &&
          other.lastError == this.lastError);
}

class SyncQueueCompanion extends UpdateCompanion<SyncQueueItem> {
  final Value<String> id;
  final Value<String> eventType;
  final Value<String> entityId;
  final Value<String> payloadJson;
  final Value<DateTime> createdAt;
  final Value<int> retryCount;
  final Value<String> status;
  final Value<DateTime?> lastAttemptAt;
  final Value<String?> lastError;
  final Value<int> rowid;
  const SyncQueueCompanion({
    this.id = const Value.absent(),
    this.eventType = const Value.absent(),
    this.entityId = const Value.absent(),
    this.payloadJson = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.lastAttemptAt = const Value.absent(),
    this.lastError = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  SyncQueueCompanion.insert({
    required String id,
    required String eventType,
    required String entityId,
    required String payloadJson,
    required DateTime createdAt,
    this.retryCount = const Value.absent(),
    this.status = const Value.absent(),
    this.lastAttemptAt = const Value.absent(),
    this.lastError = const Value.absent(),
    this.rowid = const Value.absent(),
  })  : id = Value(id),
        eventType = Value(eventType),
        entityId = Value(entityId),
        payloadJson = Value(payloadJson),
        createdAt = Value(createdAt);
  static Insertable<SyncQueueItem> custom({
    Expression<String>? id,
    Expression<String>? eventType,
    Expression<String>? entityId,
    Expression<String>? payloadJson,
    Expression<DateTime>? createdAt,
    Expression<int>? retryCount,
    Expression<String>? status,
    Expression<DateTime>? lastAttemptAt,
    Expression<String>? lastError,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (eventType != null) 'event_type': eventType,
      if (entityId != null) 'entity_id': entityId,
      if (payloadJson != null) 'payload_json': payloadJson,
      if (createdAt != null) 'created_at': createdAt,
      if (retryCount != null) 'retry_count': retryCount,
      if (status != null) 'status': status,
      if (lastAttemptAt != null) 'last_attempt_at': lastAttemptAt,
      if (lastError != null) 'last_error': lastError,
      if (rowid != null) 'rowid': rowid,
    });
  }

  SyncQueueCompanion copyWith(
      {Value<String>? id,
      Value<String>? eventType,
      Value<String>? entityId,
      Value<String>? payloadJson,
      Value<DateTime>? createdAt,
      Value<int>? retryCount,
      Value<String>? status,
      Value<DateTime?>? lastAttemptAt,
      Value<String?>? lastError,
      Value<int>? rowid}) {
    return SyncQueueCompanion(
      id: id ?? this.id,
      eventType: eventType ?? this.eventType,
      entityId: entityId ?? this.entityId,
      payloadJson: payloadJson ?? this.payloadJson,
      createdAt: createdAt ?? this.createdAt,
      retryCount: retryCount ?? this.retryCount,
      status: status ?? this.status,
      lastAttemptAt: lastAttemptAt ?? this.lastAttemptAt,
      lastError: lastError ?? this.lastError,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (eventType.present) {
      map['event_type'] = Variable<String>(eventType.value);
    }
    if (entityId.present) {
      map['entity_id'] = Variable<String>(entityId.value);
    }
    if (payloadJson.present) {
      map['payload_json'] = Variable<String>(payloadJson.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (retryCount.present) {
      map['retry_count'] = Variable<int>(retryCount.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (lastAttemptAt.present) {
      map['last_attempt_at'] = Variable<DateTime>(lastAttemptAt.value);
    }
    if (lastError.present) {
      map['last_error'] = Variable<String>(lastError.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('SyncQueueCompanion(')
          ..write('id: $id, ')
          ..write('eventType: $eventType, ')
          ..write('entityId: $entityId, ')
          ..write('payloadJson: $payloadJson, ')
          ..write('createdAt: $createdAt, ')
          ..write('retryCount: $retryCount, ')
          ..write('status: $status, ')
          ..write('lastAttemptAt: $lastAttemptAt, ')
          ..write('lastError: $lastError, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $TerminalLogsTable extends TerminalLogs
    with TableInfo<$TerminalLogsTable, TerminalLog> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $TerminalLogsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<int> id = GeneratedColumn<int>(
      'id', aliasedName, false,
      hasAutoIncrement: true,
      type: DriftSqlType.int,
      requiredDuringInsert: false,
      defaultConstraints:
          GeneratedColumn.constraintIsAlways('PRIMARY KEY AUTOINCREMENT'));
  static const VerificationMeta _levelMeta = const VerificationMeta('level');
  @override
  late final GeneratedColumn<String> level = GeneratedColumn<String>(
      'level', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _eventMeta = const VerificationMeta('event');
  @override
  late final GeneratedColumn<String> event = GeneratedColumn<String>(
      'event', aliasedName, false,
      type: DriftSqlType.string, requiredDuringInsert: true);
  static const VerificationMeta _detailsMeta =
      const VerificationMeta('details');
  @override
  late final GeneratedColumn<String> details = GeneratedColumn<String>(
      'details', aliasedName, true,
      type: DriftSqlType.string, requiredDuringInsert: false);
  static const VerificationMeta _createdAtMeta =
      const VerificationMeta('createdAt');
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
      'created_at', aliasedName, false,
      type: DriftSqlType.dateTime, requiredDuringInsert: true);
  @override
  List<GeneratedColumn> get $columns => [id, level, event, details, createdAt];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'terminal_logs';
  @override
  VerificationContext validateIntegrity(Insertable<TerminalLog> instance,
      {bool isInserting = false}) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    }
    if (data.containsKey('level')) {
      context.handle(
          _levelMeta, level.isAcceptableOrUnknown(data['level']!, _levelMeta));
    } else if (isInserting) {
      context.missing(_levelMeta);
    }
    if (data.containsKey('event')) {
      context.handle(
          _eventMeta, event.isAcceptableOrUnknown(data['event']!, _eventMeta));
    } else if (isInserting) {
      context.missing(_eventMeta);
    }
    if (data.containsKey('details')) {
      context.handle(_detailsMeta,
          details.isAcceptableOrUnknown(data['details']!, _detailsMeta));
    }
    if (data.containsKey('created_at')) {
      context.handle(_createdAtMeta,
          createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta));
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  TerminalLog map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return TerminalLog(
      id: attachedDatabase.typeMapping
          .read(DriftSqlType.int, data['${effectivePrefix}id'])!,
      level: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}level'])!,
      event: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}event'])!,
      details: attachedDatabase.typeMapping
          .read(DriftSqlType.string, data['${effectivePrefix}details']),
      createdAt: attachedDatabase.typeMapping
          .read(DriftSqlType.dateTime, data['${effectivePrefix}created_at'])!,
    );
  }

  @override
  $TerminalLogsTable createAlias(String alias) {
    return $TerminalLogsTable(attachedDatabase, alias);
  }
}

class TerminalLog extends DataClass implements Insertable<TerminalLog> {
  final int id;
  final String level;
  final String event;
  final String? details;
  final DateTime createdAt;
  const TerminalLog(
      {required this.id,
      required this.level,
      required this.event,
      this.details,
      required this.createdAt});
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<int>(id);
    map['level'] = Variable<String>(level);
    map['event'] = Variable<String>(event);
    if (!nullToAbsent || details != null) {
      map['details'] = Variable<String>(details);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    return map;
  }

  TerminalLogsCompanion toCompanion(bool nullToAbsent) {
    return TerminalLogsCompanion(
      id: Value(id),
      level: Value(level),
      event: Value(event),
      details: details == null && nullToAbsent
          ? const Value.absent()
          : Value(details),
      createdAt: Value(createdAt),
    );
  }

  factory TerminalLog.fromJson(Map<String, dynamic> json,
      {ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return TerminalLog(
      id: serializer.fromJson<int>(json['id']),
      level: serializer.fromJson<String>(json['level']),
      event: serializer.fromJson<String>(json['event']),
      details: serializer.fromJson<String?>(json['details']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<int>(id),
      'level': serializer.toJson<String>(level),
      'event': serializer.toJson<String>(event),
      'details': serializer.toJson<String?>(details),
      'createdAt': serializer.toJson<DateTime>(createdAt),
    };
  }

  TerminalLog copyWith(
          {int? id,
          String? level,
          String? event,
          Value<String?> details = const Value.absent(),
          DateTime? createdAt}) =>
      TerminalLog(
        id: id ?? this.id,
        level: level ?? this.level,
        event: event ?? this.event,
        details: details.present ? details.value : this.details,
        createdAt: createdAt ?? this.createdAt,
      );
  TerminalLog copyWithCompanion(TerminalLogsCompanion data) {
    return TerminalLog(
      id: data.id.present ? data.id.value : this.id,
      level: data.level.present ? data.level.value : this.level,
      event: data.event.present ? data.event.value : this.event,
      details: data.details.present ? data.details.value : this.details,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('TerminalLog(')
          ..write('id: $id, ')
          ..write('level: $level, ')
          ..write('event: $event, ')
          ..write('details: $details, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, level, event, details, createdAt);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is TerminalLog &&
          other.id == this.id &&
          other.level == this.level &&
          other.event == this.event &&
          other.details == this.details &&
          other.createdAt == this.createdAt);
}

class TerminalLogsCompanion extends UpdateCompanion<TerminalLog> {
  final Value<int> id;
  final Value<String> level;
  final Value<String> event;
  final Value<String?> details;
  final Value<DateTime> createdAt;
  const TerminalLogsCompanion({
    this.id = const Value.absent(),
    this.level = const Value.absent(),
    this.event = const Value.absent(),
    this.details = const Value.absent(),
    this.createdAt = const Value.absent(),
  });
  TerminalLogsCompanion.insert({
    this.id = const Value.absent(),
    required String level,
    required String event,
    this.details = const Value.absent(),
    required DateTime createdAt,
  })  : level = Value(level),
        event = Value(event),
        createdAt = Value(createdAt);
  static Insertable<TerminalLog> custom({
    Expression<int>? id,
    Expression<String>? level,
    Expression<String>? event,
    Expression<String>? details,
    Expression<DateTime>? createdAt,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (level != null) 'level': level,
      if (event != null) 'event': event,
      if (details != null) 'details': details,
      if (createdAt != null) 'created_at': createdAt,
    });
  }

  TerminalLogsCompanion copyWith(
      {Value<int>? id,
      Value<String>? level,
      Value<String>? event,
      Value<String?>? details,
      Value<DateTime>? createdAt}) {
    return TerminalLogsCompanion(
      id: id ?? this.id,
      level: level ?? this.level,
      event: event ?? this.event,
      details: details ?? this.details,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<int>(id.value);
    }
    if (level.present) {
      map['level'] = Variable<String>(level.value);
    }
    if (event.present) {
      map['event'] = Variable<String>(event.value);
    }
    if (details.present) {
      map['details'] = Variable<String>(details.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('TerminalLogsCompanion(')
          ..write('id: $id, ')
          ..write('level: $level, ')
          ..write('event: $event, ')
          ..write('details: $details, ')
          ..write('createdAt: $createdAt')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $StudentsTable students = $StudentsTable(this);
  late final $StaffMembersTable staffMembers = $StaffMembersTable(this);
  late final $SchoolClassesTable schoolClasses = $SchoolClassesTable(this);
  late final $AttendanceRecordsTable attendanceRecords =
      $AttendanceRecordsTable(this);
  late final $SettingsTable settings = $SettingsTable(this);
  late final $SyncQueueTable syncQueue = $SyncQueueTable(this);
  late final $TerminalLogsTable terminalLogs = $TerminalLogsTable(this);
  late final Index idxStudentsQrToken = Index('idx_students_qr_token',
      'CREATE UNIQUE INDEX idx_students_qr_token ON students (qr_token)');
  late final Index idxStudentsCode = Index('idx_students_code',
      'CREATE UNIQUE INDEX idx_students_code ON students (student_code)');
  late final Index idxStudentsClass = Index('idx_students_class',
      'CREATE INDEX idx_students_class ON students (class_id)');
  late final Index idxStudentsName = Index('idx_students_name',
      'CREATE INDEX idx_students_name ON students (last_name, first_name)');
  late final Index idxStaffQrToken = Index('idx_staff_qr_token',
      'CREATE UNIQUE INDEX idx_staff_qr_token ON staff_members (qr_token)');
  late final Index idxStaffCode = Index('idx_staff_code',
      'CREATE UNIQUE INDEX idx_staff_code ON staff_members (staff_code)');
  late final Index idxStaffName = Index('idx_staff_name',
      'CREATE INDEX idx_staff_name ON staff_members (last_name, first_name)');
  late final Index idxClassesRemote = Index('idx_classes_remote',
      'CREATE INDEX idx_classes_remote ON school_classes (remote_id)');
  late final Index idxAttendanceStudentSession = Index(
      'idx_attendance_student_session',
      'CREATE UNIQUE INDEX idx_attendance_student_session ON attendance_records (student_id, local_date, session)');
  late final Index idxAttendanceDate = Index('idx_attendance_date',
      'CREATE INDEX idx_attendance_date ON attendance_records (local_date)');
  late final Index idxAttendanceSync = Index('idx_attendance_sync',
      'CREATE INDEX idx_attendance_sync ON attendance_records (sync_status)');
  late final Index idxAttendanceCode = Index('idx_attendance_code',
      'CREATE INDEX idx_attendance_code ON attendance_records (student_code)');
  late final Index idxAttendanceClass = Index('idx_attendance_class',
      'CREATE INDEX idx_attendance_class ON attendance_records (class_id)');
  late final Index idxSyncStatus = Index(
      'idx_sync_status', 'CREATE INDEX idx_sync_status ON sync_queue (status)');
  late final Index idxSyncEntity = Index('idx_sync_entity',
      'CREATE INDEX idx_sync_entity ON sync_queue (entity_id)');
  late final Index idxLogsCreated = Index('idx_logs_created',
      'CREATE INDEX idx_logs_created ON terminal_logs (created_at)');
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
        students,
        staffMembers,
        schoolClasses,
        attendanceRecords,
        settings,
        syncQueue,
        terminalLogs,
        idxStudentsQrToken,
        idxStudentsCode,
        idxStudentsClass,
        idxStudentsName,
        idxStaffQrToken,
        idxStaffCode,
        idxStaffName,
        idxClassesRemote,
        idxAttendanceStudentSession,
        idxAttendanceDate,
        idxAttendanceSync,
        idxAttendanceCode,
        idxAttendanceClass,
        idxSyncStatus,
        idxSyncEntity,
        idxLogsCreated
      ];
}

typedef $$StudentsTableCreateCompanionBuilder = StudentsCompanion Function({
  required String id,
  Value<String?> studentUuid,
  required String studentCode,
  Value<String> firstName,
  Value<String> lastName,
  Value<String?> classId,
  Value<String> className,
  Value<String?> photoLocalPath,
  Value<String?> photoRemoteUrl,
  required String qrToken,
  Value<bool> isActive,
  Value<bool> badgeRevoked,
  Value<bool> isDemo,
  required DateTime updatedAt,
  Value<DateTime?> lastSyncedAt,
  Value<int> rowid,
});
typedef $$StudentsTableUpdateCompanionBuilder = StudentsCompanion Function({
  Value<String> id,
  Value<String?> studentUuid,
  Value<String> studentCode,
  Value<String> firstName,
  Value<String> lastName,
  Value<String?> classId,
  Value<String> className,
  Value<String?> photoLocalPath,
  Value<String?> photoRemoteUrl,
  Value<String> qrToken,
  Value<bool> isActive,
  Value<bool> badgeRevoked,
  Value<bool> isDemo,
  Value<DateTime> updatedAt,
  Value<DateTime?> lastSyncedAt,
  Value<int> rowid,
});

class $$StudentsTableFilterComposer
    extends Composer<_$AppDatabase, $StudentsTable> {
  $$StudentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get classId => $composableBuilder(
      column: $table.classId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get className => $composableBuilder(
      column: $table.className, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get qrToken => $composableBuilder(
      column: $table.qrToken, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isActive => $composableBuilder(
      column: $table.isActive, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isDemo => $composableBuilder(
      column: $table.isDemo, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt, builder: (column) => ColumnFilters(column));
}

class $$StudentsTableOrderingComposer
    extends Composer<_$AppDatabase, $StudentsTable> {
  $$StudentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get classId => $composableBuilder(
      column: $table.classId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get className => $composableBuilder(
      column: $table.className, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get qrToken => $composableBuilder(
      column: $table.qrToken, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isActive => $composableBuilder(
      column: $table.isActive, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isDemo => $composableBuilder(
      column: $table.isDemo, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt,
      builder: (column) => ColumnOrderings(column));
}

class $$StudentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $StudentsTable> {
  $$StudentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => column);

  GeneratedColumn<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => column);

  GeneratedColumn<String> get firstName =>
      $composableBuilder(column: $table.firstName, builder: (column) => column);

  GeneratedColumn<String> get lastName =>
      $composableBuilder(column: $table.lastName, builder: (column) => column);

  GeneratedColumn<String> get classId =>
      $composableBuilder(column: $table.classId, builder: (column) => column);

  GeneratedColumn<String> get className =>
      $composableBuilder(column: $table.className, builder: (column) => column);

  GeneratedColumn<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath, builder: (column) => column);

  GeneratedColumn<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl, builder: (column) => column);

  GeneratedColumn<String> get qrToken =>
      $composableBuilder(column: $table.qrToken, builder: (column) => column);

  GeneratedColumn<bool> get isActive =>
      $composableBuilder(column: $table.isActive, builder: (column) => column);

  GeneratedColumn<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked, builder: (column) => column);

  GeneratedColumn<bool> get isDemo =>
      $composableBuilder(column: $table.isDemo, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt, builder: (column) => column);
}

class $$StudentsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $StudentsTable,
    Student,
    $$StudentsTableFilterComposer,
    $$StudentsTableOrderingComposer,
    $$StudentsTableAnnotationComposer,
    $$StudentsTableCreateCompanionBuilder,
    $$StudentsTableUpdateCompanionBuilder,
    (Student, BaseReferences<_$AppDatabase, $StudentsTable, Student>),
    Student,
    PrefetchHooks Function()> {
  $$StudentsTableTableManager(_$AppDatabase db, $StudentsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$StudentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$StudentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$StudentsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String?> studentUuid = const Value.absent(),
            Value<String> studentCode = const Value.absent(),
            Value<String> firstName = const Value.absent(),
            Value<String> lastName = const Value.absent(),
            Value<String?> classId = const Value.absent(),
            Value<String> className = const Value.absent(),
            Value<String?> photoLocalPath = const Value.absent(),
            Value<String?> photoRemoteUrl = const Value.absent(),
            Value<String> qrToken = const Value.absent(),
            Value<bool> isActive = const Value.absent(),
            Value<bool> badgeRevoked = const Value.absent(),
            Value<bool> isDemo = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<DateTime?> lastSyncedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              StudentsCompanion(
            id: id,
            studentUuid: studentUuid,
            studentCode: studentCode,
            firstName: firstName,
            lastName: lastName,
            classId: classId,
            className: className,
            photoLocalPath: photoLocalPath,
            photoRemoteUrl: photoRemoteUrl,
            qrToken: qrToken,
            isActive: isActive,
            badgeRevoked: badgeRevoked,
            isDemo: isDemo,
            updatedAt: updatedAt,
            lastSyncedAt: lastSyncedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String?> studentUuid = const Value.absent(),
            required String studentCode,
            Value<String> firstName = const Value.absent(),
            Value<String> lastName = const Value.absent(),
            Value<String?> classId = const Value.absent(),
            Value<String> className = const Value.absent(),
            Value<String?> photoLocalPath = const Value.absent(),
            Value<String?> photoRemoteUrl = const Value.absent(),
            required String qrToken,
            Value<bool> isActive = const Value.absent(),
            Value<bool> badgeRevoked = const Value.absent(),
            Value<bool> isDemo = const Value.absent(),
            required DateTime updatedAt,
            Value<DateTime?> lastSyncedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              StudentsCompanion.insert(
            id: id,
            studentUuid: studentUuid,
            studentCode: studentCode,
            firstName: firstName,
            lastName: lastName,
            classId: classId,
            className: className,
            photoLocalPath: photoLocalPath,
            photoRemoteUrl: photoRemoteUrl,
            qrToken: qrToken,
            isActive: isActive,
            badgeRevoked: badgeRevoked,
            isDemo: isDemo,
            updatedAt: updatedAt,
            lastSyncedAt: lastSyncedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$StudentsTable, Student>(table),
                    BaseReferences<_$AppDatabase, $StudentsTable, Student>(
                        db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$StudentsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $StudentsTable,
    Student,
    $$StudentsTableFilterComposer,
    $$StudentsTableOrderingComposer,
    $$StudentsTableAnnotationComposer,
    $$StudentsTableCreateCompanionBuilder,
    $$StudentsTableUpdateCompanionBuilder,
    (Student, BaseReferences<_$AppDatabase, $StudentsTable, Student>),
    Student,
    PrefetchHooks Function()>;
typedef $$StaffMembersTableCreateCompanionBuilder = StaffMembersCompanion
    Function({
  required String id,
  Value<String?> staffUuid,
  required String staffCode,
  Value<String> firstName,
  Value<String> lastName,
  Value<String> staffType,
  Value<String> roleLabel,
  Value<String?> photoLocalPath,
  Value<String?> photoRemoteUrl,
  required String qrToken,
  Value<bool> isActive,
  Value<bool> badgeRevoked,
  required DateTime updatedAt,
  Value<DateTime?> lastSyncedAt,
  Value<int> rowid,
});
typedef $$StaffMembersTableUpdateCompanionBuilder = StaffMembersCompanion
    Function({
  Value<String> id,
  Value<String?> staffUuid,
  Value<String> staffCode,
  Value<String> firstName,
  Value<String> lastName,
  Value<String> staffType,
  Value<String> roleLabel,
  Value<String?> photoLocalPath,
  Value<String?> photoRemoteUrl,
  Value<String> qrToken,
  Value<bool> isActive,
  Value<bool> badgeRevoked,
  Value<DateTime> updatedAt,
  Value<DateTime?> lastSyncedAt,
  Value<int> rowid,
});

class $$StaffMembersTableFilterComposer
    extends Composer<_$AppDatabase, $StaffMembersTable> {
  $$StaffMembersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get staffUuid => $composableBuilder(
      column: $table.staffUuid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get staffCode => $composableBuilder(
      column: $table.staffCode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get staffType => $composableBuilder(
      column: $table.staffType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get roleLabel => $composableBuilder(
      column: $table.roleLabel, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get qrToken => $composableBuilder(
      column: $table.qrToken, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get isActive => $composableBuilder(
      column: $table.isActive, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt, builder: (column) => ColumnFilters(column));
}

class $$StaffMembersTableOrderingComposer
    extends Composer<_$AppDatabase, $StaffMembersTable> {
  $$StaffMembersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get staffUuid => $composableBuilder(
      column: $table.staffUuid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get staffCode => $composableBuilder(
      column: $table.staffCode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get firstName => $composableBuilder(
      column: $table.firstName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastName => $composableBuilder(
      column: $table.lastName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get staffType => $composableBuilder(
      column: $table.staffType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get roleLabel => $composableBuilder(
      column: $table.roleLabel, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get qrToken => $composableBuilder(
      column: $table.qrToken, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get isActive => $composableBuilder(
      column: $table.isActive, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt,
      builder: (column) => ColumnOrderings(column));
}

class $$StaffMembersTableAnnotationComposer
    extends Composer<_$AppDatabase, $StaffMembersTable> {
  $$StaffMembersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get staffUuid =>
      $composableBuilder(column: $table.staffUuid, builder: (column) => column);

  GeneratedColumn<String> get staffCode =>
      $composableBuilder(column: $table.staffCode, builder: (column) => column);

  GeneratedColumn<String> get firstName =>
      $composableBuilder(column: $table.firstName, builder: (column) => column);

  GeneratedColumn<String> get lastName =>
      $composableBuilder(column: $table.lastName, builder: (column) => column);

  GeneratedColumn<String> get staffType =>
      $composableBuilder(column: $table.staffType, builder: (column) => column);

  GeneratedColumn<String> get roleLabel =>
      $composableBuilder(column: $table.roleLabel, builder: (column) => column);

  GeneratedColumn<String> get photoLocalPath => $composableBuilder(
      column: $table.photoLocalPath, builder: (column) => column);

  GeneratedColumn<String> get photoRemoteUrl => $composableBuilder(
      column: $table.photoRemoteUrl, builder: (column) => column);

  GeneratedColumn<String> get qrToken =>
      $composableBuilder(column: $table.qrToken, builder: (column) => column);

  GeneratedColumn<bool> get isActive =>
      $composableBuilder(column: $table.isActive, builder: (column) => column);

  GeneratedColumn<bool> get badgeRevoked => $composableBuilder(
      column: $table.badgeRevoked, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);

  GeneratedColumn<DateTime> get lastSyncedAt => $composableBuilder(
      column: $table.lastSyncedAt, builder: (column) => column);
}

class $$StaffMembersTableTableManager extends RootTableManager<
    _$AppDatabase,
    $StaffMembersTable,
    StaffMember,
    $$StaffMembersTableFilterComposer,
    $$StaffMembersTableOrderingComposer,
    $$StaffMembersTableAnnotationComposer,
    $$StaffMembersTableCreateCompanionBuilder,
    $$StaffMembersTableUpdateCompanionBuilder,
    (
      StaffMember,
      BaseReferences<_$AppDatabase, $StaffMembersTable, StaffMember>
    ),
    StaffMember,
    PrefetchHooks Function()> {
  $$StaffMembersTableTableManager(_$AppDatabase db, $StaffMembersTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$StaffMembersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$StaffMembersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$StaffMembersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String?> staffUuid = const Value.absent(),
            Value<String> staffCode = const Value.absent(),
            Value<String> firstName = const Value.absent(),
            Value<String> lastName = const Value.absent(),
            Value<String> staffType = const Value.absent(),
            Value<String> roleLabel = const Value.absent(),
            Value<String?> photoLocalPath = const Value.absent(),
            Value<String?> photoRemoteUrl = const Value.absent(),
            Value<String> qrToken = const Value.absent(),
            Value<bool> isActive = const Value.absent(),
            Value<bool> badgeRevoked = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<DateTime?> lastSyncedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              StaffMembersCompanion(
            id: id,
            staffUuid: staffUuid,
            staffCode: staffCode,
            firstName: firstName,
            lastName: lastName,
            staffType: staffType,
            roleLabel: roleLabel,
            photoLocalPath: photoLocalPath,
            photoRemoteUrl: photoRemoteUrl,
            qrToken: qrToken,
            isActive: isActive,
            badgeRevoked: badgeRevoked,
            updatedAt: updatedAt,
            lastSyncedAt: lastSyncedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String?> staffUuid = const Value.absent(),
            required String staffCode,
            Value<String> firstName = const Value.absent(),
            Value<String> lastName = const Value.absent(),
            Value<String> staffType = const Value.absent(),
            Value<String> roleLabel = const Value.absent(),
            Value<String?> photoLocalPath = const Value.absent(),
            Value<String?> photoRemoteUrl = const Value.absent(),
            required String qrToken,
            Value<bool> isActive = const Value.absent(),
            Value<bool> badgeRevoked = const Value.absent(),
            required DateTime updatedAt,
            Value<DateTime?> lastSyncedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              StaffMembersCompanion.insert(
            id: id,
            staffUuid: staffUuid,
            staffCode: staffCode,
            firstName: firstName,
            lastName: lastName,
            staffType: staffType,
            roleLabel: roleLabel,
            photoLocalPath: photoLocalPath,
            photoRemoteUrl: photoRemoteUrl,
            qrToken: qrToken,
            isActive: isActive,
            badgeRevoked: badgeRevoked,
            updatedAt: updatedAt,
            lastSyncedAt: lastSyncedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$StaffMembersTable, StaffMember>(table),
                    BaseReferences<_$AppDatabase, $StaffMembersTable,
                        StaffMember>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$StaffMembersTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $StaffMembersTable,
    StaffMember,
    $$StaffMembersTableFilterComposer,
    $$StaffMembersTableOrderingComposer,
    $$StaffMembersTableAnnotationComposer,
    $$StaffMembersTableCreateCompanionBuilder,
    $$StaffMembersTableUpdateCompanionBuilder,
    (
      StaffMember,
      BaseReferences<_$AppDatabase, $StaffMembersTable, StaffMember>
    ),
    StaffMember,
    PrefetchHooks Function()>;
typedef $$SchoolClassesTableCreateCompanionBuilder = SchoolClassesCompanion
    Function({
  required String id,
  Value<String?> remoteId,
  required String name,
  Value<String?> level,
  required DateTime updatedAt,
  Value<int> rowid,
});
typedef $$SchoolClassesTableUpdateCompanionBuilder = SchoolClassesCompanion
    Function({
  Value<String> id,
  Value<String?> remoteId,
  Value<String> name,
  Value<String?> level,
  Value<DateTime> updatedAt,
  Value<int> rowid,
});

class $$SchoolClassesTableFilterComposer
    extends Composer<_$AppDatabase, $SchoolClassesTable> {
  $$SchoolClassesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get remoteId => $composableBuilder(
      column: $table.remoteId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get level => $composableBuilder(
      column: $table.level, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnFilters(column));
}

class $$SchoolClassesTableOrderingComposer
    extends Composer<_$AppDatabase, $SchoolClassesTable> {
  $$SchoolClassesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get remoteId => $composableBuilder(
      column: $table.remoteId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get name => $composableBuilder(
      column: $table.name, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get level => $composableBuilder(
      column: $table.level, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get updatedAt => $composableBuilder(
      column: $table.updatedAt, builder: (column) => ColumnOrderings(column));
}

class $$SchoolClassesTableAnnotationComposer
    extends Composer<_$AppDatabase, $SchoolClassesTable> {
  $$SchoolClassesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get remoteId =>
      $composableBuilder(column: $table.remoteId, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get level =>
      $composableBuilder(column: $table.level, builder: (column) => column);

  GeneratedColumn<DateTime> get updatedAt =>
      $composableBuilder(column: $table.updatedAt, builder: (column) => column);
}

class $$SchoolClassesTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SchoolClassesTable,
    SchoolClass,
    $$SchoolClassesTableFilterComposer,
    $$SchoolClassesTableOrderingComposer,
    $$SchoolClassesTableAnnotationComposer,
    $$SchoolClassesTableCreateCompanionBuilder,
    $$SchoolClassesTableUpdateCompanionBuilder,
    (
      SchoolClass,
      BaseReferences<_$AppDatabase, $SchoolClassesTable, SchoolClass>
    ),
    SchoolClass,
    PrefetchHooks Function()> {
  $$SchoolClassesTableTableManager(_$AppDatabase db, $SchoolClassesTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SchoolClassesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SchoolClassesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SchoolClassesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String?> remoteId = const Value.absent(),
            Value<String> name = const Value.absent(),
            Value<String?> level = const Value.absent(),
            Value<DateTime> updatedAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SchoolClassesCompanion(
            id: id,
            remoteId: remoteId,
            name: name,
            level: level,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            Value<String?> remoteId = const Value.absent(),
            required String name,
            Value<String?> level = const Value.absent(),
            required DateTime updatedAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              SchoolClassesCompanion.insert(
            id: id,
            remoteId: remoteId,
            name: name,
            level: level,
            updatedAt: updatedAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$SchoolClassesTable, SchoolClass>(table),
                    BaseReferences<_$AppDatabase, $SchoolClassesTable,
                        SchoolClass>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SchoolClassesTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SchoolClassesTable,
    SchoolClass,
    $$SchoolClassesTableFilterComposer,
    $$SchoolClassesTableOrderingComposer,
    $$SchoolClassesTableAnnotationComposer,
    $$SchoolClassesTableCreateCompanionBuilder,
    $$SchoolClassesTableUpdateCompanionBuilder,
    (
      SchoolClass,
      BaseReferences<_$AppDatabase, $SchoolClassesTable, SchoolClass>
    ),
    SchoolClass,
    PrefetchHooks Function()>;
typedef $$AttendanceRecordsTableCreateCompanionBuilder
    = AttendanceRecordsCompanion Function({
  required String id,
  required String studentId,
  Value<String> personType,
  Value<String?> studentUuid,
  required String studentCode,
  Value<String?> classId,
  Value<String> className,
  required DateTime scannedAtUtc,
  required String localDate,
  required int localMinutes,
  Value<String> session,
  required String attendanceStatus,
  required String terminalId,
  Value<String> source,
  Value<String> syncStatus,
  Value<DateTime?> syncedAt,
  Value<String?> serverRecordId,
  Value<int> retryCount,
  Value<String?> lastSyncError,
  required DateTime createdAt,
  Value<int> rowid,
});
typedef $$AttendanceRecordsTableUpdateCompanionBuilder
    = AttendanceRecordsCompanion Function({
  Value<String> id,
  Value<String> studentId,
  Value<String> personType,
  Value<String?> studentUuid,
  Value<String> studentCode,
  Value<String?> classId,
  Value<String> className,
  Value<DateTime> scannedAtUtc,
  Value<String> localDate,
  Value<int> localMinutes,
  Value<String> session,
  Value<String> attendanceStatus,
  Value<String> terminalId,
  Value<String> source,
  Value<String> syncStatus,
  Value<DateTime?> syncedAt,
  Value<String?> serverRecordId,
  Value<int> retryCount,
  Value<String?> lastSyncError,
  Value<DateTime> createdAt,
  Value<int> rowid,
});

class $$AttendanceRecordsTableFilterComposer
    extends Composer<_$AppDatabase, $AttendanceRecordsTable> {
  $$AttendanceRecordsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentId => $composableBuilder(
      column: $table.studentId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get personType => $composableBuilder(
      column: $table.personType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get classId => $composableBuilder(
      column: $table.classId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get className => $composableBuilder(
      column: $table.className, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get scannedAtUtc => $composableBuilder(
      column: $table.scannedAtUtc, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get localDate => $composableBuilder(
      column: $table.localDate, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get localMinutes => $composableBuilder(
      column: $table.localMinutes, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get session => $composableBuilder(
      column: $table.session, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get attendanceStatus => $composableBuilder(
      column: $table.attendanceStatus,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get source => $composableBuilder(
      column: $table.source, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get syncedAt => $composableBuilder(
      column: $table.syncedAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get serverRecordId => $composableBuilder(
      column: $table.serverRecordId,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));
}

class $$AttendanceRecordsTableOrderingComposer
    extends Composer<_$AppDatabase, $AttendanceRecordsTable> {
  $$AttendanceRecordsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentId => $composableBuilder(
      column: $table.studentId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get personType => $composableBuilder(
      column: $table.personType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get classId => $composableBuilder(
      column: $table.classId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get className => $composableBuilder(
      column: $table.className, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get scannedAtUtc => $composableBuilder(
      column: $table.scannedAtUtc,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get localDate => $composableBuilder(
      column: $table.localDate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get localMinutes => $composableBuilder(
      column: $table.localMinutes,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get session => $composableBuilder(
      column: $table.session, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get attendanceStatus => $composableBuilder(
      column: $table.attendanceStatus,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get source => $composableBuilder(
      column: $table.source, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get syncedAt => $composableBuilder(
      column: $table.syncedAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get serverRecordId => $composableBuilder(
      column: $table.serverRecordId,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));
}

class $$AttendanceRecordsTableAnnotationComposer
    extends Composer<_$AppDatabase, $AttendanceRecordsTable> {
  $$AttendanceRecordsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get studentId =>
      $composableBuilder(column: $table.studentId, builder: (column) => column);

  GeneratedColumn<String> get personType => $composableBuilder(
      column: $table.personType, builder: (column) => column);

  GeneratedColumn<String> get studentUuid => $composableBuilder(
      column: $table.studentUuid, builder: (column) => column);

  GeneratedColumn<String> get studentCode => $composableBuilder(
      column: $table.studentCode, builder: (column) => column);

  GeneratedColumn<String> get classId =>
      $composableBuilder(column: $table.classId, builder: (column) => column);

  GeneratedColumn<String> get className =>
      $composableBuilder(column: $table.className, builder: (column) => column);

  GeneratedColumn<DateTime> get scannedAtUtc => $composableBuilder(
      column: $table.scannedAtUtc, builder: (column) => column);

  GeneratedColumn<String> get localDate =>
      $composableBuilder(column: $table.localDate, builder: (column) => column);

  GeneratedColumn<int> get localMinutes => $composableBuilder(
      column: $table.localMinutes, builder: (column) => column);

  GeneratedColumn<String> get session =>
      $composableBuilder(column: $table.session, builder: (column) => column);

  GeneratedColumn<String> get attendanceStatus => $composableBuilder(
      column: $table.attendanceStatus, builder: (column) => column);

  GeneratedColumn<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => column);

  GeneratedColumn<String> get source =>
      $composableBuilder(column: $table.source, builder: (column) => column);

  GeneratedColumn<String> get syncStatus => $composableBuilder(
      column: $table.syncStatus, builder: (column) => column);

  GeneratedColumn<DateTime> get syncedAt =>
      $composableBuilder(column: $table.syncedAt, builder: (column) => column);

  GeneratedColumn<String> get serverRecordId => $composableBuilder(
      column: $table.serverRecordId, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => column);

  GeneratedColumn<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$AttendanceRecordsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $AttendanceRecordsTable,
    AttendanceRecord,
    $$AttendanceRecordsTableFilterComposer,
    $$AttendanceRecordsTableOrderingComposer,
    $$AttendanceRecordsTableAnnotationComposer,
    $$AttendanceRecordsTableCreateCompanionBuilder,
    $$AttendanceRecordsTableUpdateCompanionBuilder,
    (
      AttendanceRecord,
      BaseReferences<_$AppDatabase, $AttendanceRecordsTable, AttendanceRecord>
    ),
    AttendanceRecord,
    PrefetchHooks Function()> {
  $$AttendanceRecordsTableTableManager(
      _$AppDatabase db, $AttendanceRecordsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$AttendanceRecordsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$AttendanceRecordsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$AttendanceRecordsTableAnnotationComposer(
                  $db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> studentId = const Value.absent(),
            Value<String> personType = const Value.absent(),
            Value<String?> studentUuid = const Value.absent(),
            Value<String> studentCode = const Value.absent(),
            Value<String?> classId = const Value.absent(),
            Value<String> className = const Value.absent(),
            Value<DateTime> scannedAtUtc = const Value.absent(),
            Value<String> localDate = const Value.absent(),
            Value<int> localMinutes = const Value.absent(),
            Value<String> session = const Value.absent(),
            Value<String> attendanceStatus = const Value.absent(),
            Value<String> terminalId = const Value.absent(),
            Value<String> source = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<DateTime?> syncedAt = const Value.absent(),
            Value<String?> serverRecordId = const Value.absent(),
            Value<int> retryCount = const Value.absent(),
            Value<String?> lastSyncError = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              AttendanceRecordsCompanion(
            id: id,
            studentId: studentId,
            personType: personType,
            studentUuid: studentUuid,
            studentCode: studentCode,
            classId: classId,
            className: className,
            scannedAtUtc: scannedAtUtc,
            localDate: localDate,
            localMinutes: localMinutes,
            session: session,
            attendanceStatus: attendanceStatus,
            terminalId: terminalId,
            source: source,
            syncStatus: syncStatus,
            syncedAt: syncedAt,
            serverRecordId: serverRecordId,
            retryCount: retryCount,
            lastSyncError: lastSyncError,
            createdAt: createdAt,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String studentId,
            Value<String> personType = const Value.absent(),
            Value<String?> studentUuid = const Value.absent(),
            required String studentCode,
            Value<String?> classId = const Value.absent(),
            Value<String> className = const Value.absent(),
            required DateTime scannedAtUtc,
            required String localDate,
            required int localMinutes,
            Value<String> session = const Value.absent(),
            required String attendanceStatus,
            required String terminalId,
            Value<String> source = const Value.absent(),
            Value<String> syncStatus = const Value.absent(),
            Value<DateTime?> syncedAt = const Value.absent(),
            Value<String?> serverRecordId = const Value.absent(),
            Value<int> retryCount = const Value.absent(),
            Value<String?> lastSyncError = const Value.absent(),
            required DateTime createdAt,
            Value<int> rowid = const Value.absent(),
          }) =>
              AttendanceRecordsCompanion.insert(
            id: id,
            studentId: studentId,
            personType: personType,
            studentUuid: studentUuid,
            studentCode: studentCode,
            classId: classId,
            className: className,
            scannedAtUtc: scannedAtUtc,
            localDate: localDate,
            localMinutes: localMinutes,
            session: session,
            attendanceStatus: attendanceStatus,
            terminalId: terminalId,
            source: source,
            syncStatus: syncStatus,
            syncedAt: syncedAt,
            serverRecordId: serverRecordId,
            retryCount: retryCount,
            lastSyncError: lastSyncError,
            createdAt: createdAt,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$AttendanceRecordsTable, AttendanceRecord>(
                        table),
                    BaseReferences<_$AppDatabase, $AttendanceRecordsTable,
                        AttendanceRecord>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$AttendanceRecordsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $AttendanceRecordsTable,
    AttendanceRecord,
    $$AttendanceRecordsTableFilterComposer,
    $$AttendanceRecordsTableOrderingComposer,
    $$AttendanceRecordsTableAnnotationComposer,
    $$AttendanceRecordsTableCreateCompanionBuilder,
    $$AttendanceRecordsTableUpdateCompanionBuilder,
    (
      AttendanceRecord,
      BaseReferences<_$AppDatabase, $AttendanceRecordsTable, AttendanceRecord>
    ),
    AttendanceRecord,
    PrefetchHooks Function()>;
typedef $$SettingsTableCreateCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  required String terminalId,
  Value<String> terminalDisplayName,
  Value<String?> schoolId,
  Value<String> schoolName,
  Value<String?> schoolLogoLocalPath,
  Value<String> timezone,
  Value<String> attendanceStartTime,
  Value<String> lateAfterTime,
  Value<int> autoResetMillis,
  Value<bool> soundEnabled,
  Value<bool> hapticsEnabled,
  Value<bool> animationsEnabled,
  Value<bool> keepScreenOn,
  Value<String> cameraFacing,
  Value<bool> showPhoto,
  Value<bool> showMatricule,
  Value<bool> showClassName,
  Value<bool> showTime,
  Value<bool> offlineMode,
  Value<int> retentionDays,
  Value<DateTime?> lastStudentSync,
  Value<DateTime?> lastAttendanceSync,
  Value<bool> apiEnabled,
  Value<String?> apiBaseUrl,
  Value<DateTime?> lastSyncAttempt,
  Value<String?> lastSyncError,
  Value<bool> voiceEnabled,
  Value<String> voiceSuccess,
  Value<String> voiceLate,
  Value<String> voiceDuplicate,
  Value<String> voiceRefused,
  Value<String?> adminPinSalt,
  Value<String?> adminPinHash,
  Value<int> adminPinIterations,
});
typedef $$SettingsTableUpdateCompanionBuilder = SettingsCompanion Function({
  Value<int> id,
  Value<String> terminalId,
  Value<String> terminalDisplayName,
  Value<String?> schoolId,
  Value<String> schoolName,
  Value<String?> schoolLogoLocalPath,
  Value<String> timezone,
  Value<String> attendanceStartTime,
  Value<String> lateAfterTime,
  Value<int> autoResetMillis,
  Value<bool> soundEnabled,
  Value<bool> hapticsEnabled,
  Value<bool> animationsEnabled,
  Value<bool> keepScreenOn,
  Value<String> cameraFacing,
  Value<bool> showPhoto,
  Value<bool> showMatricule,
  Value<bool> showClassName,
  Value<bool> showTime,
  Value<bool> offlineMode,
  Value<int> retentionDays,
  Value<DateTime?> lastStudentSync,
  Value<DateTime?> lastAttendanceSync,
  Value<bool> apiEnabled,
  Value<String?> apiBaseUrl,
  Value<DateTime?> lastSyncAttempt,
  Value<String?> lastSyncError,
  Value<bool> voiceEnabled,
  Value<String> voiceSuccess,
  Value<String> voiceLate,
  Value<String> voiceDuplicate,
  Value<String> voiceRefused,
  Value<String?> adminPinSalt,
  Value<String?> adminPinHash,
  Value<int> adminPinIterations,
});

class $$SettingsTableFilterComposer
    extends Composer<_$AppDatabase, $SettingsTable> {
  $$SettingsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get terminalDisplayName => $composableBuilder(
      column: $table.terminalDisplayName,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get schoolId => $composableBuilder(
      column: $table.schoolId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get schoolName => $composableBuilder(
      column: $table.schoolName, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get schoolLogoLocalPath => $composableBuilder(
      column: $table.schoolLogoLocalPath,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get timezone => $composableBuilder(
      column: $table.timezone, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get attendanceStartTime => $composableBuilder(
      column: $table.attendanceStartTime,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lateAfterTime => $composableBuilder(
      column: $table.lateAfterTime, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get autoResetMillis => $composableBuilder(
      column: $table.autoResetMillis,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get soundEnabled => $composableBuilder(
      column: $table.soundEnabled, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get hapticsEnabled => $composableBuilder(
      column: $table.hapticsEnabled,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get animationsEnabled => $composableBuilder(
      column: $table.animationsEnabled,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get keepScreenOn => $composableBuilder(
      column: $table.keepScreenOn, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get cameraFacing => $composableBuilder(
      column: $table.cameraFacing, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get showPhoto => $composableBuilder(
      column: $table.showPhoto, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get showMatricule => $composableBuilder(
      column: $table.showMatricule, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get showClassName => $composableBuilder(
      column: $table.showClassName, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get showTime => $composableBuilder(
      column: $table.showTime, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get offlineMode => $composableBuilder(
      column: $table.offlineMode, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get retentionDays => $composableBuilder(
      column: $table.retentionDays, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastStudentSync => $composableBuilder(
      column: $table.lastStudentSync,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastAttendanceSync => $composableBuilder(
      column: $table.lastAttendanceSync,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get apiEnabled => $composableBuilder(
      column: $table.apiEnabled, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get apiBaseUrl => $composableBuilder(
      column: $table.apiBaseUrl, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastSyncAttempt => $composableBuilder(
      column: $table.lastSyncAttempt,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError, builder: (column) => ColumnFilters(column));

  ColumnFilters<bool> get voiceEnabled => $composableBuilder(
      column: $table.voiceEnabled, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get voiceSuccess => $composableBuilder(
      column: $table.voiceSuccess, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get voiceLate => $composableBuilder(
      column: $table.voiceLate, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get voiceDuplicate => $composableBuilder(
      column: $table.voiceDuplicate,
      builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get voiceRefused => $composableBuilder(
      column: $table.voiceRefused, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get adminPinSalt => $composableBuilder(
      column: $table.adminPinSalt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get adminPinHash => $composableBuilder(
      column: $table.adminPinHash, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get adminPinIterations => $composableBuilder(
      column: $table.adminPinIterations,
      builder: (column) => ColumnFilters(column));
}

class $$SettingsTableOrderingComposer
    extends Composer<_$AppDatabase, $SettingsTable> {
  $$SettingsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get terminalDisplayName => $composableBuilder(
      column: $table.terminalDisplayName,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get schoolId => $composableBuilder(
      column: $table.schoolId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get schoolName => $composableBuilder(
      column: $table.schoolName, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get schoolLogoLocalPath => $composableBuilder(
      column: $table.schoolLogoLocalPath,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get timezone => $composableBuilder(
      column: $table.timezone, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get attendanceStartTime => $composableBuilder(
      column: $table.attendanceStartTime,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lateAfterTime => $composableBuilder(
      column: $table.lateAfterTime,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get autoResetMillis => $composableBuilder(
      column: $table.autoResetMillis,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get soundEnabled => $composableBuilder(
      column: $table.soundEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get hapticsEnabled => $composableBuilder(
      column: $table.hapticsEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get animationsEnabled => $composableBuilder(
      column: $table.animationsEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get keepScreenOn => $composableBuilder(
      column: $table.keepScreenOn,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get cameraFacing => $composableBuilder(
      column: $table.cameraFacing,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get showPhoto => $composableBuilder(
      column: $table.showPhoto, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get showMatricule => $composableBuilder(
      column: $table.showMatricule,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get showClassName => $composableBuilder(
      column: $table.showClassName,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get showTime => $composableBuilder(
      column: $table.showTime, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get offlineMode => $composableBuilder(
      column: $table.offlineMode, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get retentionDays => $composableBuilder(
      column: $table.retentionDays,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastStudentSync => $composableBuilder(
      column: $table.lastStudentSync,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastAttendanceSync => $composableBuilder(
      column: $table.lastAttendanceSync,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get apiEnabled => $composableBuilder(
      column: $table.apiEnabled, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get apiBaseUrl => $composableBuilder(
      column: $table.apiBaseUrl, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastSyncAttempt => $composableBuilder(
      column: $table.lastSyncAttempt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<bool> get voiceEnabled => $composableBuilder(
      column: $table.voiceEnabled,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get voiceSuccess => $composableBuilder(
      column: $table.voiceSuccess,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get voiceLate => $composableBuilder(
      column: $table.voiceLate, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get voiceDuplicate => $composableBuilder(
      column: $table.voiceDuplicate,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get voiceRefused => $composableBuilder(
      column: $table.voiceRefused,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get adminPinSalt => $composableBuilder(
      column: $table.adminPinSalt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get adminPinHash => $composableBuilder(
      column: $table.adminPinHash,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get adminPinIterations => $composableBuilder(
      column: $table.adminPinIterations,
      builder: (column) => ColumnOrderings(column));
}

class $$SettingsTableAnnotationComposer
    extends Composer<_$AppDatabase, $SettingsTable> {
  $$SettingsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get terminalId => $composableBuilder(
      column: $table.terminalId, builder: (column) => column);

  GeneratedColumn<String> get terminalDisplayName => $composableBuilder(
      column: $table.terminalDisplayName, builder: (column) => column);

  GeneratedColumn<String> get schoolId =>
      $composableBuilder(column: $table.schoolId, builder: (column) => column);

  GeneratedColumn<String> get schoolName => $composableBuilder(
      column: $table.schoolName, builder: (column) => column);

  GeneratedColumn<String> get schoolLogoLocalPath => $composableBuilder(
      column: $table.schoolLogoLocalPath, builder: (column) => column);

  GeneratedColumn<String> get timezone =>
      $composableBuilder(column: $table.timezone, builder: (column) => column);

  GeneratedColumn<String> get attendanceStartTime => $composableBuilder(
      column: $table.attendanceStartTime, builder: (column) => column);

  GeneratedColumn<String> get lateAfterTime => $composableBuilder(
      column: $table.lateAfterTime, builder: (column) => column);

  GeneratedColumn<int> get autoResetMillis => $composableBuilder(
      column: $table.autoResetMillis, builder: (column) => column);

  GeneratedColumn<bool> get soundEnabled => $composableBuilder(
      column: $table.soundEnabled, builder: (column) => column);

  GeneratedColumn<bool> get hapticsEnabled => $composableBuilder(
      column: $table.hapticsEnabled, builder: (column) => column);

  GeneratedColumn<bool> get animationsEnabled => $composableBuilder(
      column: $table.animationsEnabled, builder: (column) => column);

  GeneratedColumn<bool> get keepScreenOn => $composableBuilder(
      column: $table.keepScreenOn, builder: (column) => column);

  GeneratedColumn<String> get cameraFacing => $composableBuilder(
      column: $table.cameraFacing, builder: (column) => column);

  GeneratedColumn<bool> get showPhoto =>
      $composableBuilder(column: $table.showPhoto, builder: (column) => column);

  GeneratedColumn<bool> get showMatricule => $composableBuilder(
      column: $table.showMatricule, builder: (column) => column);

  GeneratedColumn<bool> get showClassName => $composableBuilder(
      column: $table.showClassName, builder: (column) => column);

  GeneratedColumn<bool> get showTime =>
      $composableBuilder(column: $table.showTime, builder: (column) => column);

  GeneratedColumn<bool> get offlineMode => $composableBuilder(
      column: $table.offlineMode, builder: (column) => column);

  GeneratedColumn<int> get retentionDays => $composableBuilder(
      column: $table.retentionDays, builder: (column) => column);

  GeneratedColumn<DateTime> get lastStudentSync => $composableBuilder(
      column: $table.lastStudentSync, builder: (column) => column);

  GeneratedColumn<DateTime> get lastAttendanceSync => $composableBuilder(
      column: $table.lastAttendanceSync, builder: (column) => column);

  GeneratedColumn<bool> get apiEnabled => $composableBuilder(
      column: $table.apiEnabled, builder: (column) => column);

  GeneratedColumn<String> get apiBaseUrl => $composableBuilder(
      column: $table.apiBaseUrl, builder: (column) => column);

  GeneratedColumn<DateTime> get lastSyncAttempt => $composableBuilder(
      column: $table.lastSyncAttempt, builder: (column) => column);

  GeneratedColumn<String> get lastSyncError => $composableBuilder(
      column: $table.lastSyncError, builder: (column) => column);

  GeneratedColumn<bool> get voiceEnabled => $composableBuilder(
      column: $table.voiceEnabled, builder: (column) => column);

  GeneratedColumn<String> get voiceSuccess => $composableBuilder(
      column: $table.voiceSuccess, builder: (column) => column);

  GeneratedColumn<String> get voiceLate =>
      $composableBuilder(column: $table.voiceLate, builder: (column) => column);

  GeneratedColumn<String> get voiceDuplicate => $composableBuilder(
      column: $table.voiceDuplicate, builder: (column) => column);

  GeneratedColumn<String> get voiceRefused => $composableBuilder(
      column: $table.voiceRefused, builder: (column) => column);

  GeneratedColumn<String> get adminPinSalt => $composableBuilder(
      column: $table.adminPinSalt, builder: (column) => column);

  GeneratedColumn<String> get adminPinHash => $composableBuilder(
      column: $table.adminPinHash, builder: (column) => column);

  GeneratedColumn<int> get adminPinIterations => $composableBuilder(
      column: $table.adminPinIterations, builder: (column) => column);
}

class $$SettingsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SettingsTable,
    TerminalSettings,
    $$SettingsTableFilterComposer,
    $$SettingsTableOrderingComposer,
    $$SettingsTableAnnotationComposer,
    $$SettingsTableCreateCompanionBuilder,
    $$SettingsTableUpdateCompanionBuilder,
    (
      TerminalSettings,
      BaseReferences<_$AppDatabase, $SettingsTable, TerminalSettings>
    ),
    TerminalSettings,
    PrefetchHooks Function()> {
  $$SettingsTableTableManager(_$AppDatabase db, $SettingsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SettingsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SettingsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SettingsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> terminalId = const Value.absent(),
            Value<String> terminalDisplayName = const Value.absent(),
            Value<String?> schoolId = const Value.absent(),
            Value<String> schoolName = const Value.absent(),
            Value<String?> schoolLogoLocalPath = const Value.absent(),
            Value<String> timezone = const Value.absent(),
            Value<String> attendanceStartTime = const Value.absent(),
            Value<String> lateAfterTime = const Value.absent(),
            Value<int> autoResetMillis = const Value.absent(),
            Value<bool> soundEnabled = const Value.absent(),
            Value<bool> hapticsEnabled = const Value.absent(),
            Value<bool> animationsEnabled = const Value.absent(),
            Value<bool> keepScreenOn = const Value.absent(),
            Value<String> cameraFacing = const Value.absent(),
            Value<bool> showPhoto = const Value.absent(),
            Value<bool> showMatricule = const Value.absent(),
            Value<bool> showClassName = const Value.absent(),
            Value<bool> showTime = const Value.absent(),
            Value<bool> offlineMode = const Value.absent(),
            Value<int> retentionDays = const Value.absent(),
            Value<DateTime?> lastStudentSync = const Value.absent(),
            Value<DateTime?> lastAttendanceSync = const Value.absent(),
            Value<bool> apiEnabled = const Value.absent(),
            Value<String?> apiBaseUrl = const Value.absent(),
            Value<DateTime?> lastSyncAttempt = const Value.absent(),
            Value<String?> lastSyncError = const Value.absent(),
            Value<bool> voiceEnabled = const Value.absent(),
            Value<String> voiceSuccess = const Value.absent(),
            Value<String> voiceLate = const Value.absent(),
            Value<String> voiceDuplicate = const Value.absent(),
            Value<String> voiceRefused = const Value.absent(),
            Value<String?> adminPinSalt = const Value.absent(),
            Value<String?> adminPinHash = const Value.absent(),
            Value<int> adminPinIterations = const Value.absent(),
          }) =>
              SettingsCompanion(
            id: id,
            terminalId: terminalId,
            terminalDisplayName: terminalDisplayName,
            schoolId: schoolId,
            schoolName: schoolName,
            schoolLogoLocalPath: schoolLogoLocalPath,
            timezone: timezone,
            attendanceStartTime: attendanceStartTime,
            lateAfterTime: lateAfterTime,
            autoResetMillis: autoResetMillis,
            soundEnabled: soundEnabled,
            hapticsEnabled: hapticsEnabled,
            animationsEnabled: animationsEnabled,
            keepScreenOn: keepScreenOn,
            cameraFacing: cameraFacing,
            showPhoto: showPhoto,
            showMatricule: showMatricule,
            showClassName: showClassName,
            showTime: showTime,
            offlineMode: offlineMode,
            retentionDays: retentionDays,
            lastStudentSync: lastStudentSync,
            lastAttendanceSync: lastAttendanceSync,
            apiEnabled: apiEnabled,
            apiBaseUrl: apiBaseUrl,
            lastSyncAttempt: lastSyncAttempt,
            lastSyncError: lastSyncError,
            voiceEnabled: voiceEnabled,
            voiceSuccess: voiceSuccess,
            voiceLate: voiceLate,
            voiceDuplicate: voiceDuplicate,
            voiceRefused: voiceRefused,
            adminPinSalt: adminPinSalt,
            adminPinHash: adminPinHash,
            adminPinIterations: adminPinIterations,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String terminalId,
            Value<String> terminalDisplayName = const Value.absent(),
            Value<String?> schoolId = const Value.absent(),
            Value<String> schoolName = const Value.absent(),
            Value<String?> schoolLogoLocalPath = const Value.absent(),
            Value<String> timezone = const Value.absent(),
            Value<String> attendanceStartTime = const Value.absent(),
            Value<String> lateAfterTime = const Value.absent(),
            Value<int> autoResetMillis = const Value.absent(),
            Value<bool> soundEnabled = const Value.absent(),
            Value<bool> hapticsEnabled = const Value.absent(),
            Value<bool> animationsEnabled = const Value.absent(),
            Value<bool> keepScreenOn = const Value.absent(),
            Value<String> cameraFacing = const Value.absent(),
            Value<bool> showPhoto = const Value.absent(),
            Value<bool> showMatricule = const Value.absent(),
            Value<bool> showClassName = const Value.absent(),
            Value<bool> showTime = const Value.absent(),
            Value<bool> offlineMode = const Value.absent(),
            Value<int> retentionDays = const Value.absent(),
            Value<DateTime?> lastStudentSync = const Value.absent(),
            Value<DateTime?> lastAttendanceSync = const Value.absent(),
            Value<bool> apiEnabled = const Value.absent(),
            Value<String?> apiBaseUrl = const Value.absent(),
            Value<DateTime?> lastSyncAttempt = const Value.absent(),
            Value<String?> lastSyncError = const Value.absent(),
            Value<bool> voiceEnabled = const Value.absent(),
            Value<String> voiceSuccess = const Value.absent(),
            Value<String> voiceLate = const Value.absent(),
            Value<String> voiceDuplicate = const Value.absent(),
            Value<String> voiceRefused = const Value.absent(),
            Value<String?> adminPinSalt = const Value.absent(),
            Value<String?> adminPinHash = const Value.absent(),
            Value<int> adminPinIterations = const Value.absent(),
          }) =>
              SettingsCompanion.insert(
            id: id,
            terminalId: terminalId,
            terminalDisplayName: terminalDisplayName,
            schoolId: schoolId,
            schoolName: schoolName,
            schoolLogoLocalPath: schoolLogoLocalPath,
            timezone: timezone,
            attendanceStartTime: attendanceStartTime,
            lateAfterTime: lateAfterTime,
            autoResetMillis: autoResetMillis,
            soundEnabled: soundEnabled,
            hapticsEnabled: hapticsEnabled,
            animationsEnabled: animationsEnabled,
            keepScreenOn: keepScreenOn,
            cameraFacing: cameraFacing,
            showPhoto: showPhoto,
            showMatricule: showMatricule,
            showClassName: showClassName,
            showTime: showTime,
            offlineMode: offlineMode,
            retentionDays: retentionDays,
            lastStudentSync: lastStudentSync,
            lastAttendanceSync: lastAttendanceSync,
            apiEnabled: apiEnabled,
            apiBaseUrl: apiBaseUrl,
            lastSyncAttempt: lastSyncAttempt,
            lastSyncError: lastSyncError,
            voiceEnabled: voiceEnabled,
            voiceSuccess: voiceSuccess,
            voiceLate: voiceLate,
            voiceDuplicate: voiceDuplicate,
            voiceRefused: voiceRefused,
            adminPinSalt: adminPinSalt,
            adminPinHash: adminPinHash,
            adminPinIterations: adminPinIterations,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$SettingsTable, TerminalSettings>(table),
                    BaseReferences<_$AppDatabase, $SettingsTable,
                        TerminalSettings>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SettingsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SettingsTable,
    TerminalSettings,
    $$SettingsTableFilterComposer,
    $$SettingsTableOrderingComposer,
    $$SettingsTableAnnotationComposer,
    $$SettingsTableCreateCompanionBuilder,
    $$SettingsTableUpdateCompanionBuilder,
    (
      TerminalSettings,
      BaseReferences<_$AppDatabase, $SettingsTable, TerminalSettings>
    ),
    TerminalSettings,
    PrefetchHooks Function()>;
typedef $$SyncQueueTableCreateCompanionBuilder = SyncQueueCompanion Function({
  required String id,
  required String eventType,
  required String entityId,
  required String payloadJson,
  required DateTime createdAt,
  Value<int> retryCount,
  Value<String> status,
  Value<DateTime?> lastAttemptAt,
  Value<String?> lastError,
  Value<int> rowid,
});
typedef $$SyncQueueTableUpdateCompanionBuilder = SyncQueueCompanion Function({
  Value<String> id,
  Value<String> eventType,
  Value<String> entityId,
  Value<String> payloadJson,
  Value<DateTime> createdAt,
  Value<int> retryCount,
  Value<String> status,
  Value<DateTime?> lastAttemptAt,
  Value<String?> lastError,
  Value<int> rowid,
});

class $$SyncQueueTableFilterComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get eventType => $composableBuilder(
      column: $table.eventType, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get lastAttemptAt => $composableBuilder(
      column: $table.lastAttemptAt, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnFilters(column));
}

class $$SyncQueueTableOrderingComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get eventType => $composableBuilder(
      column: $table.eventType, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get entityId => $composableBuilder(
      column: $table.entityId, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get status => $composableBuilder(
      column: $table.status, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get lastAttemptAt => $composableBuilder(
      column: $table.lastAttemptAt,
      builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get lastError => $composableBuilder(
      column: $table.lastError, builder: (column) => ColumnOrderings(column));
}

class $$SyncQueueTableAnnotationComposer
    extends Composer<_$AppDatabase, $SyncQueueTable> {
  $$SyncQueueTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get eventType =>
      $composableBuilder(column: $table.eventType, builder: (column) => column);

  GeneratedColumn<String> get entityId =>
      $composableBuilder(column: $table.entityId, builder: (column) => column);

  GeneratedColumn<String> get payloadJson => $composableBuilder(
      column: $table.payloadJson, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<int> get retryCount => $composableBuilder(
      column: $table.retryCount, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<DateTime> get lastAttemptAt => $composableBuilder(
      column: $table.lastAttemptAt, builder: (column) => column);

  GeneratedColumn<String> get lastError =>
      $composableBuilder(column: $table.lastError, builder: (column) => column);
}

class $$SyncQueueTableTableManager extends RootTableManager<
    _$AppDatabase,
    $SyncQueueTable,
    SyncQueueItem,
    $$SyncQueueTableFilterComposer,
    $$SyncQueueTableOrderingComposer,
    $$SyncQueueTableAnnotationComposer,
    $$SyncQueueTableCreateCompanionBuilder,
    $$SyncQueueTableUpdateCompanionBuilder,
    (
      SyncQueueItem,
      BaseReferences<_$AppDatabase, $SyncQueueTable, SyncQueueItem>
    ),
    SyncQueueItem,
    PrefetchHooks Function()> {
  $$SyncQueueTableTableManager(_$AppDatabase db, $SyncQueueTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$SyncQueueTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$SyncQueueTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$SyncQueueTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<String> id = const Value.absent(),
            Value<String> eventType = const Value.absent(),
            Value<String> entityId = const Value.absent(),
            Value<String> payloadJson = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
            Value<int> retryCount = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> lastAttemptAt = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SyncQueueCompanion(
            id: id,
            eventType: eventType,
            entityId: entityId,
            payloadJson: payloadJson,
            createdAt: createdAt,
            retryCount: retryCount,
            status: status,
            lastAttemptAt: lastAttemptAt,
            lastError: lastError,
            rowid: rowid,
          ),
          createCompanionCallback: ({
            required String id,
            required String eventType,
            required String entityId,
            required String payloadJson,
            required DateTime createdAt,
            Value<int> retryCount = const Value.absent(),
            Value<String> status = const Value.absent(),
            Value<DateTime?> lastAttemptAt = const Value.absent(),
            Value<String?> lastError = const Value.absent(),
            Value<int> rowid = const Value.absent(),
          }) =>
              SyncQueueCompanion.insert(
            id: id,
            eventType: eventType,
            entityId: entityId,
            payloadJson: payloadJson,
            createdAt: createdAt,
            retryCount: retryCount,
            status: status,
            lastAttemptAt: lastAttemptAt,
            lastError: lastError,
            rowid: rowid,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$SyncQueueTable, SyncQueueItem>(table),
                    BaseReferences<_$AppDatabase, $SyncQueueTable,
                        SyncQueueItem>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$SyncQueueTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $SyncQueueTable,
    SyncQueueItem,
    $$SyncQueueTableFilterComposer,
    $$SyncQueueTableOrderingComposer,
    $$SyncQueueTableAnnotationComposer,
    $$SyncQueueTableCreateCompanionBuilder,
    $$SyncQueueTableUpdateCompanionBuilder,
    (
      SyncQueueItem,
      BaseReferences<_$AppDatabase, $SyncQueueTable, SyncQueueItem>
    ),
    SyncQueueItem,
    PrefetchHooks Function()>;
typedef $$TerminalLogsTableCreateCompanionBuilder = TerminalLogsCompanion
    Function({
  Value<int> id,
  required String level,
  required String event,
  Value<String?> details,
  required DateTime createdAt,
});
typedef $$TerminalLogsTableUpdateCompanionBuilder = TerminalLogsCompanion
    Function({
  Value<int> id,
  Value<String> level,
  Value<String> event,
  Value<String?> details,
  Value<DateTime> createdAt,
});

class $$TerminalLogsTableFilterComposer
    extends Composer<_$AppDatabase, $TerminalLogsTable> {
  $$TerminalLogsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get level => $composableBuilder(
      column: $table.level, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get event => $composableBuilder(
      column: $table.event, builder: (column) => ColumnFilters(column));

  ColumnFilters<String> get details => $composableBuilder(
      column: $table.details, builder: (column) => ColumnFilters(column));

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnFilters(column));
}

class $$TerminalLogsTableOrderingComposer
    extends Composer<_$AppDatabase, $TerminalLogsTable> {
  $$TerminalLogsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<int> get id => $composableBuilder(
      column: $table.id, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get level => $composableBuilder(
      column: $table.level, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get event => $composableBuilder(
      column: $table.event, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<String> get details => $composableBuilder(
      column: $table.details, builder: (column) => ColumnOrderings(column));

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
      column: $table.createdAt, builder: (column) => ColumnOrderings(column));
}

class $$TerminalLogsTableAnnotationComposer
    extends Composer<_$AppDatabase, $TerminalLogsTable> {
  $$TerminalLogsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<int> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get level =>
      $composableBuilder(column: $table.level, builder: (column) => column);

  GeneratedColumn<String> get event =>
      $composableBuilder(column: $table.event, builder: (column) => column);

  GeneratedColumn<String> get details =>
      $composableBuilder(column: $table.details, builder: (column) => column);

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);
}

class $$TerminalLogsTableTableManager extends RootTableManager<
    _$AppDatabase,
    $TerminalLogsTable,
    TerminalLog,
    $$TerminalLogsTableFilterComposer,
    $$TerminalLogsTableOrderingComposer,
    $$TerminalLogsTableAnnotationComposer,
    $$TerminalLogsTableCreateCompanionBuilder,
    $$TerminalLogsTableUpdateCompanionBuilder,
    (
      TerminalLog,
      BaseReferences<_$AppDatabase, $TerminalLogsTable, TerminalLog>
    ),
    TerminalLog,
    PrefetchHooks Function()> {
  $$TerminalLogsTableTableManager(_$AppDatabase db, $TerminalLogsTable table)
      : super(TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$TerminalLogsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$TerminalLogsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$TerminalLogsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback: ({
            Value<int> id = const Value.absent(),
            Value<String> level = const Value.absent(),
            Value<String> event = const Value.absent(),
            Value<String?> details = const Value.absent(),
            Value<DateTime> createdAt = const Value.absent(),
          }) =>
              TerminalLogsCompanion(
            id: id,
            level: level,
            event: event,
            details: details,
            createdAt: createdAt,
          ),
          createCompanionCallback: ({
            Value<int> id = const Value.absent(),
            required String level,
            required String event,
            Value<String?> details = const Value.absent(),
            required DateTime createdAt,
          }) =>
              TerminalLogsCompanion.insert(
            id: id,
            level: level,
            event: event,
            details: details,
            createdAt: createdAt,
          ),
          withReferenceMapper: (p0) => p0
              .map((e) => (
                    e.readTable<$TerminalLogsTable, TerminalLog>(table),
                    BaseReferences<_$AppDatabase, $TerminalLogsTable,
                        TerminalLog>(db, table, e)
                  ))
              .toList(),
          prefetchHooksCallback: null,
        ));
}

typedef $$TerminalLogsTableProcessedTableManager = ProcessedTableManager<
    _$AppDatabase,
    $TerminalLogsTable,
    TerminalLog,
    $$TerminalLogsTableFilterComposer,
    $$TerminalLogsTableOrderingComposer,
    $$TerminalLogsTableAnnotationComposer,
    $$TerminalLogsTableCreateCompanionBuilder,
    $$TerminalLogsTableUpdateCompanionBuilder,
    (
      TerminalLog,
      BaseReferences<_$AppDatabase, $TerminalLogsTable, TerminalLog>
    ),
    TerminalLog,
    PrefetchHooks Function()>;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$StudentsTableTableManager get students =>
      $$StudentsTableTableManager(_db, _db.students);
  $$StaffMembersTableTableManager get staffMembers =>
      $$StaffMembersTableTableManager(_db, _db.staffMembers);
  $$SchoolClassesTableTableManager get schoolClasses =>
      $$SchoolClassesTableTableManager(_db, _db.schoolClasses);
  $$AttendanceRecordsTableTableManager get attendanceRecords =>
      $$AttendanceRecordsTableTableManager(_db, _db.attendanceRecords);
  $$SettingsTableTableManager get settings =>
      $$SettingsTableTableManager(_db, _db.settings);
  $$SyncQueueTableTableManager get syncQueue =>
      $$SyncQueueTableTableManager(_db, _db.syncQueue);
  $$TerminalLogsTableTableManager get terminalLogs =>
      $$TerminalLogsTableTableManager(_db, _db.terminalLogs);
}
