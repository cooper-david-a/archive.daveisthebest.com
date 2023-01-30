from django.forms import ModelForm, CharField, FileInput, Textarea, inlineformset_factory
from .models import SharedFile, AccessEmail

class SharedFileUploadForm(ModelForm):
    description = CharField(required=False, empty_value=None, widget=Textarea(attrs={'title': '', 'rows': 2}))
    file = FileInput()
    
    class Meta:
        model = SharedFile
        exclude = ('profile',)

AccessEmailFormSet = inlineformset_factory(SharedFile, AccessEmail, fields=('email',), extra=1)