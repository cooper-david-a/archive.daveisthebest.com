from django.forms import ModelForm, CharField
from .models import Room

class LobbyForm(ModelForm):
    class Meta:
        model = Room
        fields = ('name', 'invitee_email')