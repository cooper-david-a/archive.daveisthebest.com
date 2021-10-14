from django.urls import path
from . import views

urlpatterns = [
  path('<int:pk>', views.TodoDetailView.as_view(), name='todo_detail')
]