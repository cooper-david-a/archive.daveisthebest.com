from ast import Mod
from django.forms import ModelForm
from .models import Comment

class CommentForm(ModelForm):
    class Meta:
        model = Comment
        fields = ['commenter_name', 'comment_text']