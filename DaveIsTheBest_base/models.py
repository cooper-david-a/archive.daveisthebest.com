from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractUser

from .apps import DaveisthebestBaseConfig

class User(AbstractUser):
    email = models.EmailField(unique=True)