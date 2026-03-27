# CONEIC 2027 - Sistema Digital del Congreso Nacional de Estudiantes de Ingenieria de Computacion

Sistema completo (PWA + API REST) para la gestion del CONEIC 2027.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Backend | Django 5.x + Django REST Framework |
| Frontend | React 18 + Vite + Tailwind CSS 3 |
| Base de datos | PostgreSQL 15 |
| Autenticacion | JWT (djangorestframework-simplejwt) |
| QR | qrcode (Python) + qr-scanner (JS) |
| Certificados | ReportLab (PDF) |
| Pagos | Culqi (tarjetas) + YAPE |
| Correos | django-anymail con Resend |
| Cache/colas | Redis + Celery |
| Servidor web | Nginx + Gunicorn |
| Contenedores | Docker + Docker Compose |
| PWA | vite-plugin-pwa |

## Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Git**
- (Opcional para desarrollo sin Docker): Python 3.12+, Node.js 20+, PostgreSQL 15, Redis

## Inicio Rapido con Docker (Recomendado)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Memory-US/coneic2027.git
cd coneic2027
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus valores reales:
- `SECRET_KEY`: genera una clave secreta de Django
- `DB_PASSWORD`: password para PostgreSQL
- `CULQI_PUBLIC_KEY` / `CULQI_SECRET_KEY`: claves de Culqi (puedes usar las de prueba)
- `RESEND_API_KEY`: clave de Resend para correos

### 3. Levantar los servicios

```bash
# Desarrollo
docker compose up --build

# Produccion
docker compose -f docker-compose.prod.yml up --build -d
```

### 4. Ejecutar migraciones y seed data

```bash
# En otra terminal (o despues de que los contenedores esten corriendo)
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_data
```

### 5. Acceder al sistema

| Servicio | URL |
|----------|-----|
| Frontend (PWA) | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Admin Django | http://localhost:8000/admin/ |

### Credenciales de prueba

| Usuario | Contrasena | Rol |
|---------|-----------|-----|
| organizador@coneic2027.pe | Admin2027! | Organizador/Admin |
| user1@test.coneic2027.pe | Test2027! | Participante |

## Desarrollo sin Docker

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o en Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Variables de entorno (crear .env en la raiz del proyecto)
# Asegurate de tener PostgreSQL y Redis corriendo

# Migraciones
python manage.py migrate

# Datos de prueba
python manage.py seed_data

# Crear superusuario (opcional, seed_data ya crea uno)
python manage.py createsuperuser

# Iniciar servidor
python manage.py runserver

# En otra terminal - iniciar Celery worker
celery -A config worker -l info
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build de produccion
npm run build
```

## Estructura del Proyecto

```
coneic2027/
├── backend/
│   ├── config/              # Settings, URLs, Celery, WSGI/ASGI
│   ├── apps/
│   │   ├── users/           # Autenticacion y gestion de usuarios
│   │   ├── participants/    # Tipos de participante y acreditacion
│   │   ├── tickets/         # Entradas, compras, QR
│   │   ├── payments/        # Integracion Culqi + YAPE
│   │   ├── workshops/       # Talleres, ponencias, ponentes
│   │   ├── schedule/        # Cronograma del evento
│   │   ├── certificates/    # Generacion y validacion de certificados
│   │   ├── institutional/   # Sponsors, comite, info del evento
│   │   └── core/            # Panel admin, exports, seed data
│   ├── requirements.txt
│   ├── Dockerfile
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # Paginas publicas, dashboard, organizador
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand (estado global)
│   │   ├── services/        # Llamadas a la API (axios)
│   │   └── utils/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
├── nginx/
│   └── nginx.conf
├── docker-compose.yml       # Desarrollo
├── docker-compose.prod.yml  # Produccion
└── .env.example
```

## API Endpoints

### Autenticacion
- `POST /api/auth/register/` - Registro
- `GET /api/auth/verify-email/<token>/` - Verificar email
- `POST /api/auth/login/` - Login (JWT)
- `POST /api/auth/token/refresh/` - Refresh token
- `POST /api/auth/password-reset/` - Solicitar reset
- `GET/PUT /api/auth/profile/` - Perfil

### Participantes
- `GET /api/participants/` - Listar (admin)
- `GET /api/participants/me/` - Mi info
- `POST /api/participants/accredit/<qr_token>/` - Acreditar

### Entradas
- `GET /api/tickets/types/` - Tipos disponibles
- `POST /api/tickets/purchase/` - Comprar
- `GET /api/tickets/my-ticket/` - Mi entrada

### Pagos
- `POST /api/payments/culqi/charge/` - Pago con tarjeta
- `POST /api/payments/yape/charge/` - Pago con YAPE
- `POST /api/payments/webhook/` - Webhook Culqi

### Talleres
- `GET /api/workshops/` - Listar
- `POST /api/workshops/<id>/enroll/` - Inscribirse
- `GET /api/workshops/my-workshops/` - Mis talleres

### Cronograma
- `GET /api/schedule/` - Completo
- `GET /api/schedule/day/<date>/` - Por dia

### Certificados
- `GET /api/certificates/my-certificates/` - Mis certificados
- `GET /api/certificates/validate/<code>/` - Validar (publico)

### Institucional
- `GET /api/institutional/event/` - Info del evento
- `GET /api/institutional/sponsors/` - Sponsors
- `GET /api/institutional/committee/` - Comite

### Admin/Organizador
- `GET /api/admin/participants/` - Lista con filtros
- `GET /api/admin/participants/export/` - Exportar Excel
- `GET /api/admin/stats/` - Estadisticas
- `POST /api/admin/accredit/<qr_token>/` - Acreditar

## Deploy en Produccion (Ubuntu 22.04)

### 1. Preparar el servidor

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose-v2 -y
sudo systemctl enable docker
```

### 2. Configurar SSL con Let's Encrypt

```bash
sudo apt install certbot -y
sudo certbot certonly --standalone -d coneic2027.pe -d www.coneic2027.pe
```

### 3. Clonar y configurar

```bash
git clone https://github.com/Memory-US/coneic2027.git /opt/coneic2027
cd /opt/coneic2027
cp .env.example .env
nano .env  # Editar con valores de produccion
```

### 4. Levantar en produccion

```bash
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_data
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### 5. Verificar

```bash
docker compose -f docker-compose.prod.yml ps
curl -I https://coneic2027.pe
```

## Notas Importantes

- Los iconos PWA (`public/icons/icon-192.png` y `icon-512.png`) son placeholders. Reemplazalos con iconos reales del CONEIC.
- Las claves de Culqi en `.env.example` son placeholders. Usa las claves de prueba de Culqi para desarrollo.
- El `favicon.ico` necesita ser reemplazado con el logo oficial.
- Para correos, necesitas configurar Resend o SendGrid con un dominio verificado.
- Redis debe estar corriendo para que Celery funcione (generacion de certificados, envio de correos).

## Licencia

Proyecto desarrollado para el CONEIC 2027.
