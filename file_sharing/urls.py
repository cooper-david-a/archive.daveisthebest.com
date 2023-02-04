from django.urls import path
from .views import FileSharingView, FileSharingDetailView, file_download

urlpatterns = [
  path('', FileSharingView.as_view(), name='file_sharing'),
  path('<uuid:pk>', FileSharingDetailView.as_view(), name='file_sharing_detail'),
  path('download/<uuid:file_id>', file_download, name='file_download'),
]