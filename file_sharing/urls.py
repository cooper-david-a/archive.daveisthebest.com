from django.urls import path
from . import views

urlpatterns = [
  path('', views.FileSharingListView.as_view(), name='file_sharing'),
]