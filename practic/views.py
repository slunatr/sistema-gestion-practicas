from rest_framework.decorators import api_view, permission_classes , parser_classes
from rest_framework.response import Response
from practic.serializers import UserSerializer
from .serializers import PracticaSerializer
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser

from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from practic.serializers import PerfilSerializer,UsuarioSerializer
from .models import Perfil, EstadoPractica, Practica, HistorialEstado , Notificacion,Postulacion
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from .utils import enviar_notificacion
from .serializers import PostulacionSerializer

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from .Filters.practica_filters import PracticaFilter
from .permissions import EsEmpresa, EsEvaluador, EsPracticante, EsAdministrador, EsCoordinador
import pandas as pd
from django.http import HttpResponse
from io import BytesIO
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import IntegrityError




@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # Validación de dominio institucional
    if not (email.endswith('@alumnos.ucentral.cl') or email.endswith('@ucentral.cl')):
        return Response({"error": "Ingresa con tu correo institucional"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)

    if not user.check_password(password):
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

    token, _ = Token.objects.get_or_create(user=user)

    try:
        perfil = Perfil.objects.get(user=user)
        rol = perfil.rol
        foto = perfil.foto.url if perfil.foto else None
    except Perfil.DoesNotExist:
        rol = None
        foto = None

    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "rol": rol,
            "foto": foto,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
def register(request):
    email = request.data.get('email')
    password = request.data.get('password')
    rut = request.data.get('rut')

    if not email or not password or not rut:
        return Response({"error": "Debe ingresar email, contraseña y RUT"}, status=status.HTTP_400_BAD_REQUEST)

    if not (email.endswith('@alumnos.ucentral.cl') or email.endswith('@ucentral.cl')):
        return Response({"error": "Debe usar un correo institucional (@alumnos.ucentral.cl o @ucentral.cl)"}, 
                        status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Ya existe un usuario registrado con ese correo"}, status=status.HTTP_400_BAD_REQUEST)

    if Perfil.objects.filter(rut=rut).exists():
        return Response({"error": "Ya existe un usuario registrado con ese RUT"}, status=status.HTTP_400_BAD_REQUEST)

    # Crear el usuario
    data = request.data.copy()
    data['username'] = email
    serializer = UserSerializer(data=data)

    if serializer.is_valid():
        user = serializer.save()
        user.set_password(password)
        user.save()

        # Crear perfil automáticamente
        Perfil.objects.create(user=user, rut=rut, rol='PRACT')

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            'mensaje': 'Usuario registrado exitosamente. ¡Bienvenido a la plataforma!',
            'token': token.key,
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def profile(request):
    try:
        perfil = get_object_or_404(Perfil, user=request.user)
    except Exception as e:
        return Response({"error": "Perfil no encontrado o usuario no autenticado."}, status=status.HTTP_404_NOT_FOUND)

    serializer = PerfilSerializer(perfil, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({'perfil': serializer.data}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def mi_perfil(request):
    perfil = get_object_or_404(Perfil, user=request.user)

    if request.method == 'GET':
        perfil_serializer = PerfilSerializer(perfil)
        user_data = {
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
        }

        return Response({
            "perfil": perfil_serializer.data,
            "usuario": user_data,
        })

    elif request.method == 'PUT':
        serializer = PerfilSerializer(perfil, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'perfil': serializer.data}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#Usuario empresa 

@api_view(['POST'])
def register_empresa(request):
    email = request.data.get('email')
    password = request.data.get('password')
    rut = request.data.get('rut')

    # Validar campos obligatorios
    if not email or not password or not rut:
        return Response({"error": "Debe ingresar email, contraseña y RUT"}, status=status.HTTP_400_BAD_REQUEST)

    # Validar que el email no esté registrado
    if User.objects.filter(email=email).exists():
        return Response({"error": "Ya existe un usuario registrado con ese correo"}, status=status.HTTP_400_BAD_REQUEST)

    # Validar que el rut no esté registrado en algún perfil
    if Perfil.objects.filter(rut=rut).exists():
        return Response({"error": "Ya existe un perfil registrado con ese RUT"}, status=status.HTTP_400_BAD_REQUEST)

    # Preparar los datos para el serializer
    data = request.data.copy()
    data['username'] = email
    data['rol'] = 'EMPRESA'  # Forzar rol empresa

    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            user.set_password(serializer.validated_data['password'])
            user.save()

            # Intentar crear el perfil
            Perfil.objects.create(user=user, rut=rut, rol='EMPRESA')

            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                'mensaje': 'Registro exitoso. Un administrador revisará tu cuenta.',
                'token': token.key,
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response({"error": "Ya existe un perfil registrado con ese RUT"}, status=status.HTTP_400_BAD_REQUEST)

    # Si no es válido el serializer
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_empresa(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(password):
        return Response({"error": "Contraseña incorrecta"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        perfil = Perfil.objects.get(user=user)
    except Perfil.DoesNotExist:
        return Response({"error": "No se encontró el perfil asociado a este usuario"}, status=status.HTTP_404_NOT_FOUND)

    if perfil.rol != 'EMPRESA':
        return Response({"error": "Este usuario no tiene rol de empresa"}, status=status.HTTP_403_FORBIDDEN)

    token, created = Token.objects.get_or_create(user=user)

    # Serializar el usuario
    user_serializer = UserSerializer(user)
    user_data = user_serializer.data

    user_data['rol'] = perfil.rol

    return Response({
        "token": token.key,
        "user": user_data,
        "perfil": PerfilSerializer(perfil).data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated,EsEmpresa])
def publicar_practica(request):
    perfil = get_object_or_404(Perfil, user=request.user)
    if perfil.rol != 'EMPRESA':
        return Response({"error": "Solo empresas pueden publicar prácticas."}, status=403)

    data = request.data.copy()
    data['empresa'] = request.user.id
    data['estado'] = EstadoPractica.PENDIENTE
    serializer = PracticaSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_practicas_disponibles(request):
    practicas = Practica.objects.filter(estado=EstadoPractica.PUBLICADA, practicante__isnull=True)
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, EsPracticante])
def postular_practica(request, practica_id):
    user = request.user
    practica = get_object_or_404(Practica, id=practica_id)

    if practica.estado != EstadoPractica.PUBLICADA:
        return Response({"error": "Solo puede postular a prácticas publicadas."}, status=400)

    # Registrar postulación sin asignar directamente
    Postulacion.objects.get_or_create(practicante=user, practica=practica)

    return Response({"mensaje": "Postulación registrada correctamente."})




@api_view(['GET'])
@permission_classes([IsAuthenticated, EsPracticante])
def mis_postulaciones(request):
    postulaciones = Postulacion.objects.filter(practicante=request.user).select_related('practica')
    datos = [
        {
            "id": p.id,
            "practica_id": p.practica.id,
            "titulo": p.practica.titulo,
            "empresa": p.practica.empresa.first_name,
            "estado": p.practica.estado,
            "fecha_postulacion": p.fecha_postulacion
        }
        for p in postulaciones
    ]
    return Response(datos)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EsPracticante])
def mis_practicas(request):
    practicas = Practica.objects.filter(practicante=request.user).exclude(estado=EstadoPractica.PUBLICADA)
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def actualizar_estado_practica(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id)
    perfil = get_object_or_404(Perfil, user=request.user)

    if perfil.rol not in ['COORD', 'EMPRESA']:
        return Response({"error": "No tiene permiso para cambiar el estado."}, status=403)

    nuevo_estado = request.data.get('estado')
    estado_anterior = practica.estado

    practica.estado = nuevo_estado
    try:
        practica.save()
        HistorialEstado.objects.create(
            practica=practica,
            estado_anterior=estado_anterior,
            estado_nuevo=nuevo_estado,
            cambiado_por=request.user
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    
    return Response({"mensaje": f"Estado actualizado a {nuevo_estado}"})


from decimal import Decimal, InvalidOperation
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Practica, EstadoPractica
from .serializers import PracticaSerializer
from .permissions import EsEvaluador
from .utils import enviar_notificacion

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EsEvaluador])
@parser_classes([MultiPartParser, FormParser])
def evaluar_practica(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id)

    # ✅ IMPORTANTE: convertir a dict normal SOLO con textos (sin archivos)
    data = request.data.dict()

    # ✅ Validar nota
    nota_raw = data.get("nota", "")
    if str(nota_raw).strip() == "":
        return Response({"error": "Debes ingresar una nota."}, status=status.HTTP_400_BAD_REQUEST)

    nota_txt = str(nota_raw).strip().replace(",", ".")
    try:
        nota_decimal = Decimal(nota_txt)
    except (InvalidOperation, ValueError):
        return Response({"error": "La nota debe ser numérica (ej: 5 o 5.0)."}, status=status.HTTP_400_BAD_REQUEST)

    if nota_decimal < Decimal("1") or nota_decimal > Decimal("7"):
        return Response({"error": "La nota debe estar entre 1 y 7."}, status=status.HTTP_400_BAD_REQUEST)

    data["nota"] = str(nota_decimal)

    # ✅ Tu campo real es "comentarios"
    # Si React manda "comentario", lo convertimos a "comentarios"
    if "comentario" in data and "comentarios" not in data:
        data["comentarios"] = data.get("comentario")

    # ✅ Archivo: tu campo real es "informe_evaluacion"
    if "informe_evaluacion" in request.FILES:
        data["informe_evaluacion"] = request.FILES["informe_evaluacion"]

    # ✅ Estado evaluada
    data["estado"] = EstadoPractica.EVALUADA

    serializer = PracticaSerializer(practica, data=data, partial=True)
    if serializer.is_valid():
        obj = serializer.save()

        # notificar
        if obj.practicante:
            try:
                enviar_notificacion(
                    destinatario=obj.practicante,
                    mensaje=f"Tu práctica '{obj.titulo}' ha sido evaluada."
                )
            except Exception as e:
                print("Error enviando notificación:", e)

        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resumen_practicas(request):
    estado = request.query_params.get('estado')
    empresa_id = request.query_params.get('empresa_id')
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_termino = request.query_params.get('fecha_termino')
    rut = request.query_params.get('rut')

    practicas = Practica.objects.all()

    if estado:
        practicas = practicas.filter(estado=estado)

    if empresa_id:
        practicas = practicas.filter(empresa__id=empresa_id)

    if fecha_inicio and fecha_termino:
        practicas = practicas.filter(
            fecha_inicio__gte=fecha_inicio,
            fecha_termino__lte=fecha_termino
        )

    if rut:
        practicas = practicas.filter(practicante__perfil__rut=rut)

    total = practicas.count()

    resumen_por_estado = practicas.values('estado').annotate(total=Count('id'))

    resumen_empresa = practicas.values('empresa__username').annotate(total=Count('id'))

    practicas_con_promedio_alto = practicas.filter(nota__gte=5.0).count()

    en_practica = practicas.filter(estado=EstadoPractica.EN_CURSO).count()

    return Response({
        "total_filtradas": total,
        "resumen_por_estado": resumen_por_estado,
        "resumen_por_empresa": resumen_empresa,
        "practicas_con_nota_alta": practicas_con_promedio_alto,
        "alumnos_en_practica": en_practica
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_notificaciones(request):
    notificaciones = request.user.notificaciones.order_by('-creada_en')
    data = [{
        'id': n.id,
        'mensaje': n.mensaje,
        'leida': n.leida,
        'creada_en': n.creada_en
    } for n in notificaciones]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ver_notificacion(request, pk):
    try:
        notificacion = Notificacion.objects.get(pk=pk, destinatario=request.user)
        if not notificacion.leida:
            notificacion.leida = True
            notificacion.save()
        return Response({
            'id': notificacion.id,
            'mensaje': notificacion.mensaje,
            'leida': notificacion.leida,
            'creada_en': notificacion.creada_en
        })
    except Notificacion.DoesNotExist:
        return Response({'error': 'Notificación no encontrada'}, status=status.HTTP_404_NOT_FOUND)

# VER PERFILESSSS ##

@api_view(['GET'])
#@permission_classes([IsAuthenticated])
def ver_perfil_usuario(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        perfil = Perfil.objects.get(user=user)
    except (User.DoesNotExist, Perfil.DoesNotExist):
        return Response({"error": "Usuario o perfil no encontrado"}, status=404)

    perfil_serializer = PerfilSerializer(perfil)
    # Opcional: añadir datos básicos del usuario para el front
    data = {
        "usuario": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
        },
        "perfil": perfil_serializer.data
    }
    return Response(data)



class PracticaFiltradaView(generics.ListAPIView):
    queryset = Practica.objects.all()
    serializer_class = PracticaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = PracticaFilter
    permission_classes = [IsAuthenticated]


### CREAR UN USUARIO 
@api_view(['POST'])
@permission_classes([IsAuthenticated, EsAdministrador])
def crear_usuario_institucional(request):

    email = request.data.get('email')
    password = request.data.get('password')
    rut = request.data.get('rut')
    rol = request.data.get('rol', 'PRACT')

    if not all([email, password, rut, rol]):
        return Response({"error": "Todos los campos son obligatorios"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Correo ya registrado"}, status=400)

    if Perfil.objects.filter(rut=rut).exists():
        return Response({"error": "RUT ya registrado"}, status=400)

    data = request.data.copy()
    data['username'] = email
    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(password)
        user.save()
        return Response({'mensaje': 'Usuario creado correctamente'}, status=201)
    
    return Response(serializer.errors, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def exportar_practicas_excel(request):
    practicas = Practica.objects.select_related('empresa', 'practicante').all()
    data = []

    for p in practicas:
        data.append({
            'Título': p.titulo,
            'Empresa': p.empresa.username,
            'Practicante': p.practicante.username if p.practicante else '',
            'Estado': p.estado,
            'Nota': p.nota,
            'Inicio': p.fecha_inicio,
            'Término': p.fecha_termino,
        })

    df = pd.DataFrame(data)
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Prácticas')
    
    output.seek(0)
    response = HttpResponse(output.read(), content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = 'attachment; filename=practicas.xlsx'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()  # esto elimina ellll tokeen 
    return Response({"mensaje": "Sesión cerrada correctamente"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practicas_a_evaluar(request):
    practicas = Practica.objects.filter(
        evaluador=request.user
    ).exclude(estado=EstadoPractica.EVALUADA)

    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practicas_disponibles(request):
    practicas = Practica.objects.all()  # 👈 quita el filtro .filter(aprobada=True) solo por ahora
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practicas_pendientes(request):
    practicas = Practica.objects.filter(estado='PENDIENTE')
    data = PracticaSerializer(practicas, many=True, context={'request': request}).data
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsEmpresa])
def practicas_por_revisar_empresa(request):
    perfil = get_object_or_404(Perfil, user=request.user)

    practicas = Practica.objects.filter(
        empresa=request.user,
        estado='POR_REVISAR'
    ).order_by('-creado_en')

    serializer = PracticaSerializer(practicas, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    usuarios = User.objects.exclude(perfil__rol='EMPRESA')  
    serializer = UserSerializer(usuarios, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def asignar_rol(request, user_id):
    try:
        usuario = User.objects.get(pk=user_id)
        nuevo_rol = request.data.get('rol')
        if nuevo_rol in ['PRACT', 'COORD', 'ADMIN', 'EVAL']:
            usuario.rol = nuevo_rol
            usuario.save()
            return Response({'mensaje': 'Rol actualizado correctamente.'})
        else:
            return Response({'error': 'Rol no válido'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'Usuario no encontrado'}, status=404)
    

 
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios(request):
    usuarios = User.objects.exclude(perfil__rol='EMPRESA')  # evita mostrar empresas
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def actualizar_rol(request, user_id):

    try:
        perfil = Perfil.objects.get(user__id=user_id)
    except Perfil.DoesNotExist:
        return Response({"error": "Perfil no encontrado"}, status=404)

    nuevo_rol = request.data.get('rol')
    if nuevo_rol:
        perfil.rol = nuevo_rol
        perfil.save()
        return Response({"mensaje": "Rol actualizado correctamente"})
    else:
        return Response({"error": "No se proporcionó el rol"}, status=400)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practicas_evaluadas(request):
    practicas = Practica.objects.filter(estado='EVALUADA')
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def practicas_por_alumno(request, alumno_id):
    practicas = Practica.objects.filter(practicante_id=alumno_id)
    serializer = PracticaSerializer(practicas, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lista_usuarios_practicantes(request):
    usuarios = User.objects.filter(perfil__rol='PRACT')
    serializer = UsuarioSerializer(usuarios, many=True)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated, EsPracticante])
def mis_practicas(request):
    practicas = Practica.objects.filter(practicante=request.user).exclude(estado=EstadoPractica.PUBLICADA)
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EsEmpresa])
def mis_practicas_publicadas(request):
    practicas = Practica.objects.filter(empresa=request.user)
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def crear_postulacion(request, practica_id):
    user = request.user
    practica = get_object_or_404(Practica, id=practica_id)

    if practica.estado != EstadoPractica.PUBLICADA:
        return Response({"error": "Solo puedes postular a prácticas publicadas."}, status=400)

    if Postulacion.objects.filter(practicante=user, practica=practica).exists():
        return Response({"error": "Ya te has postulado a esta práctica."}, status=400)

    postulacion = Postulacion.objects.create(practicante=user, practica=practica)
    serializer = PostulacionSerializer(postulacion)
    return Response(serializer.data, status=201)

# LISTAR mis postulaciones
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def listar_postulaciones_usuario(request):
    postulaciones = Postulacion.objects.filter(practicante=request.user)
    serializer = PostulacionSerializer(postulaciones, many=True)
    return Response(serializer.data)

# ELIMINAR una postulación
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def eliminar_postulacion(request, practica_id):
    try:
        postulacion = Postulacion.objects.get(practicante=request.user, practica_id=practica_id)
        postulacion.delete()
        return Response({"mensaje": "Postulación eliminada correctamente."})
    except Postulacion.DoesNotExist:
        return Response({"error": "No se encontró la postulación."}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])  
def detalle_practica(request, id):
    practica = get_object_or_404(Practica, id=id)
    serializer = PracticaSerializer(practica, context={'request': request})

    return Response(serializer.data)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated, EsEmpresa])
def detalle_practica_Empresa(request, id):
    try:
        practica = Practica.objects.get(id=id, empresa=request.user)
    except Practica.DoesNotExist:
        return Response({"error": "Práctica no encontrada"}, status=404)

    if request.method == 'GET':
        serializer = PracticaSerializer(practica)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PracticaSerializer(practica, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EsEmpresa])
def postulantes_practica(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id, empresa=request.user)
    postulaciones = Postulacion.objects.filter(practica=practica)

    data = []
    for postulacion in postulaciones:
        perfil = postulacion.practicante.perfil
        data.append({
            "id": postulacion.practicante.id,
            "nombre": f"{postulacion.practicante.first_name} {postulacion.practicante.last_name}",
            "rut": perfil.rut if hasattr(perfil, 'rut') else None,
            "email": postulacion.practicante.email,
            "cv_url": perfil.cv.url if perfil.cv else None,
        })

    return Response(data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def asignar_practicante(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id)

    if practica.empresa != request.user:
        return Response({"error": "No tienes permiso para modificar esta práctica."}, status=403)

    postulante_id = request.data.get('usuario_id')
    if not postulante_id:
        return Response({"error": "Debes proporcionar el ID del postulante."}, status=400)

    postulante = get_object_or_404(User, id=postulante_id)

    if not Postulacion.objects.filter(practica=practica, usuario=postulante).exists():
        return Response({"error": "Este usuario no ha postulado a esta práctica."}, status=400)

    practica.practicante = postulante
    practica.estado = EstadoPractica.ASIGNADA
    practica.save()

    enviar_notificacion(
        destinatario=postulante,
        mensaje=f"Has sido asignado a la práctica '{practica.titulo}'"
    )

    return Response({"mensaje": "Practicante asignado exitosamente."})


@api_view(['GET'])
@permission_classes([IsAuthenticated, EsEmpresa])
def postulantes_aprobados(request, practica_id):
    try:
        practica = Practica.objects.get(id=practica_id, empresa=request.user)
    except Practica.DoesNotExist:
        return Response({"error": "Práctica no encontrada"}, status=404)

    postulaciones = Postulacion.objects.filter(
        practica=practica,
        aprobado_por_coordinador=True
    ).select_related('practicante')

    datos = []
    for p in postulaciones:
        practicante = p.practicante
        if practicante:  # Previene error si el usuario fue eliminado
            datos.append({
                "postulacion_id": p.id,
                "practicante_id": practicante.id,
                "nombre": practicante.first_name,
                "apellido": practicante.last_name,
                "email": practicante.email,
                "fecha_postulacion": p.fecha_postulacion,
            })

    return Response(datos)  # Retorna lista vacía si no hay postulantes



@api_view(['POST'])
@permission_classes([IsAuthenticated, EsEmpresa])
def asignar_practicante(request, practica_id, practicante_id):
    practica = get_object_or_404(Practica, id=practica_id, empresa=request.user)
    if practica.practicante:
        return Response({"error": "Ya hay practicante asignado."}, status=400)

    user = get_object_or_404(User, id=practicante_id)
    practica.practicante = user
    practica.estado = EstadoPractica.ASIGNADA
    practica.save()
    return Response({"mensaje": "Practicante asignado correctamente."})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EsCoordinador])
def aprobar_postulacion(request, postulacion_id):
    postulacion = get_object_or_404(Postulacion, id=postulacion_id)

    practica = postulacion.practica

    # Validación básica
    if practica.practicante is not None:
        return Response(
            {"error": "Esta práctica ya tiene un practicante asignado."},
            status=400
        )

    # Aprobar postulación
    postulacion.aprobado_por_coordinador = True
    postulacion.save()

    #  ASIGNAR PRACTICANTE 
    practica.practicante = postulacion.practicante
    practica.estado = EstadoPractica.ASIGNADA
    practica.save()

    return Response({"mensaje": "Postulación aprobada y practicante asignado."})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def todos_postulantes(request, practica_id):
    # Aquí puede aplicar un filtro extra de permisos (solo coordinador)
    postulaciones = Postulacion.objects.filter(practica_id=practica_id).select_related('practicante')
    data = [{
        "id": p.id,
        "practicante_id": p.practicante.id,
        "nombre": f"{p.practicante.first_name} {p.practicante.last_name}",
        "rut": getattr(p.practicante.perfil, 'rut', ''),
        "fecha_postulacion": p.fecha_postulacion
    } for p in postulaciones]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def postulaciones_por_aprobar(request):
    postulaciones = Postulacion.objects.filter(aprobado_por_coordinador=False).select_related('practicante', 'practica')

    data = []
    for p in postulaciones:
        perfil = getattr(p.practicante, 'perfil', None)
        data.append({
            "id": p.id,
            "practicante_id": p.practicante.id,
            "nombre": f"{p.practicante.first_name} {p.practicante.last_name}",
            "rut": getattr(perfil, 'rut', ''),
            "email": p.practicante.email,
            "practica_id": p.practica.id,
            "titulo_practica": p.practica.titulo,
            "descripcion_practica": p.practica.descripcion,
            "empresa": p.practica.empresa.first_name if p.practica.empresa else "",  # o .nombre si usas otro campo
            "fecha_postulacion": p.fecha_postulacion,
        })

    return Response(data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EsCoordinador])
def asignar_evaluador(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id)

    evaluador_id = request.data.get("evaluador_id")
    if not evaluador_id:
        return Response({"error": "Debe seleccionar un evaluador"}, status=400)

    evaluador = get_object_or_404(User, id=evaluador_id)
    perfil = get_object_or_404(Perfil, user=evaluador)

    if perfil.rol != 'EVAL':
        return Response({"error": "El usuario no es evaluador"}, status=400)

    practica.evaluador = evaluador
    practica.save()

    return Response({"mensaje": "Evaluador asignado correctamente"})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated, EsCoordinador])
def asignar_evaluador(request, practica_id):
    practica = get_object_or_404(Practica, id=practica_id)

    evaluador_id = request.data.get("evaluador_id")
    if not evaluador_id:
        return Response({"error": "Debe seleccionar un evaluador"}, status=400)

    evaluador = get_object_or_404(User, id=evaluador_id)
    perfil = get_object_or_404(Perfil, user=evaluador)

    if perfil.rol != 'EVAL':
        return Response({"error": "El usuario seleccionado no es evaluador"}, status=400)

    practica.evaluador = evaluador
    practica.save()

    return Response({"mensaje": "Evaluador asignado correctamente"})

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def practicas_para_asignar_evaluador(request):
    practicas = Practica.objects.filter(
        practicante__isnull=False,
        evaluador__isnull=True
    )
    serializer = PracticaSerializer(practicas, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def listar_evaluadores(request):
    evaluadores = User.objects.filter(perfil__rol='EVAL')
    serializer = UsuarioSerializer(evaluadores, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsEvaluador])
def mis_practicas_evaluadas(request):
    practicas = Practica.objects.filter(
        evaluador=request.user,
        estado=EstadoPractica.EVALUADA
    ).order_by('-creado_en')
    serializer = PracticaSerializer(practicas, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def practicas_evaluadas_por_aprobar(request):
    practicas = Practica.objects.filter(
        estado=EstadoPractica.EVALUADA
    ).order_by('-creado_en')
    serializer = PracticaSerializer(practicas, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def coordinador_listar_todas_practicas(request):
    estado = request.query_params.get("estado")

    practicas = Practica.objects.all().order_by("-id")
    if estado:
        practicas = practicas.filter(estado=estado)

    serializer = PracticaSerializer(practicas, many=True, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated, EsCoordinador])
def practicas_coordinador(request):
    estado = request.query_params.get("estado")

    practicas = Practica.objects.all()

    if estado:
        practicas = practicas.filter(estado=estado)

    serializer = PracticaSerializer(
        practicas,
        many=True,
        context={'request': request}
    )
    return Response(serializer.data)
