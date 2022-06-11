from django.forms import CharField, ModelForm, TextInput, Textarea
from .models import Comment

class CommentForm(ModelForm):
    commenter_name = CharField(required=False, empty_value=None,                         
                           widget=TextInput(attrs={'placeholder': 'Name (optional)'}))

    comment_text = CharField(widget=Textarea(attrs={'title': '', 'rows': 2}))
    class Meta:
        model = Comment
        fields = ['commenter_name', 'comment_text']
