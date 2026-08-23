import requests
from django.conf import settings


def enviar_correo_recuperacion(destinatario_email: str, destinatario_nombre: str, link_reset: str) -> bool:
    """
    Envía el correo de recuperación de contraseña vía la API transaccional de Brevo.
    Devuelve True/False según el envío; nunca lanza excepción hacia arriba para
    no romper el flujo del request si Brevo falla momentáneamente (igual que el
    patrón usado en whatsapp.py para notificar_nueva_solicitud).
    """
    api_key = settings.BREVO_API_KEY
    if not api_key:
        return False

    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [{"email": destinatario_email, "name": destinatario_nombre}],
        "subject": "Recupera tu contraseña — MN WOMEN",
        "htmlContent": f"""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                <h2 style="color: #B66878;">Recupera tu contraseña</h2>
                <p>Hola {destinatario_nombre},</p>
                <p>Recibimos una solicitud para restablecer tu contraseña en MN WOMEN.
                   Si fuiste tú, haz clic en el siguiente botón:</p>
                <p style="margin: 24px 0;">
                    <a href="{link_reset}"
                       style="background-color: #B66878; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 6px; display: inline-block;">
                        Restablecer contraseña
                    </a>
                </p>
                <p style="color: #666; font-size: 13px;">
                    Este link expira en 3 días. Si tú no solicitaste este cambio,
                    puedes ignorar este correo con confianza.
                </p>
            </div>
        """,
    }

    try:
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "accept": "application/json",
                "api-key": api_key,
                "content-type": "application/json",
            },
            json=payload,
            timeout=10,
        )
        return response.status_code in (200, 201)
    except requests.RequestException:
        return False