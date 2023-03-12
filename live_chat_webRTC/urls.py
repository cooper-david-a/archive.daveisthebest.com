from django.urls import path
from .views import LiveChatRoomView, LiveChatLobbyView, post_sdp

urlpatterns = [
  path('',LiveChatLobbyView.as_view(), name='live_chat_lobby'),
  path('<uuid:room_id>', LiveChatRoomView.as_view(), name='live_chat_room'),
  path('<uuid:room_id>/sdp', post_sdp, name='sdp')
]