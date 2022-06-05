from django.db.models import Count
from .models import Comment
from .forms import CommentForm

def comments_context_processor(request):
    comments = Comment.objects.all()
    comment_form = CommentForm(data=request.POST)
    return {'comments': comments, 'comment_form': comment_form}