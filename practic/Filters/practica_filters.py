import django_filters
from ..models import Practica

class PracticaFilter(django_filters.FilterSet):
    class Meta:
        model = Practica
        fields = {
            'estado': ['exact'],
            'empresa__username': ['icontains'],
            'fecha_inicio': ['gte', 'lte'],
            'fecha_termino': ['gte', 'lte'],
            'practicante__perfil__rut': ['exact'],
        }