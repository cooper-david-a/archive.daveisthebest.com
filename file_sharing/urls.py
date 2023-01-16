from django.urls import path
from .views import FileSharingListView, file_download

urlpatterns = [
  path('', FileSharingListView.as_view(), name='file_sharing_list'),
  path('<file_id>', file_download, name='file_download')
]