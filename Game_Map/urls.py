from django.urls import path
from . import views

urlpatterns = [
  path('positions/', views.PositionList.as_view(), name='position_list'),
  path('position_<int:pk>/', views.PositionDetail.as_view(), name='position_detail')
]