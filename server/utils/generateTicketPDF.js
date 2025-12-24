import PDFDocument from "pdfkit";

export const generateTicketPDF = (booking, res) => {
  const doc = new PDFDocument({ size: [420, 210], margin: 0 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=ticket_${booking._id}.pdf`
  );

  doc.pipe(res);

  /* ======================
     TICKET BACKGROUND
  ====================== */
  doc
    .rect(10, 10, 400, 190)
    .lineWidth(1)
    .strokeColor("#E2E8F0")
    .stroke();

  doc
    .fillColor("#F8FAFC")
    .rect(11, 11, 398, 188)
    .fill();

  /* ======================
     HEADER BAR
  ====================== */
  doc.rect(30, 25, 360, 40).fill("#1E293B");

  doc
    .fillColor("#FFFFFF")
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("MOVIE PASS", 30, 38, {
      align: "center",
      characterSpacing: 2
    });

  /* ======================
     PERFORATION LINES
  ====================== */
  doc
    .dash(5, { space: 3 })
    .strokeColor("#CBD5E1")
    .moveTo(80, 25)
    .lineTo(80, 175)
    .stroke();

  doc
    .moveTo(340, 25)
    .lineTo(340, 175)
    .stroke();

  doc.undash();

  /* ======================
     CONTENT AREA
  ====================== */
  const startX = 100;
  const colTwo = 240;

  // Movie title
  doc
    .fillColor("#64748B")
    .fontSize(8)
    .font("Helvetica")
    .text("MOVIE TITLE", startX, 85);

  doc
    .fillColor("#0F172A")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(
      booking.show.movie.title.toUpperCase(),
      startX,
      97
    );

  // Divider
  doc
    .moveTo(startX, 125)
    .lineTo(320, 125)
    .strokeColor("#CBD5E1")
    .lineWidth(0.7)
    .stroke();

  // Date & Time
  doc
    .fillColor("#64748B")
    .fontSize(8)
    .font("Helvetica")
    .text("DATE & TIME", startX, 140);

  doc
    .fillColor("#0F172A")
    .fontSize(10)
    .font("Helvetica-Bold")
    .text(
      new Date(booking.show.showDateTime).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      startX,
      152
    );

  // Seats
  doc
    .fillColor("#64748B")
    .fontSize(8)
    .text("SEATS", colTwo, 140);

  doc
    .fillColor("#0F172A")
    .fontSize(11)
    .font("Helvetica-Bold")
    .text(booking.bookedSeats.join(", "), colTwo, 152);

  // Footer row
  doc
    .fillColor("#475569")
    .fontSize(7)
    .text(`PAID: INR ${booking.amount}`, startX, 175);

  doc.text(
    `ID: ${booking._id.toString().toUpperCase().slice(-10)}`,
    colTwo,
    175
  );

  /* ======================
     SIDE CUTOUTS
  ====================== */
  doc.circle(10, 105, 12).fill("#F8FAFC");
  doc.circle(410, 105, 12).fill("#F8FAFC");

  /* ======================
     STUB TEXT
  ====================== */
  doc.save();
  doc.rotate(-90, { origin: [50, 100] });
  doc
    .fillColor("#94A3B8")
    .fontSize(8)
    .text("CineBuzz", 10, 100);
  doc.restore();

  doc.end();
};
