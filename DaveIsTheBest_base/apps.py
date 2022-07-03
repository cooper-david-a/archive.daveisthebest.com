from django.apps import AppConfig
from pickle import load

class DaveisthebestBaseConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'DaveIsTheBest_base'
    with open('./DaveIsTheBest_base/spam_filter_vectorizer.sav','rb') as sv:
        spam_vectorizer = load(sv)
    with open('./DaveIsTheBest_base/spam_filter_model.sav','rb') as sf:
        spam_filter_model = load(sf)
