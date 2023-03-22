from django.apps import AppConfig
from django.conf import settings

from pickle import load


BASE_DIR = settings.BASE_DIR

class CommentsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "comments"
    with open(BASE_DIR / 'comments/spam_filter_vectorizer.sav','rb') as sv:
        spam_vectorizer = load(sv)
    with open(BASE_DIR / 'comments/spam_filter_model.sav','rb') as sf:
        spam_filter_model = load(sf)