from django.contrib import admin
from .models import SharedFile, Profile, AccessEmail

# Register your models here.

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user']
    list_per_page = 10

class AccessEmailInline(admin.TabularInline):
    model = AccessEmail

@admin.register(SharedFile)
class SharedFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'profile', 'description', 'file']
    list_per_page = 10
    inlines = [AccessEmailInline]

@admin.register(AccessEmail)
class AccessEmailAdmin(admin.ModelAdmin):
    list_display = ['email','file']
    list_per_page = 25
