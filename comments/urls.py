from django.urls import path, include
from . import views

urlpatterns = [
    path('<int:id>', views.CommentFormView.as_view(), name='comments'),
]  
