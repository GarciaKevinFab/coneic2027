import hashlib
import hmac
import logging

import requests
from decouple import config

logger = logging.getLogger(__name__)

CULQI_API_BASE = "https://api.culqi.com/v2"


class CulqiError(Exception):
    """Raised when the Culqi API returns an error response."""

    def __init__(self, message: str, status_code: int = 0, raw: dict | None = None):
        self.message = message
        self.status_code = status_code
        self.raw = raw or {}
        super().__init__(self.message)


class CulqiService:
    """
    Client for the Culqi payment gateway API v2.

    All monetary amounts are expressed in **centimos** (cents).
    For example, S/ 150.00 = 15000 centimos.

    Environment variables required:
        CULQI_SECRET_KEY   - Secret key for server-side API calls.
        CULQI_WEBHOOK_SECRET - Shared secret for verifying webhook HMAC signatures.
    """

    def __init__(self):
        self.secret_key: str = config("CULQI_SECRET_KEY")
        self.webhook_secret: str = config("CULQI_WEBHOOK_SECRET")
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.secret_key}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

    # ------------------------------------------------------------------
    # Card charge
    # ------------------------------------------------------------------
    def create_charge(
        self,
        token: str,
        amount_cents: int,
        email: str,
        metadata: dict | None = None,
    ) -> dict:
        """
        Create a one-time card charge via Culqi.

        Args:
            token: Culqi token generated on the frontend (``tkn_...``).
            amount_cents: Amount to charge **in centimos** (e.g. 15000 = S/ 150).
            email: Payer's email address.
            metadata: Optional key-value pairs attached to the charge.

        Returns:
            Parsed JSON response from Culqi containing the charge details.

        Raises:
            CulqiError: If the API returns a non-2xx status.
        """
        payload = {
            "amount": amount_cents,
            "currency_code": "PEN",
            "email": email,
            "source_id": token,
        }
        if metadata:
            payload["metadata"] = metadata

        response = self.session.post(f"{CULQI_API_BASE}/charges", json=payload)
        data = response.json()

        if response.status_code not in (200, 201):
            merchant_message = data.get("merchant_message", "Error desconocido")
            logger.error(
                "Culqi charge failed: status=%s body=%s",
                response.status_code,
                data,
            )
            raise CulqiError(
                message=merchant_message,
                status_code=response.status_code,
                raw=data,
            )

        logger.info("Culqi charge created: id=%s", data.get("id"))
        return data

    # ------------------------------------------------------------------
    # Yape charge
    # ------------------------------------------------------------------
    def create_yape_charge(
        self,
        phone: str,
        otp: str,
        amount_cents: int,
        metadata: dict | None = None,
    ) -> dict:
        """
        Create a charge using YAPE via Culqi's dedicated endpoint.

        Args:
            phone: YAPE-registered phone number (9 digits).
            otp: One-time password from the YAPE app.
            amount_cents: Amount in centimos.
            metadata: Optional metadata key-value pairs.

        Returns:
            Parsed JSON response from Culqi.

        Raises:
            CulqiError: If the API returns a non-2xx status.
        """
        payload = {
            "amount": amount_cents,
            "currency_code": "PEN",
            "additional_info": {
                "phone": phone,
                "otp": otp,
            },
        }
        if metadata:
            payload["metadata"] = metadata

        response = self.session.post(
            f"{CULQI_API_BASE}/charges/yape",
            json=payload,
        )
        data = response.json()

        if response.status_code not in (200, 201):
            merchant_message = data.get("merchant_message", "Error desconocido")
            logger.error(
                "Culqi YAPE charge failed: status=%s body=%s",
                response.status_code,
                data,
            )
            raise CulqiError(
                message=merchant_message,
                status_code=response.status_code,
                raw=data,
            )

        logger.info("Culqi YAPE charge created: id=%s", data.get("id"))
        return data

    # ------------------------------------------------------------------
    # Webhook verification
    # ------------------------------------------------------------------
    def verify_webhook(self, payload: bytes, signature: str) -> bool:
        """
        Verify the HMAC-SHA256 signature of an incoming Culqi webhook.

        Args:
            payload: Raw request body bytes.
            signature: Value of the ``X-Culqi-Signature`` header.

        Returns:
            ``True`` if the computed digest matches the provided signature.
        """
        expected = hmac.new(
            key=self.webhook_secret.encode("utf-8"),
            msg=payload,
            digestmod=hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, signature)
