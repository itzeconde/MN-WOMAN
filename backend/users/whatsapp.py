import requests
import os


def notificar_nueva_solicitud(user):
    """Envía notificación WhatsApp al admin cuando llega una nueva solicitud"""
    phone = os.getenv('WHATSAPP_PHONE')
    apikey = os.getenv('WHATSAPP_APIKEY')

    if not phone or not apikey:
        return  # Si no están configuradas las vars, no falla

    nombre = user.get_full_name() or user.username
    empresa = user.company or 'Sin empresa'
    sector = user.get_business_sector_display() or 'Sin sector'

    mensaje = (
        f"🌸 *Nueva solicitud en MN WOMAN*\n\n"
        f"👤 *Nombre:* {nombre}\n"
        f"🏢 *Empresa:* {empresa}\n"
        f"📂 *Sector:* {sector}\n\n"
        f"Revisa el panel de administración para aprobar o rechazar."
    )

    try:
        requests.get(
            'https://api.callmebot.com/whatsapp.php',
            params={
                'phone': phone,
                'text': mensaje,
                'apikey': apikey,
            },
            timeout=5
        )
    except Exception:
        pass  # No romper el registro si WhatsApp falla