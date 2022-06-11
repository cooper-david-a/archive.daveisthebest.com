from django.views import generic
from .models import TodoItem, TodoList


class TodoDetailView(generic.DetailView):
  model = TodoItem
  template_name = 'todo/detail.html'

class TodoListView(generic.ListView):
  model = TodoList
  template_name = 'todo/list.html'