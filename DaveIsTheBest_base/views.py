from django.views.generic import TemplateView, RedirectView, CreateView
from django.contrib import messages
from django.urls import reverse_lazy

from .models import Comment
from .forms import CommentForm, SignupForm

class Home(TemplateView):
    template_name = 'DaveIsTheBest_base/home.html'

class BJJ(TemplateView):
    template_name = 'DaveIsTheBest_base/BJJ.html'

class SudokuSolverView(TemplateView):
    template_name = 'DaveIsTheBest_base/sudoku_solver.html'

class SignUpView(CreateView):
    form_class = SignupForm
    success_url = reverse_lazy("login")
    template_name = "registration/signup.html"