from django.conf import settings
from django.http import HttpResponse, HttpResponseRedirect
from django.views.generic import CreateView, DetailView
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from .models import SharedFile, Profile, AccessEmail
from .forms import SharedFileUploadForm, AccessEmailFormSet

# Create your views here.

class FileSharingView(LoginRequiredMixin, CreateView):
    model = SharedFile
    context_object_name = 'shared_file_list'
    template_name = 'file_sharing/file_sharing.html'
    form_class = SharedFileUploadForm
    success_url = '.'

    def get(self, request, *args, **kwargs):
        self.object = None
        shared_file_upload_form_class = self.get_form_class()
        shared_file_upload_form = self.get_form(form_class=shared_file_upload_form_class)
        access_email_formset = AccessEmailFormSet()

        if request.user.is_staff:
            shared_file_list = SharedFile.objects.all()
        else:
            shared_file_list = SharedFile.objects.filter(Q(profile__user_id = request.user.id) | Q(access_emails__email = request.user.email)).prefetch_related()

        return self.render_to_response(
            self.get_context_data(shared_file_list = shared_file_list,
                shared_file_upload_form=shared_file_upload_form,
                access_email_formset=access_email_formset
                )
            )
    
    def post(self, request, *args, **kwargs):
        self.object = None
        shared_file_upload_form_class = self.get_form_class()
        shared_file_upload_form = self.get_form(form_class=shared_file_upload_form_class)
        access_email_formset = AccessEmailFormSet(request.POST)
        if (shared_file_upload_form.is_valid() and access_email_formset.is_valid()):
            return self.form_valid(shared_file_upload_form, access_email_formset)
        else:
            return self.form_invalid(shared_file_upload_form, access_email_formset)
        
    def form_valid(self, shared_file_upload_form, access_email_formset):
        self.object = shared_file_upload_form.save(commit=False)
        self.object.profile, created = Profile.objects.get_or_create(user_id = self.request.user.id)
        self.object.save()
        access_email_formset.instance = self.object
        access_email_formset.save()
        return HttpResponseRedirect(self.get_success_url())

    def form_invalid(self, shared_file_upload_form, access_email_formset):
        return self.render_to_response(
            self.get_context_data(shared_file_upload_form=shared_file_upload_form,
                                  access_email_formset=access_email_formset))

class FileSharingDetailView(DetailView):
    model = SharedFile
    template_name = 'file_sharing/file_sharing_detail.html'
    context_object_name = 'shared_file'


def file_download(request, file_id):
    file_obj = SharedFile.objects.get(id=file_id)
    socket = open(settings.MEDIA_ROOT / file_obj.file.name,'rb')
    response = HttpResponse(socket)
    response['Content-Disposition'] = "attachment; filename=" + file_obj.filename()
    return response