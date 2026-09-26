from rest_framework.permissions import BasePermission

class EsAdministrador(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol == 'ADMIN'

class EsCoordinador(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol == 'COORD'

class EsEvaluador(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol == 'EVAL'

class EsEmpresa(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol == 'EMPRESA'

class EsPracticante(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol == 'PRACT'


class EsCoordinadorOAdministrador(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'perfil') and request.user.perfil.rol in ['COORD', 'ADMIN']