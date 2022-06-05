from django.views.generic import TemplateView, RedirectView
from .forms import CommentForm

class Home(TemplateView):
    template_name = 'DaveIsTheBest_base/Home.html'

class BJJ(TemplateView):
    template_name = 'DaveIsTheBest_base/BJJ.html'

class CommentFormView(RedirectView):
    http_method_names = ['post']
    def post(self, request, *args, **kwargs):
        self.url = request.META['HTTP_REFERER']
        form = CommentForm(request.POST)
        if form.is_valid():
            form.save()
            return self.get(request, *args, **kwargs)
        else:
            return self.get(request, *args, **kwargs)            