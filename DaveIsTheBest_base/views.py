from django.views.generic import TemplateView, RedirectView, CreateView
from django.contrib import messages
from django.urls import reverse_lazy

from .forms import CommentForm, SignupForm

class Home(TemplateView):
    template_name = 'DaveIsTheBest_base/home.html'

class BJJ(TemplateView):
    template_name = 'DaveIsTheBest_base/BJJ.html'

class SudokuSolverView(TemplateView):
    template_name = 'DaveIsTheBest_base/sudoku_solver.html'

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

class SignUpView(CreateView):
    form_class = SignupForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"