import 'package:material_ui/material_ui.dart';

import '../../../../app/theme/app_colors.dart';

/// Cadre de scan animé : coins lumineux + ligne de balayage discrète.
///
/// Le widget est purement décoratif : il n'interfère jamais avec la
/// détection QR et ne consomme pas d'images de la caméra.
class ScanWindow extends StatefulWidget {
  const ScanWindow({super.key, this.label});

  final String? label;

  @override
  State<ScanWindow> createState() => _ScanWindowState();
}

class _ScanWindowState extends State<ScanWindow>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 2100),
  );

  bool _animating = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final reduceMotion = MediaQuery.maybeOf(context)?.disableAnimations ?? false;
    if (reduceMotion) {
      if (_animating) {
        _controller.stop();
        _animating = false;
      }
    } else if (!_animating) {
      _controller.repeat();
      _animating = true;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, _) {
              return CustomPaint(
                painter: _ScanFramePainter(progress: _controller.value),
                size: Size.infinite,
              );
            },
          ),
          if (widget.label != null)
            Positioned(
              bottom: 18,
              left: 24,
              right: 24,
              child: Text(
                widget.label!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.2,
                  shadows: [Shadow(color: Colors.black54, blurRadius: 8)],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScanFramePainter extends CustomPainter {
  _ScanFramePainter({required this.progress});

  final double progress;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromCenter(
      center: Offset(size.width / 2, size.height / 2),
      width: size.width * 0.72,
      height: size.width * 0.72,
    );

    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.2
      ..strokeCap = StrokeCap.round
      ..color = AppColors.scanFrame;

    const corner = 30.0;
    final path = Path()
      ..moveTo(rect.left, rect.top + corner)
      ..lineTo(rect.left, rect.top)
      ..lineTo(rect.left + corner, rect.top)
      ..moveTo(rect.right - corner, rect.top)
      ..lineTo(rect.right, rect.top)
      ..lineTo(rect.right, rect.top + corner)
      ..moveTo(rect.right, rect.bottom - corner)
      ..lineTo(rect.right, rect.bottom)
      ..lineTo(rect.right - corner, rect.bottom)
      ..moveTo(rect.left + corner, rect.bottom)
      ..lineTo(rect.left, rect.bottom)
      ..lineTo(rect.left, rect.bottom - corner);

    canvas.drawPath(path, paint);

    // Halo doux autour du cadre.
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(22)),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.2
        ..color = AppColors.scanFrame.withValues(alpha: 0.22),
    );

    // Ligne de balayage.
    final lineY = rect.top + (rect.height * progress);
    final glow = Paint()
      ..shader = LinearGradient(
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
        colors: [
          AppColors.scanFrame.withValues(alpha: 0),
          AppColors.scanFrame.withValues(alpha: 0.85),
          AppColors.scanFrame.withValues(alpha: 0),
        ],
      ).createShader(Rect.fromLTWH(rect.left, lineY - 1, rect.width, 2));

    canvas.save();
    canvas.clipRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(18)),
    );
    canvas.drawRect(Rect.fromLTWH(rect.left, lineY - 1, rect.width, 2), glow);
    canvas.drawRect(
      Rect.fromLTWH(rect.left, lineY - 1, rect.width, 2),
      Paint()..color = AppColors.scanFrame.withValues(alpha: 0.5),
    );
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _ScanFramePainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
