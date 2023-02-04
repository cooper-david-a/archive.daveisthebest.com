import os, uuid
from django.db import models
from django.conf import settings
from django.core.mail import send_mail

from .validators import validate_file_size

# Create your models here.

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    def __str__(self):
        return self.user.username

class SharedFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_uploaded = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=100)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    file = models.FileField(upload_to='file_sharing/', validators=[validate_file_size]) 

    def filename(self):
        return os.path.basename(self.file.name)
    
    def delete(self):        
        if self.file.storage.exists(self.file.name):
            self.file.storage.delete(self.file.name)
            super().delete()
        else:
            raise FileNotFoundError('FieldFile not found')
    
    def save(self):
        super().save()        

class AccessEmail(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(SharedFile, on_delete=models.CASCADE, related_name='access_emails')
    email = models.EmailField(max_length=70)

    def save(self):
        super().save()
        email_from = None
        email_to = [self.email]
        subject = f'{self.file.profile.user.email} sent you a file'
        message = r'link: https://daveisthebest.com/file_sharing/' + f'{self.file.id}'
        send_mail(subject, message, email_from, email_to, fail_silently=False)