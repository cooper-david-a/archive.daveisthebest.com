from django.contrib import admin
from .models import TodoList, TodoItem


class TodoItemInline(admin.TabularInline):
  model = TodoItem
  extra = 0
  fieldsets = [(None, {'fields':['name', 'priority','complete']})]

@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
  list_display = ['name','priority','complete','todo_list_name']
  list_filter = ['todo_list']
  list_select_related = ['todo_list']
  search_fields = ['name']  
  fieldsets = [
    (None, {'fields': ['name', 'priority', 'complete', 'date_completed']}),
    ('Notes', {'fields': ['notes'], 'classes': ['collapse']})
  ]

  def todo_list_name(self,todo_item):
    return todo_item.todo_list.name
  

@admin.register(TodoList)
class TodoListAdmin(admin.ModelAdmin):
  fieldsets = [
    (None, {'fields': ['name', 'priority']}),
    ('Date information', {'fields': ['date_created'], 'classes': ['collapse']}),
  ]
  inlines = [TodoItemInline]
  list_display = ['name', 'date_created', 'priority', 'complete']
  list_editable = ['priority', 'complete']
  search_fields = ['priority']
