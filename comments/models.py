from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .apps import CommentsConfig

class Comment(models.Model):
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, related_name='replies', null=True, blank=True)
    date_entered = models.DateTimeField(auto_now_add=True)
    commenter_name = models.CharField(max_length=127, null=True, blank=True)
    comment_text = models.CharField(max_length=255)
    manual_positivity_rating = models.SmallIntegerField(
        validators=[MinValueValidator(1),MaxValueValidator(10)],
        null=True,
        blank=True)
    auto_positivity_rating = models.SmallIntegerField(null=True, blank=True)
    ok_to_display = models.BooleanField(default=True)
    auto_is_spam = models.BooleanField(default=False)
    manual_is_spam = models.BooleanField(default=False)
    class Meta:
        ordering = ['-date_entered']

    def save(self, *args, **kwargs):
        super(Comment, self).save(*args, **kwargs)
