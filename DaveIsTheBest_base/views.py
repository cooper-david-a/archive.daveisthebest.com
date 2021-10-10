from django.shortcuts import render
from todo.models import TodoItem, TodoList

def home(request):
  queryset = TodoList.objects.prefetch_related('todoitem_set').all()
  
  todo = [{'name': todo_list.name,
            'complete': todo_list.complete,
            'todo_items':[{'name':item.name, 'priority': item.priority, 'completed': item.complete} for item in todo_list.todoitem_set.all()]
           } for todo_list in queryset] 

  return render(request,'home.html',{'todo': todo})
