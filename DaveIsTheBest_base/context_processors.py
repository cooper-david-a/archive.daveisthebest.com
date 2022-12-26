from django.conf import settings
from django.core.paginator import Paginator
from .models import Comment
from .forms import CommentForm

def comments_context_processor(request):
    comments = Comment.objects.filter(ok_to_display=True)
    comments_count = len(comments)
    paginator = Paginator(comments, 10)
    page_number = request.GET.get('comment_page')
    comment_page_obj = paginator.get_page(page_number)
    comment_form = CommentForm()    
    return {'comments': comments,
            'comments_count': comments_count, 
            'comment_form': comment_form, 
            'comment_page_obj': comment_page_obj}

def base_context_processor(request):
    return {'base_template':settings.BASE_APP + '/base.html'}