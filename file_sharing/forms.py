from django.forms import ModelForm, CharField, FileInput, inlineformset_factory
from .models import SharedFile, AccessEmail

class SharedFileUploadForm(ModelForm):
    description = CharField(required=False, empty_value=None)
    file = FileInput()
    class Meta:
        model = SharedFile
        exclude = ('profile',)

AccessEmailFormSet = inlineformset_factory(SharedFile, AccessEmail, fields=('email',), extra=2)