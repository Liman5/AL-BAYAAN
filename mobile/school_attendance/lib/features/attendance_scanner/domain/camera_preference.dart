/// Objectif de caméra préféré du terminal.
///
/// Cette valeur est persistée dans les paramètres locaux (`settings.cameraFacing`)
/// et ne dépend d'aucun plugin : elle est testable sans matériel.
enum CameraMode {
  front('front'),
  back('back');

  const CameraMode(this.storageValue);

  /// Valeur enregistrée en base (`front` / `back`).
  final String storageValue;

  /// Valeur par défaut d'une nouvelle installation : caméra avant.
  static const CameraMode defaultValue = CameraMode.front;

  /// Libellé lisible par le personnel.
  String get label => this == CameraMode.front ? 'Caméra avant' : 'Caméra arrière';

  /// Objectif opposé (utilisé par le bouton de bascule).
  CameraMode get opposite =>
      this == CameraMode.front ? CameraMode.back : CameraMode.front;

  /// Lit une préférence stockée.
  ///
  /// Toute valeur absente, vide ou inconnue retombe sur la caméra avant :
  /// le scanner ne doit jamais rester sans objectif défini.
  static CameraMode parse(String? raw) {
    final normalized = raw?.trim().toLowerCase();
    if (normalized == CameraMode.back.storageValue) return CameraMode.back;
    return CameraMode.front;
  }

  static String serialize(CameraMode mode) => mode.storageValue;

  /// Le flash n'est utilisable que sur l'objectif arrière **et** si le
  /// matériel l'annonce (certains appareils n'ont pas de torche).
  static bool isTorchAvailable({
    required CameraMode mode,
    required bool hardwareSupportsTorch,
  }) {
    return mode == CameraMode.back && hardwareSupportsTorch;
  }
}
