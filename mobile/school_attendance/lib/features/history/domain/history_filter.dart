/// Filtres de l'écran historique (tous combinables).
class HistoryFilter {
  const HistoryFilter({
    this.day,
    this.classId,
    this.status = '',
    this.search = '',
  });

  final DateTime? day;
  final String? classId;

  /// `''` (tous) | `present` | `late`.
  final String status;

  final String search;

  bool get isEmpty =>
      day == null && classId == null && status.isEmpty && search.trim().isEmpty;

  HistoryFilter copyWith({
    DateTime? day,
    bool clearDay = false,
    String? classId,
    bool clearClass = false,
    String? status,
    String? search,
  }) {
    return HistoryFilter(
      day: clearDay ? null : (day ?? this.day),
      classId: clearClass ? null : (classId ?? this.classId),
      status: status ?? this.status,
      search: search ?? this.search,
    );
  }
}
