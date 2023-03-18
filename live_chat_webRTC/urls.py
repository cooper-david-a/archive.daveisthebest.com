from django.urls import path
from .views import LiveChatRoomView, LiveChatLobbyView, post_sdp

urlpatterns = [
  path('',LiveChatLobbyView.as_view(), name='live_chat_lobby'),
  path('<uuid:pk>', LiveChatRoomView.as_view(), name='live_chat_room'),
  path('<uuid:pk>/sdp', post_sdp, name='sdp')
]