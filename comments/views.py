import json
from django.shortcuts import render
from django.core.serializers import serialize
from django.db.models import prefetch_related_objects
from django.http import JsonResponse, HttpResponse
from django.views.generic import CreateView
from django.contrib import messages
from django.core.paginator import Paginator
from .models import Comment
from .forms import CommentForm

def get_valid_comments(request):
    if request.method == 'GET':
        queryset = Comment.objects.filter(ok_to_display=True, parent_comment=None).prefetch_related('replies')
        page_limit = request.GET.get('page_limit')
        paginator = Paginator(queryset, page_limit)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        page_json = serialize('json', page_obj)

    #return HttpResponse(comments_json, content_type='application/json')
    return render(request, 'comments/test.html', {'page_json': page_json})








# class CommentCreateView(CreateView):
#     http_method_names = ['post']

#     def post(self, request, *args, **kwargs):

#         if kwargs['id'] == 0:
#             self.url = request.META['HTTP_REFERER'] + r'#new_comment_form'
#         else:
#             self.url = request.META['HTTP_REFERER'] + f"#comment_card_{kwargs['id']}"

#         form = CommentForm(request.POST)

#         if form.is_valid():
#             comment = form.save(commit=False)

#             if kwargs['id'] > 0:
#                 comment.parent_comment = Comment.objects.get(id=kwargs['id'])

#             comment.save()

#             if form.instance.auto_is_spam:
#                 messages.add_message(request, messages.INFO,
#                 'Your comment was auto labeled as spam and will be reviewed manually.')
#             return self.get(request, *args, **kwargs)
#         else:
#             return self.get(request, *args, **kwargs)


# def comments_context_processor(request):
#     quearyset = Comment.objects.filter(ok_to_display=True).values(
#         'id',
#         'parent_comment_id',
#         'date_entered',
#         'commenter_name',
#         'comment_text',
#         'replies__id',
#     )

#     comments = {}
#     for comment in quearyset:
#         if comment['id'] not in comments:
#             comments[comment['id']] = {
#                 'id' : comment['id'],
#                 'parent_comment_id' : comment['parent_comment_id'],
#                 'date_entered' : comment['date_entered'],
#                 'commenter_name' : comment['commenter_name'],
#                 'comment_text' : comment['comment_text'],
#                 'replies__id' : [comment['replies__id']] if comment['replies__id'] in comments else []
#             }
#         else:
#             if comment['replies__id'] in comments:
#                 comments[comment['id']]['replies__id'].append(comment['replies__id'])
    
#     level_1_comments = [comment for comment in comments.values() if comment['parent_comment_id'] is None]

#     comments_count = len(comments)
#     paginator = Paginator(level_1_comments, 10)
#     page_number = request.GET.get('comment_page')
#     comment_page_obj = paginator.get_page(page_number)
#     comment_form = CommentForm()    
#     return {'comments': comments,
#             'comments_count': comments_count, 
#             'comment_form': comment_form, 
#             'comment_page_obj': comment_page_obj
#             }
