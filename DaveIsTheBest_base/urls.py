from django.urls import path
from . import views

urlpatterns = [
  path('', views.Home.as_view(), name='home'),
  path('BJJ', views.BJJ.as_view(), name='BJJ'),
  path('sudoku_opencv', views.SudokuOpenCVView.as_view(), name='sudoku_opencv'),
  path('comments', views.CommentFormView.as_view(), name='comments')
]