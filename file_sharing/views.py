from django.views.generic import ListView
from .models import SharedFile, Profile

# Create your views here.

class FileSharingListView(ListView):
    model = SharedFile
    template_name = 'file_sharing/file_sharing_list.html'