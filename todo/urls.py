from django.urls import path
from . import views

urlpatterns = [
  path('', views.TodoView.as_view(), name='todo')
]