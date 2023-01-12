from django.db import models
from django.conf import settings

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username

class SharedFile(models.Model):
    file_name = models.CharField(max_length=100)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    file = models.FileField(upload_to='file_sharing/')
    
