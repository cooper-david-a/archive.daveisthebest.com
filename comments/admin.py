from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ok_to_display', 'date_entered', 'commenter_name', 'comment_text', 'parent_comment',
    'auto_is_spam','manual_is_spam','auto_positivity_rating', 'manual_positivity_rating']
    list_editable = ['ok_to_display', 'manual_is_spam', 'manual_positivity_rating']
    list_per_page = 50
