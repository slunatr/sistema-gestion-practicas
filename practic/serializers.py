from rest_framework import serializers
from django.contrib.auth.models import User
import re
from .models import Practica, EstadoPractica, Perfil,Postulacion
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    rut = serializers.CharField(write_only=True)  # se usa para crear Perfil, pero no pertenece a User
    rol = serializers.ChoiceField(choices=Perfil._meta.get_field('rol').choices, default='PRACT', write_only=True)
    #rol = serializers.CharField(write_only=True, default='PRACT')
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'rut', 'rol']
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_rut(self, value):
        """Valida formato y dígito verificador de un RUT chileno."""
        rut_regex = r'^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$'
        if not re.match(rut_regex, value):
            raise serializers.ValidationError("El RUT debe tener el formato XX.XXX.XXX-X")

        rut_clean = value.replace('.', '').upper()
        cuerpo, dv = rut_clean.split('-')
        reversed_digits = map(int, reversed(cuerpo))
        factors = [2, 3, 4, 5, 6, 7] * 10
        s = sum(d * f for d, f in zip(reversed_digits, factors))
        remainder = 11 - (s % 11)
        dv_expected = '0' if remainder == 11 else 'K' if remainder == 10 else str(remainder)

        if dv != dv_expected:
            raise serializers.ValidationError("El RUT tiene un dígito verificador inválido.")
        return value

    def create(self, validated_data):
        rut = validated_data.pop('rut')
        rol = validated_data.pop('rol')
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        perfil, created = Perfil.objects.get_or_create(user=user, defaults={'rut': rut, 'rol': rol})
        if not created:
         perfil.rut = rut
         perfil.rol = rol
         perfil.save()

        return user

class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'rol']

    def get_rol(self, obj):
        try:
            return obj.perfil.rol  # asume relación OneToOne con Perfil
        except:
            return None

    def update(self, instance, validated_data):
        nuevo_rol = validated_data.pop('nuevo_rol', None)

        # No tocamos User en este caso (solo rol de Perfil)
        if nuevo_rol:
            perfil = instance.perfil
            perfil.rol = nuevo_rol
            perfil.save()
        return instance
    

class PostulacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Postulacion
        fields = '__all__'



class PerfilSerializer(serializers.ModelSerializer):
    rol_display = serializers.CharField(source='get_rol_display', read_only=True)
    foto = serializers.ImageField(required=False, allow_null=True)
    cv = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Perfil
        fields = [
            'rut', 'direccion', 'telefono', 'nacionalidad',
            'carrera', 'rol', 'rol_display', 'foto', 'cv'
        ]
        read_only_fields = ['rol']


 
class PracticaSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.SerializerMethodField()
    practicante_rut = serializers.SerializerMethodField()
    informe_evaluacion = serializers.FileField(required=False, allow_null=True)
    evaluador_nombre = serializers.SerializerMethodField()
    practicante_nombre = serializers.SerializerMethodField()

    class Meta:
        model = Practica
        fields = '__all__'

    def get_empresa_nombre(self, obj):
        return obj.empresa.first_name 

    def get_practicante_rut(self, obj):
        return obj.practicante.perfil.rut if obj.practicante and hasattr(obj.practicante, 'perfil') else None
    

    def get_practicante_nombre(self, obj):
            if obj.practicante:
                return f"{obj.practicante.first_name} {obj.practicante.last_name}"
            return None


    def validate(self, data):
        estado = data.get('estado', self.instance.estado if self.instance else None)
        nota = data.get('nota', self.instance.nota if self.instance else None)
        if estado == EstadoPractica.EVALUADA and nota is None:
            raise serializers.ValidationError("No se puede establecer 'Evaluada' sin nota.")
        return data

    def get_evaluador_nombre(self, obj):
        if obj.evaluador:
            return f"{obj.evaluador.first_name} {obj.evaluador.last_name}"
        return None

