from django.conf import settings

def base_context_processor(request):
    return {'base_template':settings.BASE_APP + '/base.html'}