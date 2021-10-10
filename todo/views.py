from django.shortcuts import render
from django.views import generic
from .models import TodoList, TodoItem
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.utils.decorators import method_decorator

class TodoView(generic.ListView):
  model = TodoList
  template_name = 'todo/todo.html'
  context_object_name = 'todo_lists'

  @method_decorator(xframe_options_sameorigin)
  def dispatch(self, *args, **kwargs):
      return super().dispatch(*args, **kwargs)

  def get_queryset(self):
    return TodoList.objects.order_by('date_created')