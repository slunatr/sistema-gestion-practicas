from .models import Notificacion
from django.contrib.auth.models import User

def enviar_notificacion(usuario, mensaje):
    """
    Crea una notificación para el usuario destinatario.
    """
    if isinstance(usuario, User):
        Notificacion.objects.create(destinatario=usuario, mensaje=mensaje)