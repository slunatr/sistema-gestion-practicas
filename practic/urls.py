from django.contrib import admin
from django.urls import path,re_path
from practic import views
from django.conf.urls.static import static
from django.conf import settings
from .views import practicas_pendientes,practicas_por_alumno,lista_usuarios_practicantes

urlpatterns = [
    path('admin/', admin.site.urls),  

    # Institucional 
    path('login/', views.login),
    path('register/', views.register),


    path('profile/', views.profile),
    path('mi-perfil/', views.mi_perfil),
    

    #Empresas
    path('register-empresa/', views.register_empresa),
    path('login-empresa/', views.login_empresa),

    path('publicar-practica/', views.publicar_practica),
    path('practicas-disponibles/', views.listar_practicas_disponibles),
    path('postular-practica/<int:practica_id>/', views.postular_practica),
    path('mis-postulaciones/', views.mis_postulaciones),
    path('mis-practicas/', views.mis_practicas),
    path('actualizar-estado/<int:practica_id>/', views.actualizar_estado_practica),
    path('evaluar-practica/<int:practica_id>/', views.evaluar_practica),
    path('resumen-practicas/', views.resumen_practicas),
    path('notificaciones/', views.listar_notificaciones),
    path('perfil-usuario/<int:user_id>/', views.ver_perfil_usuario),
    path('practicas-filtradas/', views.PracticaFiltradaView.as_view(), name='practicas-filtradas'),
    path('exportar-practicas/', views.exportar_practicas_excel),
    path('logout/', views.logout),
    path('practicas-a-evaluar/', views.practicas_a_evaluar, name='practicas_a_evaluar'),
    path('mis-practicas-por-revisar/', views.practicas_por_revisar_empresa, name='mis-practicas-por-revisar'),
    path('practicas-pendientes/', practicas_pendientes, name='practicas_pendientes'),
    path('usuarios/', views.lista_usuarios, name='lista_usuarios'),
    path('asignar-rol/<int:user_id>/', views.asignar_rol, name='asignar_rol'),
    path('usuarios-institucionales/', views.lista_usuarios),
    path('actualizar-rol/<int:user_id>/', views.actualizar_rol),
    path('practicas-evaluadas/', views.practicas_evaluadas),
    path('practicas-por-alumno/<int:alumno_id>/', practicas_por_alumno, name='practicas-por-alumno'),
     path('lista-usuarios/', lista_usuarios_practicantes, name='lista_usuarios'),
    path('mis-practicas-publicadas/', views.mis_practicas_publicadas),
    path('detalle-practica/<int:id>/', views.detalle_practica, name='detalle_practica'),
    path('postulantes-practica/<int:practica_id>/', views.postulantes_practica),
    path('asignar-practicante/<int:practica_id>/', views.asignar_practicante),
    path('postulantes-aprobados/<int:practica_id>/', views.postulantes_aprobados),
    path('asignar-practicante/<int:practica_id>/<int:practicante_id>/', views.asignar_practicante),
    path('aprobar-postulacion/<int:postulacion_id>/', views.aprobar_postulacion),
    path('todos-postulantes/<int:practica_id>/', views.todos_postulantes),
    path('postulaciones-por-aprobar/', views.postulaciones_por_aprobar),
    path('practicas-asignar-evaluador/',views.practicas_para_asignar_evaluador),
    path('listar-evaluadores/', views.listar_evaluadores),
    path('asignar-evaluador/<int:practica_id>/', views.asignar_evaluador),
    path('mis-practicas-evaluadas/', views.mis_practicas_evaluadas),
    path('practicas-evaluadas-por-aprobar/', views.practicas_evaluadas_por_aprobar),
    path('detalle-practica/<int:id>/', views.detalle_practica),
    path("coordinador/practicas/", views.coordinador_listar_todas_practicas),
    
 


    

    
    
    
    
] 
