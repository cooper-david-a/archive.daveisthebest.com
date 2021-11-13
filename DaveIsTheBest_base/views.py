from django.shortcuts import render

def home(request):
  return render(request,'DaveIsTheBest_base/home.html')

def BJJ(request):
  return render(request,'DaveIsTheBest_base/BJJ.html')
