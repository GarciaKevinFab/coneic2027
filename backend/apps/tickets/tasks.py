import io
import logging
from datetime import datetime

from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
)
def generate_receipt_pdf(self, ticket_id: int):
    """
    Generate a PDF receipt for a confirmed ticket and attach it to the
    Ticket model instance.

    Uses ReportLab to build a professional-looking receipt that includes
    the congress branding, ticket details, purchase code, and amount paid.
    """
    from apps.tickets.models import Ticket

    try:
        ticket = Ticket.objects.select_related("ticket_type", "user").get(
            pk=ticket_id,
        )
    except Ticket.DoesNotExist:
        logger.error("generate_receipt_pdf: Ticket %s not found.", ticket_id)
        return

    if ticket.status != Ticket.Status.CONFIRMED:
        logger.warning(
            "generate_receipt_pdf: Ticket %s is not confirmed (status=%s).",
            ticket_id,
            ticket.status,
        )
        return

    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReceiptTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#1a237e"),
        spaceAfter=12,
        alignment=1,  # center
    )

    subtitle_style = ParagraphStyle(
        "ReceiptSubtitle",
        parent=styles["Heading2"],
        fontSize=14,
        textColor=colors.HexColor("#424242"),
        spaceAfter=20,
        alignment=1,
    )

    normal_style = ParagraphStyle(
        "ReceiptNormal",
        parent=styles["Normal"],
        fontSize=11,
        spaceAfter=6,
    )

    elements = []

    # Header
    elements.append(Paragraph("CONEIC 2027", title_style))
    elements.append(
        Paragraph(
            "Congreso Nacional de Estudiantes de Ingenieria Civil",
            subtitle_style,
        )
    )
    elements.append(Spacer(1, 0.5 * cm))
    elements.append(Paragraph("COMPROBANTE DE COMPRA", title_style))
    elements.append(Spacer(1, 1 * cm))

    # Ticket details table
    user_display = getattr(ticket.user, "get_full_name", lambda: str(ticket.user))()
    user_email = getattr(ticket.user, "email", "")

    data = [
        ["Campo", "Detalle"],
        ["Asistente", user_display],
        ["Correo", user_email],
        ["Tipo de entrada", ticket.ticket_type.name],
        ["Codigo de compra", str(ticket.purchase_code)],
        ["Metodo de pago", ticket.get_payment_method_display()],
        ["Referencia de pago", ticket.payment_reference or "---"],
        ["Monto pagado", f"S/ {ticket.amount_paid}"],
        [
            "Fecha de compra",
            ticket.purchased_at.strftime("%d/%m/%Y %H:%M") if ticket.purchased_at else "---",
        ],
        ["Estado", ticket.get_status_display()],
    ]

    table = Table(data, colWidths=[6 * cm, 10 * cm])
    table.setStyle(
        TableStyle(
            [
                # Header row
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
                ("ALIGN", (0, 0), (-1, 0), "CENTER"),
                # Data rows
                ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 1), (-1, -1), 10),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f5f5")]),
                # Grid
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e0e0e0")),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    elements.append(table)
    elements.append(Spacer(1, 1.5 * cm))

    # Benefits section
    if ticket.ticket_type.benefits:
        elements.append(Paragraph("Beneficios incluidos:", normal_style))
        for benefit in ticket.ticket_type.benefits:
            elements.append(
                Paragraph(f"  &bull;  {benefit}", normal_style)
            )
        elements.append(Spacer(1, 1 * cm))

    # Footer
    footer_style = ParagraphStyle(
        "ReceiptFooter",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#757575"),
        alignment=1,
    )
    generated_at = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    elements.append(
        Paragraph(
            f"Documento generado automaticamente el {generated_at}.",
            footer_style,
        )
    )
    elements.append(
        Paragraph(
            "Este comprobante no constituye una factura o boleta de venta.",
            footer_style,
        )
    )

    doc.build(elements)

    pdf_content = buffer.getvalue()
    buffer.close()

    filename = f"comprobante_{ticket.purchase_code}.pdf"
    ticket.receipt_pdf.save(filename, ContentFile(pdf_content), save=True)

    logger.info(
        "Receipt PDF generated for ticket %s (%s).",
        ticket.purchase_code,
        filename,
    )


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
)
def send_purchase_confirmation_email(self, ticket_id: int):
    """
    Send a confirmation email to the user after their ticket purchase
    has been successfully confirmed.

    Attaches the receipt PDF if it has already been generated.
    """
    from apps.tickets.models import Ticket

    try:
        ticket = Ticket.objects.select_related("ticket_type", "user").get(
            pk=ticket_id,
        )
    except Ticket.DoesNotExist:
        logger.error(
            "send_purchase_confirmation_email: Ticket %s not found.", ticket_id
        )
        return

    if ticket.status != Ticket.Status.CONFIRMED:
        logger.warning(
            "send_purchase_confirmation_email: Ticket %s not confirmed.", ticket_id
        )
        return

    user = ticket.user
    user_email = getattr(user, "email", None)
    if not user_email:
        logger.warning(
            "send_purchase_confirmation_email: User %s has no email.", user.pk
        )
        return

    user_name = getattr(user, "get_full_name", lambda: str(user))()

    subject = "CONEIC 2027 - Confirmacion de compra de entrada"

    body = (
        f"Hola {user_name},\n\n"
        f"Tu compra ha sido confirmada exitosamente.\n\n"
        f"Detalles de tu entrada:\n"
        f"  Tipo: {ticket.ticket_type.name}\n"
        f"  Codigo de compra: {ticket.purchase_code}\n"
        f"  Monto pagado: S/ {ticket.amount_paid}\n"
        f"  Metodo de pago: {ticket.get_payment_method_display()}\n\n"
        f"Presenta tu codigo QR en el evento para el registro.\n"
        f"Puedes acceder a tu entrada y descargar tu comprobante "
        f"desde tu perfil en la plataforma.\n\n"
        f"Nos vemos en CONEIC 2027!\n\n"
        f"---\n"
        f"Congreso Nacional de Estudiantes de Ingenieria Civil\n"
        f"Este es un correo automatico, por favor no responder."
    )

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@coneic2027.pe")

    email = EmailMessage(
        subject=subject,
        body=body,
        from_email=from_email,
        to=[user_email],
    )

    # Attach the receipt PDF if available
    if ticket.receipt_pdf:
        try:
            ticket.receipt_pdf.open("rb")
            email.attach(
                filename=f"comprobante_{ticket.purchase_code}.pdf",
                content=ticket.receipt_pdf.read(),
                mimetype="application/pdf",
            )
            ticket.receipt_pdf.close()
        except Exception:
            logger.warning(
                "Could not attach receipt PDF for ticket %s.",
                ticket.purchase_code,
                exc_info=True,
            )

    email.send(fail_silently=False)

    logger.info(
        "Confirmation email sent to %s for ticket %s.",
        user_email,
        ticket.purchase_code,
    )
