from django.contrib import admin
from .models import Comment

# Register your models here.
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ok_to_display', 'date_entered', 'commenter_name', 'comment_text']
    list_editable = ['ok_to_display']
    list_per_page = 10