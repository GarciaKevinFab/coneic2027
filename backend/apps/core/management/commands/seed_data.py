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
    "Ingeniería Civil",
    "Ingeniería Civil y Ambiental",
    "Ingeniería de Construcción",
    "Ingeniería Estructural",
    "Ingeniería Geotécnica",
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

        self._cleanup_existing_data()
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

    def _cleanup_existing_data(self):
        """Clean up existing data in the correct order to avoid protected FK errors."""
        from apps.participants.models import Participant
        from apps.tickets.models import Ticket
        from apps.schedule.models import ScheduleDay

        # Delete in order: participants -> tickets -> ticket types, workshops, etc.
        Participant.objects.all().delete()
        Ticket.objects.all().delete()
        ScheduleDay.objects.all().delete()

        # Delete test users (keep superusers that were not created by seed)
        User.objects.filter(email__endswith="@test.coneic2027.pe").delete()
        User.objects.filter(email="organizador@coneic2027.pe").delete()

        self.stdout.write("  Cleaned up existing data")

    def _create_event_info(self):
        from apps.institutional.models import EventInfo

        EventInfo.objects.all().delete()
        EventInfo.objects.create(
            name="XXXIV CONEIC Huancayo 2027",
            description=(
                "El Congreso Nacional de Estudiantes de Ingeniería Civil (CONEIC) "
                "es el evento académico y estudiantil más grande de ingeniería civil "
                "en el Perú. Organizado por la ANEIC Perú y la Universidad Nacional "
                "del Centro del Perú (UNCP), reúne a estudiantes, docentes y "
                "profesionales del sector bajo la premisa de la innovación y "
                "transformación en la ingeniería civil."
            ),
            edition="XXXIV Edición",
            host_university="Universidad Nacional del Centro del Perú (UNCP)",
            city="Huancayo",
            country="Perú",
            start_date=date(2027, 8, 15),
            end_date=date(2027, 8, 20),
            venue="Campus Universitario UNCP - Huancayo, Junín",
            mission=(
                "Fomentar el desarrollo académico, profesional y humano de los "
                "estudiantes de ingeniería civil del Perú a través del intercambio "
                "de conocimiento, la innovación tecnológica y el fortalecimiento de "
                "la comunidad de ingeniería civil a nivel nacional."
            ),
            vision=(
                "Ser el congreso referente en Latinoamérica que impulse la formación "
                "integral de futuros ingenieros civiles comprometidos con el desarrollo "
                "sostenible e infraestructura del país."
            ),
            history=(
                "El CONEIC se realiza desde 1992, teniendo su primera edición en "
                "Cajamarca. A lo largo de más de 30 años ha sido sede de las mejores "
                "universidades del Perú incluyendo Arequipa, Lima, Cusco, Pucallpa y "
                "Huaraz. Cada año reúne a más de 1500 estudiantes de todo el país para "
                "participar en ponencias magistrales, talleres prácticos, visitas "
                "técnicas, concursos y actividades de networking que fortalecen la "
                "comunidad de ingeniería civil peruana. La edición XXXIV marca el "
                "regreso a Huancayo, después de haber sido sede en 2012."
            ),
        )
        self.stdout.write("  Created event info")

    def _create_sponsors(self):
        from apps.institutional.models import Sponsor

        Sponsor.objects.all().delete()
        sponsors_data = [
            # Platinum
            ("COSAPI", "https://cosapi.com.pe", "platinum", 1),
            ("Graña y Montero (GyM)", "https://gym.com.pe", "platinum", 2),
            ("ODEBRECHT Perú", "https://odebrecht.com.pe", "platinum", 3),
            # Gold
            ("Sika Perú", "https://per.sika.com", "gold", 1),
            ("UNICON", "https://unicon.com.pe", "gold", 2),
            ("Cementos Pacasmayo", "https://cementospacasmayo.com.pe", "gold", 3),
            # Silver
            ("CEMENTOS SOL", "https://unacem.com.pe", "silver", 1),
            ("Aceros Arequipa", "https://acerosarequipa.com", "silver", 2),
            ("CAPECO", "https://capeco.org", "silver", 3),
            # Bronze
            ("Topcon", "https://topcon.com", "bronze", 1),
            ("Hilti", "https://hilti.com.pe", "bronze", 2),
            ("PUCP - Ingeniería Civil", "https://pucp.edu.pe", "bronze", 3),
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
            ("Ing. Roberto Huamán Quispe", "Presidente del Comité Organizador", "UNCP - Facultad de Ingeniería Civil"),
            ("Ing. María Espinoza Rojas", "Vicepresidenta Académica", "UNCP - Facultad de Ingeniería Civil"),
            ("Est. Kevin García Torres", "Director de Tecnología", "UNCP - Facultad de Ingeniería Civil"),
            ("Est. Lucía Mendoza Palacios", "Directora de Comunicaciones", "UNCP - Facultad de Ingeniería Civil"),
            ("Est. Carlos Ríos Huamaní", "Director de Logística", "UNCP - Facultad de Ingeniería Civil"),
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
                    "Visita técnica a obra de construcción",
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
            (
                "Dr. Jorge Alva Hurtado",
                "Experto en ingeniería geotécnica y sísmica con más de 25 años de experiencia. Profesor principal en la UNI y consultor internacional en proyectos de cimentaciones.",
                "Ingeniería Geotécnica Sísmica: Avances y Desafíos en el Perú",
                "Universidad Nacional de Ingeniería",
            ),
            (
                "Ing. Sandra Cecilia Quispe Meza",
                "Especialista en tecnología BIM y gestión de proyectos de construcción. Gerente BIM en COSAPI con certificación buildingSMART.",
                "Implementación BIM en Proyectos de Infraestructura a Gran Escala",
                "COSAPI",
            ),
            (
                "Dr. Carlos Zavala Toledo",
                "Investigador en ingeniería estructural y diseño sísmico. Director del CISMID y referente en vulnerabilidad sísmica de edificaciones.",
                "Diseño Sísmico Basado en Desempeño: Nuevas Tendencias",
                "CISMID - UNI",
            ),
            (
                "Ing. Patricia Giménez Rojas",
                "Especialista en construcción sostenible y certificación LEED. Directora de sostenibilidad en Graña y Montero.",
                "Construcción Sostenible y Certificación LEED en el Perú",
                "Graña y Montero (GyM)",
            ),
            (
                "Dr. Rafael Salinas Basualdo",
                "Investigador en materiales de construcción innovadores y concreto de alto rendimiento. PhD en Ingeniería Civil por la Universidad de Texas.",
                "Concreto de Ultra Alto Rendimiento: Aplicaciones en Infraestructura",
                "Pontificia Universidad Católica del Perú",
            ),
            (
                "Ing. Mónica Álvarez Prado",
                "Experta en gestión de recursos hídricos e ingeniería hidráulica. Consultora del Banco Mundial para proyectos de agua y saneamiento en Latinoamérica.",
                "Gestión Integral de Recursos Hídricos y Cambio Climático",
                "Banco Mundial - Perú",
            ),
            (
                "Dr. Eduardo Fierro Ramos",
                "Especialista en ingeniería de puentes y estructuras especiales. Más de 20 años de experiencia en diseño de puentes atirantados.",
                "Diseño y Construcción de Puentes Modernos en los Andes",
                "MTC - Provías Nacional",
            ),
            (
                "Ing. Fabiola Torres Méndez",
                "Especialista en topografía digital y fotogrametría con drones. Pionera en la implementación de LiDAR aéreo para obras civiles en el Perú.",
                "Topografía Digital y Drones en la Ingeniería Civil Moderna",
                "Topcon Perú",
            ),
            (
                "Dr. Hernán Portocarrero Inga",
                "Profesor e investigador en ingeniería de transportes y planificación vial. Consultor del MTC para el Plan Vial Nacional.",
                "Planificación de Infraestructura Vial Sostenible en el Perú",
                "Universidad Nacional de Ingeniería",
            ),
            (
                "Ing. Claudia Ramos Villanueva",
                "Gerente de proyectos con experiencia en megaproyectos de infraestructura. Especialista en costos, presupuestos y gestión de riesgos en construcción.",
                "Gestión de Megaproyectos: Lecciones Aprendidas en el Perú",
                "CAPECO",
            ),
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
            timezone.datetime(2027, 8, 15, 9, 0)
        )

        workshops_data = [
            # Day 1
            {
                "name": "BIM con Revit y Navisworks",
                "description": "Aprende a modelar proyectos de ingeniería civil en 3D con Autodesk Revit y coordinar disciplinas con Navisworks. Incluye detección de interferencias y generación de planos.",
                "workshop_type": "workshop",
                "speaker": speakers[1],
                "start_time": base_date,
                "end_time": base_date + timedelta(hours=3),
                "location": "Laboratorio de Cómputo A-101",
                "capacity": 40,
            },
            {
                "name": "Diseño Sísmico con ETABS",
                "description": "Modelamiento y análisis sísmico de edificaciones de concreto armado utilizando ETABS. Incluye análisis estático, dinámico modal espectral y verificación según la norma E.030.",
                "workshop_type": "workshop",
                "speaker": speakers[2],
                "start_time": base_date + timedelta(hours=4),
                "end_time": base_date + timedelta(hours=7),
                "location": "Laboratorio de Cómputo A-102",
                "capacity": 35,
            },
            {
                "name": "Conferencia: Ingeniería Geotécnica Sísmica",
                "description": "Avances y desafíos de la ingeniería geotécnica sísmica en el Perú. Casos de estudio y metodologías modernas.",
                "workshop_type": "talk",
                "speaker": speakers[0],
                "start_time": base_date + timedelta(hours=8),
                "end_time": base_date + timedelta(hours=9, minutes=30),
                "location": "Auditorio Principal UNCP",
                "capacity": 500,
            },
            # Day 2
            {
                "name": "Modelamiento Geotécnico con PLAXIS",
                "description": "Análisis geotécnico por elementos finitos con PLAXIS 2D. Incluye modelamiento de excavaciones, taludes, cimentaciones y muros de contención.",
                "workshop_type": "workshop",
                "speaker": speakers[0],
                "start_time": base_date + timedelta(days=1),
                "end_time": base_date + timedelta(days=1, hours=3),
                "location": "Laboratorio de Cómputo B-201",
                "capacity": 30,
            },
            {
                "name": "AutoCAD Civil 3D Avanzado",
                "description": "Diseño geométrico de carreteras, movimiento de tierras y redes de agua y alcantarillado con AutoCAD Civil 3D. Generación de perfiles y secciones transversales.",
                "workshop_type": "workshop",
                "speaker": speakers[7],
                "start_time": base_date + timedelta(days=1, hours=4),
                "end_time": base_date + timedelta(days=1, hours=7),
                "location": "Laboratorio de Cómputo B-202",
                "capacity": 35,
            },
            {
                "name": "Conferencia: Diseño Sísmico Basado en Desempeño",
                "description": "Nuevas tendencias en diseño sísmico basado en desempeño y su aplicación en edificaciones peruanas.",
                "workshop_type": "talk",
                "speaker": speakers[2],
                "start_time": base_date + timedelta(days=1, hours=8),
                "end_time": base_date + timedelta(days=1, hours=9, minutes=30),
                "location": "Auditorio Principal UNCP",
                "capacity": 500,
            },
            # Day 3
            {
                "name": "Costos y Presupuestos con S10",
                "description": "Elaboración de presupuestos de obra, análisis de costos unitarios, fórmulas polinómicas y programación de obra con S10 Costos y Presupuestos.",
                "workshop_type": "workshop",
                "speaker": speakers[9],
                "start_time": base_date + timedelta(days=2),
                "end_time": base_date + timedelta(days=2, hours=3),
                "location": "Laboratorio de Cómputo C-301",
                "capacity": 40,
            },
            {
                "name": "Gestión de Proyectos con MS Project",
                "description": "Planificación y control de proyectos de construcción con Microsoft Project. Diagramas Gantt, ruta crítica, asignación de recursos y seguimiento de obra.",
                "workshop_type": "workshop",
                "speaker": speakers[9],
                "start_time": base_date + timedelta(days=2, hours=4),
                "end_time": base_date + timedelta(days=2, hours=6),
                "location": "Laboratorio de Cómputo C-302",
                "capacity": 40,
            },
            # Day 4
            {
                "name": "Diseño de Puentes con CSiBridge",
                "description": "Modelamiento y diseño de puentes vehiculares con CSiBridge. Análisis por carga móvil, diseño de superestructura y subestructura según norma AASHTO LRFD.",
                "workshop_type": "workshop",
                "speaker": speakers[6],
                "start_time": base_date + timedelta(days=3),
                "end_time": base_date + timedelta(days=3, hours=3),
                "location": "Laboratorio de Cómputo A-101",
                "capacity": 35,
            },
            {
                "name": "Topografía con Drones y Estación Total",
                "description": "Levantamiento topográfico con estación total y drones. Procesamiento fotogramétrico, generación de nube de puntos, MDT y ortofotos con Agisoft Metashape.",
                "workshop_type": "workshop",
                "speaker": speakers[7],
                "start_time": base_date + timedelta(days=3, hours=4),
                "end_time": base_date + timedelta(days=3, hours=7),
                "location": "Campo Deportivo UNCP (práctica de campo)",
                "capacity": 30,
            },
            # Day 5 - Technical visits and closing
            {
                "name": "Visita Técnica: Obra de Construcción Vial",
                "description": "Visita guiada a la obra de mejoramiento de la carretera central en el tramo Huancayo - La Oroya.",
                "workshop_type": "technical_visit",
                "speaker": None,
                "start_time": base_date + timedelta(days=4),
                "end_time": base_date + timedelta(days=4, hours=4),
                "location": "Carretera Central (transporte incluido)",
                "capacity": 25,
            },
            {
                "name": "Conferencia: Gestión de Megaproyectos",
                "description": "Lecciones aprendidas en la gestión de megaproyectos de infraestructura en el Perú.",
                "workshop_type": "talk",
                "speaker": speakers[9],
                "start_time": base_date + timedelta(days=4, hours=5),
                "end_time": base_date + timedelta(days=4, hours=6, minutes=30),
                "location": "Auditorio Principal UNCP",
                "capacity": 500,
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

        # Day 1 - August 15
        day1 = ScheduleDay.objects.create(
            date=date(2027, 8, 15),
            title="Día 1 - Inauguración y Talleres",
            description="Ceremonia de apertura, conferencias magistrales y primeros talleres de BIM y diseño sísmico.",
        )
        items_day1 = [
            ("Registro y Acreditación", "Registro de participantes y entrega de kits.", time(7, 30), time(8, 30), "Hall Principal UNCP", "ceremony", None, None, False),
            ("Ceremonia de Inauguración", "Palabras de bienvenida del comité organizador, ANEIC y autoridades de la UNCP.", time(8, 30), time(9, 30), "Auditorio Principal UNCP", "ceremony", None, None, True),
            ("BIM con Revit y Navisworks", "Taller práctico de modelamiento BIM.", time(10, 0), time(13, 0), "Laboratorio de Cómputo A-101", "workshop", workshops[0] if workshops else None, speakers[1] if len(speakers) > 1 else None, False),
            ("Almuerzo", "Almuerzo para participantes VIP y Premium.", time(13, 0), time(14, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("Diseño Sísmico con ETABS", "Taller práctico de análisis sísmico.", time(14, 0), time(17, 0), "Laboratorio de Cómputo A-102", "workshop", workshops[1] if len(workshops) > 1 else None, speakers[2] if len(speakers) > 2 else None, False),
            ("Conferencia: Ingeniería Geotécnica Sísmica", "Conferencia magistral sobre geotecnia sísmica.", time(17, 30), time(19, 0), "Auditorio Principal UNCP", "conference", workshops[2] if len(workshops) > 2 else None, speakers[0] if speakers else None, True),
            ("Noche de Bienvenida", "Evento social de bienvenida y networking entre delegaciones.", time(19, 30), time(21, 0), "Explanada UNCP", "social", None, None, False),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day1:
            ScheduleItem.objects.create(
                day=day1, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 2 - August 16
        day2 = ScheduleDay.objects.create(
            date=date(2027, 8, 16),
            title="Día 2 - Geotecnia y Diseño Vial",
            description="Talleres de PLAXIS y Civil 3D, conferencias sobre diseño sísmico basado en desempeño.",
        )
        items_day2 = [
            ("Conferencia: Construcción Sostenible y LEED", "Ponencia magistral sobre sostenibilidad.", time(8, 30), time(10, 0), "Auditorio Principal UNCP", "conference", None, speakers[3] if len(speakers) > 3 else None, True),
            ("Modelamiento Geotécnico con PLAXIS", "Taller práctico de análisis geotécnico.", time(10, 0), time(13, 0), "Laboratorio de Cómputo B-201", "workshop", workshops[3] if len(workshops) > 3 else None, speakers[0] if speakers else None, False),
            ("Almuerzo", "Almuerzo para todos los participantes.", time(13, 0), time(14, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("AutoCAD Civil 3D Avanzado", "Taller de diseño vial y movimiento de tierras.", time(14, 0), time(17, 0), "Laboratorio de Cómputo B-202", "workshop", workshops[4] if len(workshops) > 4 else None, speakers[7] if len(speakers) > 7 else None, False),
            ("Conferencia: Diseño Sísmico Basado en Desempeño", "Nuevas tendencias en diseño sísmico.", time(17, 30), time(19, 0), "Auditorio Principal UNCP", "conference", workshops[5] if len(workshops) > 5 else None, speakers[2] if len(speakers) > 2 else None, True),
            ("Cena de Gala", "Cena exclusiva para participantes Premium.", time(20, 0), time(22, 0), "Hotel Presidente - Huancayo", "social", None, None, False),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day2:
            ScheduleItem.objects.create(
                day=day2, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 3 - August 17
        day3 = ScheduleDay.objects.create(
            date=date(2027, 8, 17),
            title="Día 3 - Costos, Presupuestos y Gestión",
            description="Talleres de S10 y MS Project, conferencias sobre recursos hídricos y materiales innovadores.",
        )
        items_day3 = [
            ("Conferencia: Concreto de Ultra Alto Rendimiento", "Ponencia sobre materiales innovadores.", time(8, 30), time(10, 0), "Auditorio Principal UNCP", "conference", None, speakers[4] if len(speakers) > 4 else None, True),
            ("Costos y Presupuestos con S10", "Taller práctico de presupuestos de obra.", time(10, 0), time(13, 0), "Laboratorio de Cómputo C-301", "workshop", workshops[6] if len(workshops) > 6 else None, speakers[9] if len(speakers) > 9 else None, False),
            ("Almuerzo", "Almuerzo para participantes.", time(13, 0), time(14, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("Gestión de Proyectos con MS Project", "Taller de planificación de obras.", time(14, 0), time(16, 0), "Laboratorio de Cómputo C-302", "workshop", workshops[7] if len(workshops) > 7 else None, speakers[9] if len(speakers) > 9 else None, False),
            ("Conferencia: Gestión de Recursos Hídricos", "Conferencia sobre ingeniería hidráulica y cambio climático.", time(16, 30), time(18, 0), "Auditorio Principal UNCP", "conference", None, speakers[5] if len(speakers) > 5 else None, True),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day3:
            ScheduleItem.objects.create(
                day=day3, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 4 - August 18
        day4 = ScheduleDay.objects.create(
            date=date(2027, 8, 18),
            title="Día 4 - Puentes, Topografía y Concursos",
            description="Talleres de CSiBridge y topografía con drones, concursos estudiantiles.",
        )
        items_day4 = [
            ("Conferencia: Diseño de Puentes Modernos en los Andes", "Ponencia sobre ingeniería de puentes.", time(8, 30), time(10, 0), "Auditorio Principal UNCP", "conference", None, speakers[6] if len(speakers) > 6 else None, True),
            ("Diseño de Puentes con CSiBridge", "Taller práctico de diseño de puentes.", time(10, 0), time(13, 0), "Laboratorio de Cómputo A-101", "workshop", workshops[8] if len(workshops) > 8 else None, speakers[6] if len(speakers) > 6 else None, False),
            ("Almuerzo", "Almuerzo para participantes.", time(13, 0), time(14, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("Topografía con Drones y Estación Total", "Práctica de campo con equipos topográficos.", time(14, 0), time(17, 0), "Campo Deportivo UNCP", "workshop", workshops[9] if len(workshops) > 9 else None, speakers[7] if len(speakers) > 7 else None, False),
            ("Concurso de Ponencias Estudiantiles", "Concurso de investigación entre delegaciones.", time(17, 30), time(19, 0), "Auditorio Principal UNCP", "conference", None, None, True),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day4:
            ScheduleItem.objects.create(
                day=day4, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 5 - August 19
        day5 = ScheduleDay.objects.create(
            date=date(2027, 8, 19),
            title="Día 5 - Visitas Técnicas y Conferencias",
            description="Visita técnica a obra vial, conferencias de cierre sobre infraestructura vial y gestión de megaproyectos.",
        )
        items_day5 = [
            ("Visita Técnica: Obra de Construcción Vial", "Visita a obra de mejoramiento vial.", time(8, 0), time(12, 0), "Carretera Central (transporte incluido)", "workshop", workshops[10] if len(workshops) > 10 else None, None, True),
            ("Almuerzo", "Almuerzo de confraternidad.", time(12, 0), time(13, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("Conferencia: Infraestructura Vial Sostenible", "Conferencia sobre planificación vial.", time(13, 30), time(15, 0), "Auditorio Principal UNCP", "conference", None, speakers[8] if len(speakers) > 8 else None, True),
            ("Conferencia: Gestión de Megaproyectos", "Lecciones aprendidas en megaproyectos.", time(15, 30), time(17, 0), "Auditorio Principal UNCP", "conference", workshops[11] if len(workshops) > 11 else None, speakers[9] if len(speakers) > 9 else None, True),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day5:
            ScheduleItem.objects.create(
                day=day5, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        # Day 6 - August 20
        day6 = ScheduleDay.objects.create(
            date=date(2027, 8, 20),
            title="Día 6 - Clausura",
            description="Premiaciones, entrega de certificados y ceremonia de clausura del XXXIV CONEIC.",
        )
        items_day6 = [
            ("Feria de Proyectos Estudiantiles", "Exposición de proyectos de investigación de las delegaciones.", time(9, 0), time(12, 0), "Explanada UNCP", "social", None, None, False),
            ("Almuerzo de Despedida", "Último almuerzo del evento.", time(12, 0), time(13, 0), "Comedor Universitario UNCP", "break", None, None, False),
            ("Premiación de Concursos", "Entrega de premios a ganadores de concursos y ponencias.", time(14, 0), time(15, 30), "Auditorio Principal UNCP", "ceremony", None, None, True),
            ("Ceremonia de Clausura", "Entrega de certificados, traspaso de sede y cierre del XXXIV CONEIC Huancayo 2027.", time(16, 0), time(18, 0), "Auditorio Principal UNCP", "ceremony", None, None, True),
            ("Fiesta de Despedida", "Celebración de cierre del congreso.", time(20, 0), time(23, 0), "Local de eventos - Huancayo", "social", None, None, False),
        ]

        for title, desc, start, end, loc, itype, ws, sp, feat in items_day6:
            ScheduleItem.objects.create(
                day=day6, title=title, description=desc,
                start_time=start, end_time=end, location=loc,
                item_type=itype, workshop=ws, speaker=sp, is_featured=feat,
            )

        self.stdout.write("  Created 6-day schedule")

    def _create_organizer_user(self):
        from apps.participants.models import Participant, ParticipantType

        # Create organizer user
        org_user, created = User.objects.get_or_create(
            email="organizador@coneic2027.pe",
            defaults={
                "full_name": "Administrador CONEIC",
                "phone": "+51999999999",
                "university": "Universidad Nacional del Centro del Perú",
                "career": "Ingeniería Civil",
                "country": "Perú",
                "city": "Huancayo",
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
