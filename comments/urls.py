from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_valid_comments, name='get_valid_comments'),
    #path('post/<int:id>', views.CommentCreateView.as_view(), name='create_comment'),
]  
