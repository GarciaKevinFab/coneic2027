"""
Management command to seed the database with test data for CONEIC 2027.
Usage: python manage.py seed_data
"""
import random
from datetime import date, time, timedelta
from decimal import Decimal
from uuid import uuid4

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

UNIVERSITIES = [
    "Universidad Nacional de Ingeniería",
    "Universidad Nacional Mayor de San Marcos",
    "Pontificia Universidad Católica del Perú",
    "Universidad Nacional de San Agustín",
    "Universidad Nacional de Trujillo",
    "Universidad de Lima",
    "Universidad del Pacífico",
    "Universidad Nacional Federico Villarreal",
    "Universidad Nacional de Piura",
    "Universidad Peruana de Ciencias Aplicadas",
]

CAREERS = [
    "Ingeniería de Computación",
    "Ingeniería de Sistemas",
    "Ciencias de la Computación",
    "Ingeniería Informática",
    "Ingeniería de Software",
]

CITIES = [
    ("Lima", "Perú"),
    ("Arequipa", "Perú"),
    ("Trujillo", "Perú"),
    ("Cusco", "Perú"),
    ("Piura", "Perú"),
    ("Chiclayo", "Perú"),
    ("Huancayo", "Perú"),
    ("Iquitos", "Perú"),
]

FIRST_NAMES = [
    "Carlos", "María", "Juan", "Ana", "Luis", "Rosa", "Pedro", "Carmen",
    "José", "Lucía", "Miguel", "Elena", "Diego", "Sofía", "Andrés",
    "Valentina", "Fernando", "Daniela", "Ricardo", "Gabriela",
    "Alejandro", "Patricia", "Sebastián", "Camila", "Mateo",
]

LAST_NAMES = [
    "García", "Rodríguez", "Martínez", "López", "Hernández",
    "González", "Pérez", "Sánchez", "Ramírez", "Torres",
    "Flores", "Rivera", "Gómez", "Díaz", "Cruz",
    "Morales", "Reyes", "Gutiérrez", "Ortega", "Castillo",
]


class Command(BaseCommand):
    help = "Seed the database with test data for CONEIC 2027"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        self._create_event_info()
        self._create_sponsors()
        self._create_committee()
        ticket_types = self._create_ticket_types()
        speakers = self._create_speakers()
        workshops = self._create_workshops(speakers, ticket_types)
        self._create_schedule(workshops, speakers)
        self._create_organizer_user()
        self._create_test_users(ticket_types, workshops)

        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))

    def _create_event_info(self):
        from apps.institutional.models import EventInfo

        EventInfo.objects.all().delete()
        EventInfo.objects.create(
            name="CONEIC 2027",
            description=(
                "El Congreso Nacional de Estudiantes de Ingeniería de Computación "
                "es el evento académico y tecnológico más importante para estudiantes "
                "de computación en el Perú. Reúne a las mejores universidades del país "
                "para compartir conocimiento, innovación y networking."
            ),
            edition="XXVIII Edición",
            host_university="Universidad Nacional de Ingeniería",
            city="Lima",
            country="Perú",
            start_date=date(2027, 8, 18),
            end_date=date(2027, 8, 20),
            venue="Centro de Convenciones UNI",
            mission=(
                "Fomentar el desarrollo académico y profesional de los estudiantes "
                "de ingeniería de computación a través del intercambio de conocimiento, "
                "la innovación tecnológica y el networking entre universidades."
            ),
            vision=(
                "Ser el congreso referente en Latinoamérica que impulse la formación "
                "de líderes tecnológicos comprometidos con el desarrollo del país."
            ),
            history=(
                "El CONEIC se realiza desde 1999 y ha sido sede de las mejores "
                "universidades del Perú. Cada año reúne a más de 1500 estudiantes "
                "de todo el país para participar en talleres, ponencias y actividades "
                "de networking que fortalecen la comunidad de ingeniería de computación."
            ),
        )
        self.stdout.write("  Created event info")

    def _create_sponsors(self):
        from apps.institutional.models import Sponsor

        Sponsor.objects.all().delete()
        sponsors_data = [
            # Platinum
            ("Microsoft", "https://microsoft.com", "platinum", 1),
            ("Google Cloud", "https://cloud.google.com", "platinum", 2),
            ("AWS", "https://aws.amazon.com", "platinum", 3),
            # Gold
            ("IBM", "https://ibm.com", "gold", 1),
            ("Oracle", "https://oracle.com", "gold", 2),
            ("Nvidia", "https://nvidia.com", "gold", 3),
            # Silver
            ("GitHub", "https://github.com", "silver", 1),
            ("JetBrains", "https://jetbrains.com", "silver", 2),
            ("DigitalOcean", "https://digitalocean.com", "silver", 3),
            # Bronze
            ("Platzi", "https://platzi.com", "bronze", 1),
            ("Código Facilito", "https://codigofacilito.com", "bronze", 2),
            ("Educación IT", "https://educacionit.com", "bronze", 3),
            # Media
            ("TechCrunch Latam", "https://techcrunch.com", "media", 1),
            ("Gestión", "https://gestion.pe", "media", 2),
            ("Hipertextual", "https://hipertextual.com", "media", 3),
        ]
        for name, website, tier, order in sponsors_data:
            Sponsor.objects.create(
                name=name, website=website, tier=tier, order=order
            )
        self.stdout.write(f"  Created {len(sponsors_data)} sponsors")

    def _create_committee(self):
        from apps.institutional.models import OrganizingCommittee

        OrganizingCommittee.objects.all().delete()
        members = [
            ("Dr. Ricardo Mendoza", "Presidente del Comité", "Universidad Nacional de Ingeniería"),
            ("Ing. Sofía Castillo", "Vicepresidenta Académica", "Universidad Nacional de Ingeniería"),
            ("Carlos Gutiérrez", "Director de Logística", "Universidad Nacional Mayor de San Marcos"),
            ("Ana Torres", "Directora de Comunicaciones", "Pontificia Universidad Católica del Perú"),
            ("Miguel Flores", "Director de Tecnología", "Universidad Nacional de Ingeniería"),
        ]
        for i, (name, role, univ) in enumerate(members):
            OrganizingCommittee.objects.create(
                name=name, role=role, university=univ, order=i + 1
            )
        self.stdout.write(f"  Created {len(members)} committee members")

    def _create_ticket_types(self):
        from apps.tickets.models import TicketType

        TicketType.objects.all().delete()
        types_data = [
            {
                "name": "Estándar",
                "description": "Acceso a todas las conferencias y ceremonias",
                "price": Decimal("150.00"),
                "benefits": [
                    "Acceso a conferencias magistrales",
                    "Acceso a ceremonias de apertura y clausura",
                    "Kit del participante",
                    "Certificado de asistencia",
                    "Coffee break",
                ],
                "includes_workshops": False,
                "max_workshop_slots": 0,
                "capacity": 800,
                "available_until": timezone.now() + timedelta(days=150),
            },
            {
                "name": "VIP",
                "description": "Acceso completo + 2 talleres a elección",
                "price": Decimal("280.00"),
                "benefits": [
                    "Todo lo incluido en Estándar",
                    "Acceso a 2 talleres prácticos",
                    "Almuerzo incluido los 3 días",
                    "Asiento preferencial en conferencias",
                    "Networking exclusivo con ponentes",
                ],
                "includes_workshops": True,
                "max_workshop_slots": 2,
                "capacity": 400,
                "available_until": timezone.now() + timedelta(days=150),
            },
            {
                "name": "Premium",
                "description": "Acceso total + todos los talleres + beneficios exclusivos",
                "price": Decimal("400.00"),
                "benefits": [
                    "Todo lo incluido en VIP",
                    "Acceso a TODOS los talleres",
                    "Visita técnica a empresa tecnológica",
                    "Cena de gala",
                    "Polo exclusivo CONEIC 2027",
                    "Mención en el programa oficial",
                ],
                "includes_workshops": True,
                "max_workshop_slots": 10,
                "capacity": 200,
                "available_until": timezone.now() + timedelta(days=150),
            },
            {
                "name": "Organizador",
                "description": "Entrada para miembros del comité organizador",
                "price": Decimal("0.00"),
                "benefits": [
                    "Acceso total al evento",
                    "Acceso a todos los talleres",
                    "Acceso a áreas restringidas",
                ],
                "includes_workshops": True,
                "max_workshop_slots": 10,
                "capacity": 50,
                "available_until": timezone.now() + timedelta(days=200),
            },
            {
                "name": "Ponente",
                "description": "Entrada para ponentes invitados",
                "price": Decimal("0.00"),
                "benefits": [
                    "Acceso total al evento",
                    "Hospedaje incluido",
                    "Transporte desde el aeropuerto",
                    "Certificado de ponente",
                ],
                "includes_workshops": True,
                "max_workshop_slots": 10,
                "capacity": 30,
                "available_until": timezone.now() + timedelta(days=200),
            },
        ]
        ticket_types = []
        for data in types_data:
            tt = TicketType.objects.create(**data)
            ticket_types.append(tt)
        self.stdout.write(f"  Created {len(types_data)} ticket types")
        return ticket_types

    def _create_speakers(self):
        from apps.workshops.models import Speaker

        Speaker.objects.all().delete()
        speakers_data = [
            ("Dr. Alejandro Ríos", "Experto en inteligencia artificial con 15 años de experiencia en Google DeepMind.", "IA Generativa: El Futuro de la Computación", "Google DeepMind"),
            ("Ing. Valentina Paredes", "Arquitecta de soluciones cloud en AWS con especialización en sistemas distribuidos.", "Arquitectura de Microservicios en la Nube", "Amazon Web Services"),
            ("Dr. Fernando Quiroz", "Investigador en ciberseguridad y profesor en el MIT.", "Ciberseguridad en la Era de la IA", "MIT"),
            ("Ing. Camila Rojas", "Líder técnica en Meta, especialista en sistemas de realidad virtual.", "Metaverso y Realidad Extendida", "Meta"),
            ("Dr. Sebastián Vargas", "Científico de datos senior en Netflix, PhD en Stanford.", "Big Data y Sistemas de Recomendación", "Netflix"),
            ("Ing. Patricia Luna", "Directora de ingeniería en Rappi, experta en fintech.", "Innovación Fintech en Latinoamérica", "Rappi"),
            ("Dr. Mateo Salazar", "Investigador en computación cuántica en IBM Research.", "Computación Cuántica: Estado Actual y Futuro", "IBM Research"),
            ("Ing. Gabriela Mendoza", "DevOps lead en Microsoft, especialista en CI/CD.", "DevOps y SRE: Prácticas Modernas", "Microsoft"),
            ("Dr. Diego Herrera", "Profesor de blockchain y sistemas distribuidos en Stanford.", "Blockchain Beyond Crypto", "Stanford University"),
            ("Ing. Lucía Morales", "CTO de una startup de healthtech, ex-Google.", "Emprendimiento Tech desde la Universidad", "HealthAI Labs"),
        ]
        speakers = []
        for name, bio, topic, org in speakers_data:
            s = Speaker.objects.create(
                name=name, bio=bio, topic=topic, organization=org
            )
            speakers.append(s)
        self.stdout.write(f"  Created {len(speakers_data)} speakers")
        return speakers

    def _create_workshops(self, speakers, ticket_types):
        from apps.workshops.models import Workshop

        Workshop.objects.all().delete()
        base_date = timezone.make_aware(
            timezone.datetime(2027, 8, 18, 9, 0)
        )

        workshops_data = [
            # Day 1
            {
                "name": "Taller de Machine Learning con Python",
                "description": "Aprende a construir modelos de ML desde cero usando scikit-learn y TensorFlow.",
                "workshop_type": "workshop",
                "speaker": speakers[0],
                "start_time": base_date,
                "end_time": base_date + timedelta(hours=3),
                "location": "Laboratorio A-101",
                "capacity": 40,
            },
            {
                "name": "Desarrollo de APIs con FastAPI",
                "description": "Crea APIs RESTful modernas y de alto rendimiento con FastAPI.",
                "workshop_type": "workshop",
                "speaker": speakers[1],
                "start_time": base_date + timedelta(hours=4),
                "end_time": base_date + timedelta(hours=7),
                "location": "Laboratorio A-102",
                "capacity": 35,
            },
            {
                "name": "Conferencia: IA Generativa",
                "description": "El futuro de la computación y cómo la IA generativa está transformando la industria.",
                "workshop_type": "talk",
                "speaker": speakers[0],
                "start_time": base_date + timedelta(hours=8),
                "end_time": base_date + timedelta(hours=9, minutes=30),
                "location": "Auditorio Principal",
                "capacity": 500,
            },
            # Day 2
            {
                "name": "Taller de Ciberseguridad Ofensiva",
                "description": "Aprende técnicas de pentesting ético y análisis de vulnerabilidades.",
                "workshop_type": "workshop",
                "speaker": speakers[2],
                "start_time": base_date + timedelta(days=1),
                "end_time": base_date + timedelta(days=1, hours=3),
                "location": "Laboratorio B-201",
                "capacity": 30,
            },
            {
                "name": "Cloud Native con Kubernetes",
                "description": "Despliega aplicaciones containerizadas con Docker y Kubernetes.",
                "workshop_type": "workshop",
                "speaker": speakers[7],
                "start_time": base_date + timedelta(days=1, hours=4),
                "end_time": base_date + timedelta(days=1, hours=7),
                "location": "Laboratorio B-202",
                "capacity": 35,
            },
            {
                "name": "Conferencia: Blockchain Beyond Crypto",
                "description": "Aplicaciones de blockchain más allá de las criptomonedas.",
                "workshop_type": "talk",
                "speaker": speakers[8],
                "start_time": base_date + timedelta(days=1, hours=8),
                "end_time": base_date + timedelta(days=1, hours=9, minutes=30),
                "location": "Auditorio Principal",
                "capacity": 500,
            },
            # Day 3
            {
                "name": "Visita Técnica: Data Center de Google",
                "description": "Visita guiada al data center de Google en Lima.",
                "workshop_type": "technical_visit",
                "speaker": None,
                "start_time": base_date + timedelta(days=2),
                "end_time": base_date + timedelta(days=2, hours=4),
                "location": "Google Lima (transporte incluido)",
                "capacity": 25,
            },
            {
                "name": "Taller de Emprendimiento Tech",
                "description": "Cómo crear tu startup tecnológica desde la universidad.",
                "workshop_type": "workshop",
                "speaker": speakers[9],
                "start_time": base_date + timedelta(days=2, hours=5),
                "end_time": base_date + timedelta(days=2, hours=7),
                "location": "Sala de Conferencias C-301",
                "capacity": 50,
            },
        ]

        workshops = []
        vip_type = ticket_types[1]  # VIP
        premium_type = ticket_types[2]  # Premium
        org_type = ticket_types[3]  # Organizador
        speaker_type = ticket_types[4]  # Ponente

        for data in workshops_data:
            w = Workshop.objects.create(**data)
            if data["workshop_type"] in ("workshop", "technical_visit"):
                w.required_ticket_types.add(vip_type, premium_type, org_type, speaker_type)
            workshops.append(w)

        self.stdout.write(f"  Created {len(workshops_data)} workshops")
        return workshops

    def _create_schedule(self, workshops, speakers):
        from apps.schedule.models import ScheduleDay, ScheduleItem

        ScheduleDay.objects.all().delete()

        # Day 1
        day1 = ScheduleDay.objects.create(
            date=date(2027, 8, 18),
            title="Día 1 - Inauguración y Talleres",
            description="Ceremonia de apertura, conferencias magistrales y primeros talleres.",
        )
        items_day1 = [
            ("Registro y Acreditación", "Registro de participantes y entrega de kits.", time(7, 30), time(8, 30), "Hall Principal", "ceremony", None, None, False),
            ("Ceremonia de Inauguración", "Palabras de bienvenida del comité organizador y autoridades.", time(8, 30), time(9, 30), "Auditorio Principal", "ceremony", None, None, True),
            ("Taller de Machine Learning con Python", "Taller práctico de ML.", time(10, 0), time(13, 0), "Laboratorio A-101", "workshop", workshops[0] if workshops else None, speakers[0] if speakers else None, False),
            ("Almuerzo", "Almuerzo para participantes VIP y Premium.", time(13, 0), time(14, 0), "Comedor", "break", None, None, False),
            ("Desarrollo de APIs con FastAPI", "Taller práctico de FastAPI.", time(14, 0), time(17, 0), "Laboratorio A-102", "workshop", workshops[1] if len(workshops) > 1 else None, speakers[1] if len(speakers) > 1 else None, False),
            ("Conferencia: IA Generativa", "Conferencia magistral sobre IA.", time(17, 30), time(19, 0), "Auditorio Principal", "conference", workshops[2] if len(workshops) > 2 else None, speakers[0] if speakers else None, True),
            ("Networking Night", "Evento social de networking.", time(19, 30), time(21, 0), "Terraza", "social", None, None, False),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day1:
            ScheduleItem.objects.create(
                day=day1, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 2
        day2 = ScheduleDay.objects.create(
            date=date(2027, 8, 19),
            title="Día 2 - Conferencias y Talleres",
            description="Conferencias técnicas, talleres avanzados y actividades de networking.",
        )
        items_day2 = [
            ("Conferencia: Big Data y Sistemas de Recomendación", "Ponencia magistral.", time(8, 30), time(10, 0), "Auditorio Principal", "conference", None, speakers[4] if len(speakers) > 4 else None, True),
            ("Taller de Ciberseguridad Ofensiva", "Taller práctico de pentesting.", time(10, 0), time(13, 0), "Laboratorio B-201", "workshop", workshops[3] if len(workshops) > 3 else None, speakers[2] if len(speakers) > 2 else None, False),
            ("Almuerzo", "Almuerzo para todos los participantes.", time(13, 0), time(14, 0), "Comedor", "break", None, None, False),
            ("Cloud Native con Kubernetes", "Taller de contenedores y orquestación.", time(14, 0), time(17, 0), "Laboratorio B-202", "workshop", workshops[4] if len(workshops) > 4 else None, speakers[7] if len(speakers) > 7 else None, False),
            ("Conferencia: Blockchain Beyond Crypto", "Conferencia sobre blockchain.", time(17, 30), time(19, 0), "Auditorio Principal", "conference", workshops[5] if len(workshops) > 5 else None, speakers[8] if len(speakers) > 8 else None, True),
            ("Cena de Gala", "Cena exclusiva para participantes Premium.", time(20, 0), time(22, 0), "Salón de Gala", "social", None, None, False),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day2:
            ScheduleItem.objects.create(
                day=day2, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 3
        day3 = ScheduleDay.objects.create(
            date=date(2027, 8, 20),
            title="Día 3 - Visitas Técnicas y Clausura",
            description="Visitas técnicas a empresas, últimos talleres y ceremonia de clausura.",
        )
        items_day3 = [
            ("Visita Técnica: Data Center de Google", "Visita guiada.", time(8, 0), time(12, 0), "Google Lima", "workshop", workshops[6] if len(workshops) > 6 else None, None, True),
            ("Almuerzo", "Último almuerzo del evento.", time(12, 0), time(13, 0), "Comedor", "break", None, None, False),
            ("Taller de Emprendimiento Tech", "Cómo crear tu startup.", time(13, 0), time(15, 0), "Sala C-301", "workshop", workshops[7] if len(workshops) > 7 else None, speakers[9] if len(speakers) > 9 else None, False),
            ("Conferencia: Emprendimiento Tech desde la Universidad", "Conferencia de cierre.", time(15, 30), time(17, 0), "Auditorio Principal", "conference", None, speakers[9] if len(speakers) > 9 else None, True),
            ("Ceremonia de Clausura", "Entrega de certificados y cierre del CONEIC 2027.", time(17, 30), time(19, 0), "Auditorio Principal", "ceremony", None, None, True),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day3:
            ScheduleItem.objects.create(
                day=day3, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        self.stdout.write("  Created 3-day schedule")

    def _create_organizer_user(self):
        from apps.participants.models import Participant, ParticipantType

        # Create organizer user
        org_user, created = User.objects.get_or_create(
            email="organizador@coneic2027.pe",
            defaults={
                "full_name": "Administrador CONEIC",
                "phone": "+51999999999",
                "university": "Universidad Nacional de Ingeniería",
                "career": "Ingeniería de Computación",
                "country": "Perú",
                "city": "Lima",
                "is_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            org_user.set_password("Admin2027!")
            org_user.save()

        org_type, _ = ParticipantType.objects.get_or_create(
            name="organizer",
            defaults={"description": "Miembro del comité organizador"},
        )

        Participant.objects.get_or_create(
            user=org_user,
            defaults={
                "participant_type": org_type,
                "is_accredited": True,
                "accredited_at": timezone.now(),
                "payment_status": "paid",
            },
        )
        self.stdout.write("  Created organizer user: organizador@coneic2027.pe / Admin2027!")

    def _create_test_users(self, ticket_types, workshops):
        from apps.participants.models import Participant, ParticipantType
        from apps.tickets.models import Ticket

        student_type, _ = ParticipantType.objects.get_or_create(
            name="student",
            defaults={"description": "Estudiante universitario"},
        )
        pro_type, _ = ParticipantType.objects.get_or_create(
            name="professional",
            defaults={"description": "Profesional"},
        )
        ParticipantType.objects.get_or_create(
            name="speaker",
            defaults={"description": "Ponente invitado"},
        )

        for i in range(50):
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            city, country = random.choice(CITIES)
            email = f"user{i+1}@test.coneic2027.pe"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": f"{first} {last}",
                    "phone": f"+519{random.randint(10000000, 99999999)}",
                    "university": random.choice(UNIVERSITIES),
                    "career": random.choice(CAREERS),
                    "country": country,
                    "city": city,
                    "is_verified": True,
                },
            )
            if created:
                user.set_password("Test2027!")
                user.save()

            # Assign ticket (80% standard, 15% VIP, 5% premium)
            roll = random.random()
            if roll < 0.05:
                tt = ticket_types[2]  # Premium
            elif roll < 0.20:
                tt = ticket_types[1]  # VIP
            else:
                tt = ticket_types[0]  # Estándar

            is_paid = random.random() < 0.85

            ticket, _ = Ticket.objects.get_or_create(
                user=user,
                defaults={
                    "ticket_type": tt,
                    "status": "confirmed" if is_paid else "pending",
                    "payment_method": random.choice(["culqi", "yape"]),
                    "payment_reference": str(uuid4())[:20],
                    "amount_paid": tt.price if is_paid else Decimal("0"),
                },
            )

            if is_paid:
                tt.sold_count += 1
                tt.save(update_fields=["sold_count"])

            p_type = student_type if random.random() < 0.8 else pro_type
            participant, _ = Participant.objects.get_or_create(
                user=user,
                defaults={
                    "participant_type": p_type,
                    "is_accredited": random.random() < 0.3,
                    "payment_status": "paid" if is_paid else "pending",
                    "ticket": ticket,
                },
            )

            # Assign random workshops if ticket includes them
            if tt.includes_workshops and workshops:
                num_ws = min(tt.max_workshop_slots, len(workshops))
                selected = random.sample(
                    [w for w in workshops if w.workshop_type != "talk"],
                    min(num_ws, len([w for w in workshops if w.workshop_type != "talk"])),
                )
                participant.selected_workshops.set(selected)
                for w in selected:
                    w.enrolled_count += 1
                    w.save(update_fields=["enrolled_count"])

        self.stdout.write("  Created 50 test users with tickets and workshops")
