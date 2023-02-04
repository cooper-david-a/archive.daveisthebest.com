from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Comment, User

# Register your models here.

@admin.register(User)
class UserAdmin(BaseUserAdmin):
     add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "password1", "password2", "email", "first_name", "last_name",),
            },
        ),
    )

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ok_to_display', 'date_entered', 'commenter_name', 'comment_text', 'parent_comment',
    'auto_is_spam','manual_is_spam','auto_positivity_rating', 'manual_positivity_rating']
    list_editable = ['ok_to_display', 'manual_is_spam', 'manual_positivity_rating']
    list_per_page = 50