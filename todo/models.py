from django.db import models
import datetime 


class TodoList(models.Model):
  name = models.CharField(max_length=200, unique=True)
  complete = models.BooleanField(default=False)
  date_created = models.DateTimeField(default=datetime.datetime.now)

  def __str__(self) -> str:
      return self.name
  
  class Meta:
    ordering = ['name']

class TodoItem(models.Model):
  PRIORITY_CHOICES = [
    (1, 'Low'),
    (2, 'Normal'),
    (3, 'High'),
  ]

  name = models.CharField(max_length=200) 
  date_created = models.DateTimeField(default=datetime.datetime.now) 
  priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
  completed = models.BooleanField(default=False)
  date_completed = models.DateTimeField(blank=True,null=True)
  todo_list = models.ForeignKey(TodoList, on_delete=models.CASCADE)
  notes = models.TextField(blank=True)  

  def __str__(self):
    return self.name

  class Meta:
    ordering = ['-priority', 'name'] 

  class Admin: 
    pass
