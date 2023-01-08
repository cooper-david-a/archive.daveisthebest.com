from django.contrib import admin
from .models import SharedFile, Profile

# Register your models here.

@admin.register(Profile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ['user']
    list_per_page = 10

@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile', 'file_name', 'file']
    list_per_page = 10