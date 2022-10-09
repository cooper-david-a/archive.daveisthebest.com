from django.views.generic import TemplateView, RedirectView
from django.contrib import messages
from .forms import CommentForm

class Home(TemplateView):
    template_name = 'DaveIsTheBest_base/home.html'

class BJJ(TemplateView):
    template_name = 'DaveIsTheBest_base/BJJ.html'

class SudokuOpenCVView(TemplateView):
    template_name = 'DaveIsTheBest_base/sudoku_opencv.html'

class CommentFormView(RedirectView):
    http_method_names = ['post']
    def post(self, request, *args, **kwargs):
        self.url = request.META['HTTP_REFERER'] + r'#new_comment_form'
        form = CommentForm(request.POST)
        if form.is_valid():
            form.save()
            if form.instance.auto_is_spam:
                messages.add_message(request, messages.INFO,
                'Your comment was auto labeled as spam and will be reviewed manually.')
            return self.get(request, *args, **kwargs)
        else:
            return self.get(request, *args, **kwargs)            