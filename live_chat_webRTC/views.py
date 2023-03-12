import json

from django.urls import reverse
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views.generic import CreateView, TemplateView
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.mixins import LoginRequiredMixin


from .models import Room, Profile
from .forms import LobbyForm


class LiveChatRoomView(TemplateView):
    template_name = 'live_chat_webRTC/room.html'

class LiveChatLobbyView(LoginRequiredMixin, CreateView):
    model = Room
    template_name = 'live_chat_webRTC/lobby.html'
    form_class = LobbyForm

    def post(self, request, *args, **kwargs):
        self.object = None
        room_creation_form = self.form_class(request.POST)
        if room_creation_form.is_valid():
            self.object = room_creation_form.save(commit=False)
            self.object.created_by, created = Profile.objects.get_or_create(user_id = self.request.user.id)
            self.object.save()
            return redirect(reverse('live_chat_room', args=[self.object.id]))
        else:
            return render(request, self.template_name, {'form': room_creation_form})


@csrf_exempt
def post_sdp(request, room_id):
    room = Room.objects.get(pk=room_id)

    if request.method == 'PUT':
        body = json.loads(request.body.decode())
        if body['type'] == 'offer':
            room.offer = body
            response = JsonResponse({'data': "offer saved"})
        if body['type'] == 'answer':
            room.answer = body
            response = JsonResponse({'data': "answer saved"})
        room.save()
    
    if request.method == 'GET':
        response = JsonResponse({'offer':room.offer,'answer':room.answer})
        

    return response
