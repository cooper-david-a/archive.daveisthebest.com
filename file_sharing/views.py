from django.conf import settings
from django.http import HttpResponse
from django.views.generic import ListView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from .models import SharedFile, Profile

# Create your views here.

class FileSharingListView(LoginRequiredMixin, ListView):
    model = SharedFile
    template_name = 'file_sharing/file_sharing_list.html'    

def file_download(request, file_id):
    file_obj = SharedFile.objects.get(id=file_id)
    socket = open(settings.MEDIA_ROOT / file_obj.file.name,'rb')
    response = HttpResponse(socket)
    response['Content-Disposition'] = "attachment; filename=" + file_obj.filename()
    return response
