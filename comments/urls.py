from django.urls import path
from . import views

urlpatterns = [
    path('', views.comments, name='comments'),
    #path('post/<int:id>', views.CommentCreateView.as_view(), name='create_comment'),
]  
