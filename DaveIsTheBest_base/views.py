from django.views.generic import TemplateView, CreateView
from django.urls import reverse_lazy

from .forms import SignupForm

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