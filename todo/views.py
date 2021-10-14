from django.shortcuts import render
from django.views import generic
from .models import TodoItem


class TodoDetailView(generic.DetailView):
  model = TodoItem
  template_name = 'todo/detail.html'