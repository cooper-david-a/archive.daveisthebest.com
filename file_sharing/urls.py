from django.urls import path
from .views import FileSharingView, file_download, file_download_from_link

urlpatterns = [
  path('', FileSharingView.as_view(), name='file_sharing_list'),
  path('<int:file_id>', file_download, name='file_download'),
  path('<uuid:access_email_id>', file_download_from_link, name='file_download_from_link')
]