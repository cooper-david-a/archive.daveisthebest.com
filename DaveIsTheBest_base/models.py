from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

from .apps import DaveisthebestBaseConfig

class Comment(models.Model):
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
        #Spam Check
        spam_filter = DaveisthebestBaseConfig.spam_filter_model
        spam_vectorizer = DaveisthebestBaseConfig.spam_vectorizer
        vectorized_comment = spam_vectorizer.transform([self.comment_text])
        is_spam = spam_filter.predict(vectorized_comment)
        self.auto_is_spam = bool(is_spam)
        
        self.ok_to_display = not (self.auto_is_spam or self.manual_is_spam)

        super(Comment, self).save(*args, **kwargs)