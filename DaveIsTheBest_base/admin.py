from django.contrib import admin
from .models import Comment

# Register your models here.
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'date_entered', 'commenter_name', 'comment_text']
    list_per_page = 10