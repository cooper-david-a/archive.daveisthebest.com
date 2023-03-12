from django.db import models
from django.conf import settings
import uuid


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='room_creator')
    def __str__(self):
        return self.user.username

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_by = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='rooms')
    date_created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=100)
    number_in_room = models.SmallIntegerField(default=1)
    offer = models.JSONField(null=True, blank=True)
    answer = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name

 