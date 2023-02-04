from django.urls import path
from .views import FileSharingView, FileSharingFromLinkView, file_download

urlpatterns = [
  path('', FileSharingView.as_view(), name='file_sharing_list'),
  path('<uuid:access_email_id>', FileSharingFromLinkView.as_view(), name='file_download_from_link'),
  path('download/<uuid:file_id>', file_download, name='file_download'),
]