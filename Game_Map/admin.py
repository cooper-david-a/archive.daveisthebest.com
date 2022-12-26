from django.contrib import admin
from .models import Profile, Position

# Register your models here.
@admin.register(Profile)
class GameMapProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'profile', 'initial', 'play_1', 'play_2', 'play_3')
    list_display_links = ('name', 'profile', 'play_1', 'play_2', 'play_3')
    list_filter = ('profile', 'initial')
    search_fields = ('name', 'profile__user__username',)