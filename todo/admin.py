from typing import List
from django.contrib import admin
from .models import TodoList, TodoItem


class TodoItemInline(admin.TabularInline):
  model = TodoItem
  extra = 0
  fieldsets = [(None, {'fields':['name', 'priority','completed']})]

class TodoItemAdmin(admin.ModelAdmin):
  list_display = ('name','priority','completed')

class TodoListAdmin(admin.ModelAdmin):
  fieldsets = [
    (None, {'fields': ['name']}),
    ('Date information', {'fields': ['date_created'], 'classes': ['collapse']}),
  ]
  inlines = [TodoItemInline]

admin.site.register(TodoList, TodoListAdmin)
admin.site.register(TodoItem, TodoItemAdmin)