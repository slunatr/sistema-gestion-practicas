from django.apps import AppConfig


class PracticConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'practic'

    def ready(self):
        import practic.models  # para que cargue la señal