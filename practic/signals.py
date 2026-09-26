from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Perfil



@receiver(post_save, sender=User)
def crear_perfil_automaticamente(sender, instance, created, **kwargs):
    if created and not hasattr(instance, 'perfil'):
        rut = getattr(instance, '_rut_temporal', None)
        if rut:
            Perfil.objects.create(user=instance, rut=rut, rol='PRACT')