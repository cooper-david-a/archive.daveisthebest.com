from django.urls import path, include
from . import views

urlpatterns = [
  path('', views.Home.as_view(), name='home'),
  path('BJJ', views.BJJ.as_view(), name='BJJ'),
  path('sudoku_solver', views.SudokuSolverView.as_view(), name='sudoku_solver'),
  path('users/', include('django.contrib.auth.urls')),
  path('users/signup/', views.SignUpView.as_view(), name='signup')
]