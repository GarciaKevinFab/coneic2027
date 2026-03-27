"""
Celery configuration for CONEIC 2027 project.

Uses Redis as broker and result backend.  Auto-discovers tasks from all
installed apps under the ``apps`` namespace.
"""

import os

from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("coneic2027")

# Load config from Django settings; all Celery-related keys use the CELERY_ prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks.py in every installed app.
app.autodiscover_tasks()

# ---------------------------------------------------------------------------
# Periodic tasks (Celery Beat)
# ---------------------------------------------------------------------------
app.conf.beat_schedule = {
    # Example: send payment reminders every day at 08:00 Lima time
    "send-payment-reminders": {
        "task": "apps.payments.tasks.send_payment_reminders",
        "schedule": crontab(hour=8, minute=0),
    },
    # Example: clean expired tokens weekly on Sundays at 03:00
    "clean-expired-tokens": {
        "task": "apps.users.tasks.clean_expired_tokens",
        "schedule": crontab(hour=3, minute=0, day_of_week="sunday"),
    },
}


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Simple task for verifying the Celery worker is operational."""
    print(f"Request: {self.request!r}")
