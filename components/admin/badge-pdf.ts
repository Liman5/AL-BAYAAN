'use client';

import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// ============================================================
// AL-BAYAAN — Génération des badges imprimables (PDF)
//
// Format carte : 85,6 × 54 mm (format carte bancaire / badge ID-1).
// Une page A4 portrait contient 8 cartes (2 colonnes × 4 lignes).
//
// Le QR est généré à 512 px puis inséré à 28 mm : résolution
// largement suffisante pour une impression nette et un scan
// fiable avec la caméra d'un téléphone, y compris en noir et blanc.
//
// Aucune donnée personnelle n'est encodée dans le QR : uniquement
// le token opaque du badge.
// ============================================================

export const CARD_WIDTH_MM = 85.6;
export const CARD_HEIGHT_MM = 54;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const GAP_X_MM = 10;
const GAP_Y_MM = 8;
const QR_SIZE_MM = 28;
const BLOCK_WIDTH_MM = CARD_WIDTH_MM * 2 + GAP_X_MM;
const OFFSET_X_MM = (PAGE_WIDTH_MM - BLOCK_WIDTH_MM) / 2;
const OFFSET_Y_MM = 16;
const CARDS_PER_PAGE = 8;

export interface BadgePdfEntry {
  token: string;
  firstName: string;
  lastName: string;
  matricule: string;
  className: string;
  photoUrl?: string | null;
}

export interface BadgePdfOptions {
  schoolName: string;
  academicYearName?: string | null;
  includePhotos?: boolean;
  includeMatricule?: boolean;
}

/** Charge une image distante en data-URL (silencieux en cas d'échec). */
async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) return null;
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Tronque une chaîne trop longue pour tenir dans une largeur donnée. */
function truncate(doc: jsPDF, value: string, maxWidth: number): string {
  if (doc.getTextWidth(value) <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && doc.getTextWidth(`${result}…`) > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
}

/** Cache des QR déjà rendus (évite de recalculer pour un même token). */
const qrCache = new Map<string, string>();

/** Pré-génère les QR codes PNG haute résolution des badges. */
export async function prepareQrImages(tokens: string[]): Promise<number> {
  let generated = 0;
  for (const token of tokens) {
    if (!token || qrCache.has(token)) continue;
    try {
      const dataUrl = await QRCode.toDataURL(token, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 512,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      qrCache.set(token, dataUrl);
      generated++;
    } catch {
      // Un token invalide est simplement ignoré.
    }
  }
  return generated;
}

/** Data-URL du QR (aperçu HTML). */
export async function qrPreviewDataUrl(token: string): Promise<string> {
  if (qrCache.has(token)) return qrCache.get(token) as string;
  const dataUrl = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  qrCache.set(token, dataUrl);
  return dataUrl;
}

export function badgesPerPage(): number {
  return CARDS_PER_PAGE;
}

export function pageDimensionsMm(): { width: number; height: number } {
  return { width: PAGE_WIDTH_MM, height: PAGE_HEIGHT_MM };
}

/**
 * Construit le PDF des badges. Les entrées sans token valide sont ignorées
 * et aucun doublon de token n'est imprimé deux fois.
 */
export async function buildBadgesPdf(
  entries: BadgePdfEntry[],
  options: BadgePdfOptions,
): Promise<{ pdf: jsPDF; printed: number; skipped: number }> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const seen = new Set<string>();
  const unique: BadgePdfEntry[] = [];
  let skipped = 0;

  for (const entry of entries) {
    const token = (entry.token || '').trim();
    if (!token || token.length < 8 || seen.has(token)) {
      skipped++;
      continue;
    }
    seen.add(token);
    unique.push({ ...entry, token });
  }

  // Les QR doivent être prêts avant le dessin (drawCard lit le cache).
  await prepareQrImages(unique.map((entry) => entry.token));

  const photos = new Map<string, string>();
  if (options.includePhotos) {
    const candidates = unique.filter((entry) => Boolean(entry.photoUrl)).slice(0, 200);
    const loaded = await Promise.all(
      candidates.map(async (entry) => ({
        token: entry.token,
        dataUrl: await loadImageDataUrl(entry.photoUrl as string),
      })),
    );
    for (const item of loaded) {
      if (item.dataUrl) photos.set(item.token, item.dataUrl);
    }
  }

  for (let index = 0; index < unique.length; index++) {
    const slot = index % CARDS_PER_PAGE;
    if (index > 0 && slot === 0) doc.addPage();

    const entry = unique[index];
    const column = slot % 2;
    const row = Math.floor(slot / 2);
    const x = OFFSET_X_MM + column * (CARD_WIDTH_MM + GAP_X_MM);
    const y = OFFSET_Y_MM + row * (CARD_HEIGHT_MM + GAP_Y_MM);

    drawCard(doc, entry, x, y, options, photos.get(entry.token) || null);
  }

  return { pdf: doc, printed: unique.length, skipped };
}

function drawCard(
  doc: jsPDF,
  entry: BadgePdfEntry,
  x: number,
  y: number,
  options: BadgePdfOptions,
  photoDataUrl: string | null,
) {
  const padding = 4;
  const accentWidth = 3;

  // Fond + bordure
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, CARD_WIDTH_MM, CARD_HEIGHT_MM, 2.5, 2.5, 'FD');

  // Filet d'accent (vert AL-BAYAAN) — lisible aussi en noir et blanc
  doc.setFillColor(4, 108, 78);
  doc.roundedRect(x, y, accentWidth, CARD_HEIGHT_MM, 1.5, 1.5, 'F');

  // Repères de découpe (traits discrets aux quatre angles)
  doc.setDrawColor(160, 174, 192);
  doc.setLineWidth(0.15);
  const mark = 2.4;
  const corners: Array<[number, number, number, number]> = [
    [x, y, 1, 1],
    [x + CARD_WIDTH_MM, y, -1, 1],
    [x, y + CARD_HEIGHT_MM, 1, -1],
    [x + CARD_WIDTH_MM, y + CARD_HEIGHT_MM, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    doc.line(cx, cy, cx + mark * dx, cy);
    doc.line(cx, cy, cx, cy + mark * dy);
  }

  const contentX = x + padding + accentWidth;
  const contentWidth = CARD_WIDTH_MM - padding * 2 - accentWidth;

  // Établissement
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(truncate(doc, options.schoolName.toUpperCase(), contentWidth * 0.7), contentX, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BADGE SCOLAIRE', contentX, y + 10.5);

  // Nom de l'élève
  const nameY = y + 19;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(truncate(doc, entry.lastName.toUpperCase(), contentWidth * 0.72), contentX, nameY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(truncate(doc, entry.firstName, contentWidth * 0.72), contentX, nameY + 5);

  // Classe
  if (entry.className) {
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(truncate(doc, entry.className, contentWidth * 0.6), contentX, nameY + 10.5);
  }

  // Matricule (référence d'identité humaine — jamais dans le QR)
  if (options.includeMatricule !== false && entry.matricule) {
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Matricule : ${entry.matricule}`, contentX, y + CARD_HEIGHT_MM - 14.5);
  }

  // Année scolaire
  if (options.academicYearName) {
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(
      truncate(doc, `Année ${options.academicYearName}`, contentWidth * 0.6),
      contentX,
      y + CARD_HEIGHT_MM - 10.5,
    );
  }

  // Photo (facultative)
  if (photoDataUrl) {
    try {
      doc.addImage(
        photoDataUrl,
        'JPEG',
        contentX,
        y + CARD_HEIGHT_MM - 9,
        9,
        9,
        undefined,
        'FAST',
      );
    } catch {
      // Photo illisible : l'impression du badge n'échoue jamais.
    }
  }

  // QR code — zone de sécurité respectée (aucun texte à moins de 2 mm)
  const qrX = x + CARD_WIDTH_MM - QR_SIZE_MM - 5;
  const qrY = y + (CARD_HEIGHT_MM - QR_SIZE_MM) / 2 + 1;
  const qrDataUrl = qrCache.get(entry.token);
  if (qrDataUrl) {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(qrX - 1.5, qrY - 1.5, QR_SIZE_MM + 3, QR_SIZE_MM + 3, 1.5, 1.5, 'S');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, QR_SIZE_MM, QR_SIZE_MM, undefined, 'FAST');
  }
}

