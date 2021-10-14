from django.db import models
import datetime 

PRIORITY_CHOICES = [
  (1, 'Low'),
  (2, 'Normal'),
  (3, 'High'),
]

class TodoList(models.Model):
  complete = models.BooleanField(default=False)
  date_created = models.DateTimeField(default=datetime.datetime.now)
  name = models.CharField(max_length=200, unique=True)
  priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)


  def __str__(self) -> str:
      return self.name
  
  class Meta:
    ordering = ['-priority', 'name']

class TodoItem(models.Model):
  complete = models.BooleanField(default=False)
  date_completed = models.DateTimeField(blank=True,null=True)
  date_created = models.DateTimeField(default=datetime.datetime.now) 
  name = models.CharField(max_length=200) 
  notes = models.TextField(blank=True)  
  priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2)
  todo_list = models.ForeignKey(TodoList, on_delete=models.CASCADE)

  def __str__(self):
    return self.name

  class Meta:
    ordering = ['-priority', 'name']