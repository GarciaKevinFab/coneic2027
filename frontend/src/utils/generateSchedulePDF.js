import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const PRIMARY_BLUE = [26, 58, 107]; // #1A3A6B
const GOLD = [244, 165, 36]; // #F4A524
const WHITE = [255, 255, 255];
const LIGHT_BLUE_ROW = [240, 245, 255];
const DARK_TEXT = [30, 30, 30];
const GRAY_TEXT = [120, 120, 120];

// Activity-type colors for cells (RGB arrays)
const TYPE_COLORS = {
  keynote: { bg: [26, 58, 107], text: [255, 255, 255] },
  workshop: { bg: [244, 165, 36], text: [255, 255, 255] },
  panel: { bg: [124, 58, 237], text: [255, 255, 255] },
  ceremony: { bg: [5, 150, 105], text: [255, 255, 255] },
  social: { bg: [236, 72, 153], text: [255, 255, 255] },
  competition: { bg: [239, 68, 68], text: [255, 255, 255] },
  break: { bg: [156, 163, 175], text: [255, 255, 255] },
};

// Spanish labels for item_type
const TYPE_LABELS = {
  keynote: 'Ponencia',
  workshop: 'Taller',
  panel: 'Panel',
  ceremony: 'Ceremonia',
  social: 'Social',
  competition: 'Concurso',
  break: 'Receso',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSpeakerName(item) {
  if (!item.speaker && !item.speaker_name) return '-';
  if (typeof item.speaker === 'object' && item.speaker?.name) return item.speaker.name;
  return item.speaker_name || item.speaker || '-';
}

function getTypeLabel(type) {
  return TYPE_LABELS[type] || type || 'Actividad';
}

function formatDateForHeader(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function todayFormatted() {
  return new Date().toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

export default function generateSchedulePDF(scheduleDays) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;

  // -----------------------------------------------------------------------
  // Cover page
  // -----------------------------------------------------------------------
  // Blue background header block
  doc.setFillColor(...PRIMARY_BLUE);
  doc.rect(0, 0, pageWidth, 90, 'F');

  // Gold accent line
  doc.setFillColor(...GOLD);
  doc.rect(0, 90, pageWidth, 3, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...WHITE);
  doc.text('XXXIV CONEIC Huancayo 2027', pageWidth / 2, 38, { align: 'center' });

  // Subtitle line 1
  doc.setFontSize(16);
  doc.setTextColor(200, 215, 240);
  doc.text('Cronograma Oficial', pageWidth / 2, 52, { align: 'center' });

  // Subtitle line 2
  doc.setFontSize(11);
  doc.setTextColor(180, 200, 230);
  doc.text(
    '15 - 20 de Agosto, 2027 | Universidad Nacional del Centro del Peru (UNCP)',
    pageWidth / 2,
    66,
    { align: 'center' },
  );

  // Stats on cover
  const totalActivities = scheduleDays.reduce(
    (acc, d) => acc + (d.items?.length || 0),
    0,
  );
  doc.setFontSize(12);
  doc.setTextColor(...DARK_TEXT);
  doc.text(
    `${scheduleDays.length} dias de actividades  |  ${totalActivities} eventos programados`,
    pageWidth / 2,
    110,
    { align: 'center' },
  );

  // Gold divider
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin + 40, 118, pageWidth - margin - 40, 118);

  // Day summary list on cover
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_TEXT);
  let coverY = 128;
  scheduleDays.forEach((day, idx) => {
    const dateLabel = formatDateForHeader(day.date);
    const dayTitle = day.title || `Dia ${idx + 1}`;
    const count = day.items?.length || 0;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_BLUE);
    doc.text(`${dayTitle}`, margin + 45, coverY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`  -  ${dateLabel}  (${count} actividades)`, margin + 45 + doc.getTextWidth(`${dayTitle}`) + 2, coverY);
    coverY += 7;
  });

  // -----------------------------------------------------------------------
  // One page per day
  // -----------------------------------------------------------------------
  scheduleDays.forEach((day, dayIdx) => {
    doc.addPage();

    const items = day.items || [];
    const dateLabel = formatDateForHeader(day.date);
    const dayTitle = day.title || `Dia ${dayIdx + 1}`;

    // Day header bar
    doc.setFillColor(...PRIMARY_BLUE);
    doc.rect(0, 0, pageWidth, 22, 'F');

    // Gold accent
    doc.setFillColor(...GOLD);
    doc.rect(0, 22, pageWidth, 1.5, 'F');

    // Day title in header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text(dayTitle, margin, 14);

    // Date on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(200, 215, 240);
    doc.text(dateLabel, pageWidth - margin, 14, { align: 'right' });

    // Table data
    const tableBody = items.map((item) => {
      const itemType = item.item_type || item.type || 'break';
      return {
        hora: `${item.start_time || ''} - ${item.end_time || ''}`,
        actividad: item.title || '',
        tipo: getTypeLabel(itemType),
        lugar: item.location || '-',
        ponente: getSpeakerName(item),
        _itemType: itemType,
        _isFeatured: !!item.is_featured,
      };
    });

    doc.autoTable({
      startY: 28,
      margin: { left: margin, right: margin },
      head: [['Hora', 'Actividad', 'Tipo', 'Lugar', 'Ponente']],
      body: tableBody.map((row) => [
        row.hora,
        row.actividad,
        row.tipo,
        row.lugar,
        row.ponente,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3.5,
        lineColor: [220, 225, 235],
        lineWidth: 0.2,
        textColor: DARK_TEXT,
        font: 'helvetica',
      },
      headStyles: {
        fillColor: PRIMARY_BLUE,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 9.5,
        halign: 'left',
      },
      columnStyles: {
        0: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 28, halign: 'center' },
        3: { cellWidth: 45 },
        4: { cellWidth: 45 },
      },
      alternateRowStyles: {
        fillColor: LIGHT_BLUE_ROW,
      },
      didParseCell: (data) => {
        // Color-code the "Tipo" column (index 2) in body rows
        if (data.section === 'body' && data.column.index === 2) {
          const rowData = tableBody[data.row.index];
          if (rowData) {
            const colors = TYPE_COLORS[rowData._itemType] || TYPE_COLORS.break;
            data.cell.styles.fillColor = colors.bg;
            data.cell.styles.textColor = colors.text;
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 8;
          }
        }

        // Bold the "Actividad" column for featured items
        if (data.section === 'body' && data.column.index === 1) {
          const rowData = tableBody[data.row.index];
          if (rowData && rowData._isFeatured) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = PRIMARY_BLUE;
          }
        }
      },
      didDrawPage: () => {
        // Footer on each day page
        doc.setFontSize(7);
        doc.setTextColor(...GRAY_TEXT);
        doc.text(
          'XXXIV CONEIC Huancayo 2027 - Cronograma Oficial',
          margin,
          pageHeight - 6,
        );
        doc.text(
          `Pagina ${doc.internal.getNumberOfPages()}`,
          pageWidth - margin,
          pageHeight - 6,
          { align: 'right' },
        );
        // Gold bottom line
        doc.setDrawColor(...GOLD);
        doc.setLineWidth(0.5);
        doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);
      },
    });
  });

  // -----------------------------------------------------------------------
  // Final notes page
  // -----------------------------------------------------------------------
  doc.addPage();

  // Header bar
  doc.setFillColor(...PRIMARY_BLUE);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 22, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...WHITE);
  doc.text('Informacion Adicional', margin, 14);

  // Note box
  const boxY = 35;
  doc.setFillColor(255, 250, 235);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, boxY, pageWidth - margin * 2, 25, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_BLUE);
  doc.text('Nota:', margin + 6, boxY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  doc.text(
    'El cronograma esta sujeto a cambios. Consulte la pagina oficial para obtener la version mas actualizada.',
    margin + 20,
    boxY + 10,
  );

  // Contact info
  let infoY = boxY + 40;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_BLUE);
  doc.text('Contacto', margin, infoY);

  infoY += 9;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);

  const contactLines = [
    'Sitio web: https://coneic2027.com',
    'Email: info@coneic2027.com',
    'Sede: Universidad Nacional del Centro del Peru (UNCP), Huancayo',
    'Fechas: 15 - 20 de Agosto, 2027',
  ];

  contactLines.forEach((line) => {
    doc.text(line, margin + 4, infoY);
    infoY += 7;
  });

  // Generation timestamp
  infoY += 10;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(margin, infoY - 5, pageWidth - margin, infoY - 5);

  doc.setFontSize(9);
  doc.setTextColor(...GRAY_TEXT);
  doc.text(`Generado el ${todayFormatted()}`, margin, infoY);

  // Footer
  doc.setFontSize(7);
  doc.text(
    'XXXIV CONEIC Huancayo 2027 - Cronograma Oficial',
    margin,
    pageHeight - 6,
  );
  doc.text(
    `Pagina ${doc.internal.getNumberOfPages()}`,
    pageWidth - margin,
    pageHeight - 6,
    { align: 'right' },
  );
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 9, pageWidth - margin, pageHeight - 9);

  // -----------------------------------------------------------------------
  // Save
  // -----------------------------------------------------------------------
  doc.save('CONEIC_2027_Cronograma.pdf');
}
