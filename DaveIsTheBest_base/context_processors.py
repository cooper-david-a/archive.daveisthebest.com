from django.conf import settings
from django.core.paginator import Paginator
from .models import Comment
from .forms import CommentForm

def comments_context_processor(request):
    quearyset = Comment.objects.filter(ok_to_display=True).values(
        'id',
        'parent_comment_id',
        'date_entered',
        'commenter_name',
        'comment_text',
        'replies__id',
    )

    comments = {}
    for comment in quearyset:
        if comment['id'] not in comments:
            comments[comment['id']] = {
                'id' : comment['id'],
                'parent_comment_id' : comment['parent_comment_id'],
                'date_entered' : comment['date_entered'],
                'commenter_name' : comment['commenter_name'],
                'comment_text' : comment['comment_text'],
                'replies__id' : [comment['replies__id']] if comment['replies__id'] in comments else []
            }
        else:
            if comment['replies__id'] in comments:
                comments[comment['id']]['replies__id'].append(comment['replies__id'])
    
    level_1_comments = [comment for comment in comments.values() if comment['parent_comment_id'] is None]

    comments_count = len(comments)
    paginator = Paginator(level_1_comments, 10)
    page_number = request.GET.get('comment_page')
    comment_page_obj = paginator.get_page(page_number)
    comment_form = CommentForm()    
    return {'comments': comments,
            'comments_count': comments_count, 
            'comment_form': comment_form, 
            'comment_page_obj': comment_page_obj
            }

def base_context_processor(request):
    return {'base_template':settings.BASE_APP + '/base.html'}