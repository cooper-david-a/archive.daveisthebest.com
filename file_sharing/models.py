import os
from django.db import models
from django.conf import settings

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    def __str__(self):
        return self.user.username

class SharedFile(models.Model):
    date_uploaded = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=100)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    file = models.FileField(upload_to='file_sharing/')

    def filename(self):
        return os.path.basename(self.file.name)
    
    def delete(self):        
        if self.file.storage.exists(self.file.name):
            self.file.storage.delete(self.file.name)
            super().delete()
        else:
            raise FileNotFoundError('FieldFile not found')



            

class AccessEmail(models.Model):
    file = models.ForeignKey(SharedFile, on_delete=models.CASCADE, related_name='access_emails')
    email = models.EmailField(max_length=70)