import json
from django.http import JsonResponse
from .models import Comment
from .apps import CommentsConfig

def comments(request):
    if request.method == 'GET':
        latest = request.GET.get('latest') #latest comment known to client
        latest = latest if latest is not None else 0
        queryset = Comment.objects.filter(ok_to_display=True, id__gt = latest).select_related('parent_comment').all()

        comments = {comment.id: {'id': comment.id,
                    'date_entered': comment.date_entered,
                    'commenter_name': comment.commenter_name,
                    'comment_text': comment.comment_text,
                    'parent_comment_id': (None if comment.parent_comment is None else comment.parent_comment.id)
                    } for comment in queryset}
        
        return JsonResponse({'comments': comments})
    
    if request.method == 'POST':
        body = json.loads(request.body.decode())
        parent_comment_id = body['parent_comment_id']
        if (parent_comment_id == '0'):
            parent_comment = None
        else:
            parent_comment = Comment.objects.get(id=parent_comment_id)
        
        comment = Comment.objects.create(
            commenter_name = body['commenter_name'],
            comment_text = body['comment_text'],
            parent_comment = parent_comment
        )

        spam_filter = CommentsConfig.spam_filter_model
        spam_vectorizer = CommentsConfig.spam_vectorizer
        vectorized_comment = spam_vectorizer.transform([comment.comment_text])
        comment.auto_is_spam = (spam_filter.predict_proba(vectorized_comment)[:,1]>.3).astype(bool)
        
        comment.ok_to_display = not comment.auto_is_spam

        comment.save()
        return JsonResponse({'auto_is_spam': int(comment.auto_is_spam[0])})