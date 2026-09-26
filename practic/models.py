
from django.contrib.auth.models import User
from django.db import models

from django.db.models.signals import post_delete
from django.dispatch import receiver


#PRUEBA 

#LOGIN#

#ruta personalizadaaa
def user_directory_path(instance, filename):
    # Archivos guardados en media/users/<username>/<filename>
    return f'users/{instance.user.username}/{filename}'


#ROLES DE USUARIOO
class RolUsuario(models.TextChoices):
    ADMINISTRADOR = 'ADMIN', 'Administrador'
    COORDINADOR = 'COORD', 'Coordinador'
    EVALUADOR = 'EVAL', 'Evaluador'
    PRACTICANTE = 'PRACT', 'Practicante'
    EMPRESA = 'EMPRESA', 'Empresa'


#MODELO DE PERFIL
class Perfil(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    rut = models.CharField(max_length=20, unique=True)
    direccion = models.CharField(max_length=255, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    nacionalidad = models.CharField(max_length=50, blank=True)
    carrera = models.CharField(max_length=100, blank=True)
    rol = models.CharField(
        max_length=20,
        choices=RolUsuario.choices,
        default=RolUsuario.PRACTICANTE
    )
    foto = models.ImageField(upload_to='fotos_perfil/', null=True, blank=True)
    cv = models.FileField(upload_to='curriculums/', null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} ({self.get_rol_display()})"


@receiver(post_delete, sender=User)
def eliminar_perfil_asociado(sender, instance, **kwargs):
    try:
        instance.perfil.delete()
    except Perfil.DoesNotExist:
        pass



######PRACTICA########

#ESTADO DE PRACTICAS#
class EstadoPractica(models.TextChoices):
    PENDIENTE = 'PENDIENTE', 'Pendiente'  # Nueva: cuando la empresa la crea y espera autorización
    PUBLICADA = 'PUBLICADA', 'Publicada' # Aprobada por el coordinador, visible al practicante
    POR_REVISAR='POR_REVISAR', ' Por revisar ' # Practicas que necesitan nuevamente una revisión por parte de la empresa
    ASIGNADA = 'ASIGNADA', 'Asignada'     # Cuando la empresa elige a un practicante
    EN_CURSO = 'EN_CURSO', 'En curso'     # Cuando la práctica ya inició
    TERMINADA = 'TERMINADA', 'Terminada'  # El practicante terminó, aún no se evalúa
    EVALUADA = 'EVALUADA', 'Evaluada'     # Evaluada por un evaluador (empresa u otro)
    APROBADA = 'APROBADA', 'Aprobada'     # Aprobada por el coordinador o administrador
    RECHAZADA = 'RECHAZADA', 'Rechazada'  # Rechazada por el coordinador/admin

class Practica(models.Model):
    titulo = models.CharField(max_length=255)
    descripcion = models.TextField()
    empresa = models.ForeignKey(User, on_delete=models.CASCADE, related_name='practicas_publicadas')
    practicante = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='mis_practicas')
    fecha_inicio = models.DateField(null=True, blank=True)
    fecha_termino = models.DateField(null=True, blank=True)
    estado = models.CharField(max_length=20, choices=EstadoPractica.choices, default=EstadoPractica.ASIGNADA)
    nota = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    comentarios = models.TextField(null=True, blank=True)
    documentos = models.FileField(upload_to='documentos_practicas/', null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    informe_evaluacion = models.FileField(upload_to='informes/', null=True, blank=True)
    evaluador = models.ForeignKey(User,null=True,blank=True,on_delete=models.SET_NULL,related_name='practicas_evaluadas')

    def save(self, *args, **kwargs):
        if self.estado == EstadoPractica.EVALUADA and self.nota is None: #  no permitir estado Evaluada sin nota
            raise ValueError("No se puede establecer el estado 'Evaluada' sin una nota.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titulo} - {self.get_estado_display()}"
    

class Postulacion(models.Model):
    practicante = models.ForeignKey(User, on_delete=models.CASCADE)
    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name="postulaciones")
    fecha_postulacion = models.DateTimeField(auto_now_add=True)
    aprobado_por_coordinador = models.BooleanField(default=False)

    class Meta:
        unique_together = ('practicante', 'practica')


    

class HistorialEstado(models.Model):
    practica = models.ForeignKey(Practica, on_delete=models.CASCADE, related_name='historial')
    estado_anterior = models.CharField(max_length=20, choices=EstadoPractica.choices)
    estado_nuevo = models.CharField(max_length=20, choices=EstadoPractica.choices)
    cambiado_por = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    fecha_cambio = models.DateTimeField(auto_now_add=True)





##### NOTIFICACIONES ######

class Notificacion(models.Model):
    destinatario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.CharField(max_length=255)
    leida = models.BooleanField(default=False)
    creada_en = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Para: {self.destinatario.username} | {self.mensaje[:30]}"
    

archivo_evaluacion = models.FileField(
    upload_to='evaluaciones/',
    null=True,
    blank=True
)
nota = models.FloatField(null=True, blank=True)
comentario = models.TextField(null=True, blank=True)
