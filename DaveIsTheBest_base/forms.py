from django.forms import CharField, ModelForm, TextInput, Textarea, EmailField
from django.contrib.auth.forms import UserCreationForm
from .models import Comment, User

class CommentForm(ModelForm):
    commenter_name = CharField(required=False, empty_value=None,                         
                           widget=TextInput(attrs={'placeholder': 'Name (optional)'}))

    comment_text = CharField(widget=Textarea(attrs={'title': '', 'rows': 1}))
    class Meta:
        model = Comment
        fields = ['commenter_name', 'comment_text']

class SignupForm(UserCreationForm):
    first_name = CharField()
    last_name = CharField()
    email = EmailField(required=True)
    class Meta:
        model = User
        fields = ('username','password1','password2','first_name','last_name','email')