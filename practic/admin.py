from django.contrib import admin
from .models import Notificacion, Practica,Perfil,HistorialEstado

# Register your models here.
from django.contrib import admin
from .models import Perfil



from django import forms
from .models import Practica
from django.contrib.auth import get_user_model

User = get_user_model()

class PracticaAdminForm(forms.ModelForm):
    class Meta:
        model = Practica
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['practicante'].queryset = User.objects.filter(rol='PRACT')
        


#admin.site.register(Notificacion)
@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ['destinatario', 'mensaje', 'leida', 'creada_en']
    list_filter = ['leida']
    search_fields = ['mensaje', 'destinatario__username']
    readonly_fields = ['creada_en']


@admin.register(Perfil)
class PerfilAdmin(admin.ModelAdmin):
    list_display = ('id','user', 'rut', 'rol')
    search_fields = ('user__email', 'rut')
    list_filter = ('rol',)

@admin.register(Practica)
class PracticaAdmin(admin.ModelAdmin):
    form = PracticaAdminForm
    list_display = ('id', 'titulo', 'empresa', 'estado')
    search_fields = ('titulo', 'empresa__username')
    list_filter = ('estado',)
    fields = (
        'titulo', 'descripcion', 'empresa', 'practicante',
        'estado', 'nota', 'comentarios',
        'fecha_inicio', 'fecha_termino'
    )
@admin.register(HistorialEstado)
class HistorialEstadoAdmin(admin.ModelAdmin):
    list_display = ['id','practica', 'estado_anterior', 'estado_nuevo', 'cambiado_por', 'fecha_cambio']
    list_filter = ['estado_nuevo', 'estado_anterior']
    search_fields = ['practica__titulo', 'cambiado_por__username']
    readonly_fields = ['fecha_cambio']

    
