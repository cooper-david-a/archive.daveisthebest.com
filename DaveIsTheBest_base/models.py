from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Comment(models.Model):
    date_entered = models.DateTimeField(auto_now_add=True)
    commenter_name = models.CharField(max_length=127, null=True, blank=True)
    comment_text = models.CharField(max_length=255)
    manual_positivity_rating = models.SmallIntegerField(
        validators=[MinValueValidator(1),MaxValueValidator(10)],
        null=True,
        blank=True)
    auto_positivity_rating = models.SmallIntegerField(null=True, blank=True)
    ok_to_display = models.BooleanField(default=False)

    class Meta:
        ordering = ['date_entered']