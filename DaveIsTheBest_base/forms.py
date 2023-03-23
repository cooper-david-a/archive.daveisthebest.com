from django.forms import CharField, EmailField
from django.contrib.auth.forms import UserCreationForm
from .models import User

class SignupForm(UserCreationForm):
    first_name = CharField()
    last_name = CharField()
    email = EmailField(required=True)
    class Meta:
        model = User
        fields = ('username','password1','password2','first_name','last_name','email')