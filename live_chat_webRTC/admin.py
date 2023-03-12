from django.contrib import admin
from .models import Room, Profile

# Register your models here.

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_per_page = 10

@admin.register(Room)
class SharedFileAdmin(admin.ModelAdmin):
    list_per_page = 10