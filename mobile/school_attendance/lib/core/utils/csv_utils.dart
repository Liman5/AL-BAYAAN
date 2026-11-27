/// Analyse et génération de CSV (RFC 4180), sans dépendance externe.
///
/// Supporte les guillemets, les retours à la ligne dans les cellules,
/// les fins de ligne Windows/Unix et le BOM UTF-8.
class CsvUtils {
  const CsvUtils._();

  /// Détecte le séparateur le plus probable d'un contenu CSV.
  static String detectDelimiter(String content) {
    final firstLine = content.split(RegExp(r'\r?\n')).firstWhere(
          (line) => line.trim().isNotEmpty,
          orElse: () => '',
        );
    final semicolons = ';'.allMatches(firstLine).length;
    final commas = ','.allMatches(firstLine).length;
    final tabs = '\t'.allMatches(firstLine).length;
    if (tabs > semicolons && tabs > commas) return '\t';
    if (semicolons > commas) return ';';
    return ',';
  }

  static List<List<String>> parse(String content, {String? delimiter}) {
    final input = content.startsWith('\uFEFF') ? content.substring(1) : content;
    final sep = delimiter ?? detectDelimiter(input);
    final rows = <List<String>>[];
    var row = <String>[];
    final field = StringBuffer();
    var inQuotes = false;

    void endField() {
      row.add(field.toString());
      field.clear();
    }

    void endRow() {
      endField();
      // Ignore les lignes totalement vides.
      final isEmpty = row.length == 1 && row.first.trim().isEmpty;
      if (!isEmpty) rows.add(row);
      row = <String>[];
    }

    for (var i = 0; i < input.length; i++) {
      final char = input[i];
      if (inQuotes) {
        if (char == '"') {
          if (i + 1 < input.length && input[i + 1] == '"') {
            field.write('"');
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field.write(char);
        }
        continue;
      }
      if (char == '"') {
        inQuotes = true;
      } else if (char == sep) {
        endField();
      } else if (char == '\n') {
        endRow();
      } else if (char == '\r') {
        // ignoré (CRLF)
      } else {
        field.write(char);
      }
    }

    if (field.isNotEmpty || row.isNotEmpty) endRow();
    return rows;
  }

  static String encode(List<List<String>> rows, {String delimiter = ','}) {
    return rows.map((row) => row.map((cell) => _escape(cell, delimiter)).join(delimiter)).join('\r\n');
  }

  static String _escape(String value, String delimiter) {
    final needsQuotes = value.contains(delimiter) ||
        value.contains('"') ||
        value.contains('\n') ||
        value.contains('\r');
    if (!needsQuotes) return value;
    return '"${value.replaceAll('"', '""')}"';
  }

  /// Normalise un en-tête : minuscules, sans accents ni espaces superflus.
  static String normalizeHeader(String value) {
    const replacements = {
      'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'î': 'i', 'ï': 'i', 'í': 'i',
      'ô': 'o', 'ö': 'o', 'ó': 'o',
      'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
      'ç': 'c', 'ñ': 'n',
    };
    var result = value.trim().toLowerCase();
    replacements.forEach((from, to) {
      result = result.replaceAll(from, to);
    });
    return result.replaceAll(RegExp(r'[\s\-]+'), '_');
  }
}
