FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies required by psycopg2, Pillow, and reportlab
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        libjpeg62-turbo-dev \
        zlib1g-dev \
        libfreetype6-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy project source
COPY . .

# Collect static files (uses whitenoise)
RUN DJANGO_SETTINGS_MODULE=config.settings \
    SECRET_KEY=build-placeholder \
    DATABASE_URL=sqlite:///tmp/build.db \
    python manage.py collectstatic --noinput 2>/dev/null || true

# Create non-root user for security
RUN addgroup --system django && \
    adduser --system --ingroup django django && \
    mkdir -p /app/media /app/staticfiles && \
    chown -R django:django /app

USER django

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "gevent", \
     "--worker-tmp-dir", "/dev/shm", \
     "--timeout", "120", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]
