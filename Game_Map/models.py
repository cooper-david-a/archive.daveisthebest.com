from django.db import models
from django.contrib.auth import get_user_model

class Profile(models.Model):
    user = models.OneToOneField(get_user_model(), on_delete=models.CASCADE, unique=True)

    def __str__(self):
        return self.user.get_username()

class Position(models.Model):
    initial = models.BooleanField(default=False)
    name = models.CharField(max_length=127,null=True, blank=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='positions', null=True, blank=True)
    play_1 = models.ForeignKey('self', on_delete=models.CASCADE, related_name='parent_pos_1', null=True, blank=True)
    play_2 = models.ForeignKey('self', on_delete=models.CASCADE, related_name='parent_pos_2', null=True, blank=True)
    play_3 = models.ForeignKey('self', on_delete=models.CASCADE, related_name='parent_pos_3', null=True, blank=True)
    read_12_description = models.CharField(max_length=100, blank=True)
    read_23_description = models.CharField(max_length=100, blank=True)
    read_31_description = models.CharField(max_length=100, blank=True)
    read_121_option = models.CharField(max_length=100, blank=True)
    read_122_option = models.CharField(max_length=100, blank=True)
    read_232_option = models.CharField(max_length=100, blank=True)
    read_233_option = models.CharField(max_length=100, blank=True)
    read_311_option = models.CharField(max_length=100, blank=True)
    read_313_option = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.name