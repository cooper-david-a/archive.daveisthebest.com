"""
Django settings for DaveIsTheBest project.

Generated by 'django-admin startproject' using Django 3.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from pathlib import Path
from configparser import RawConfigParser

parser = RawConfigParser(allow_no_value=True)

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
LOCAL_SETTINGS_FILE = BASE_DIR.parent / 'DaveIsTheBest_settings.ini'
parser.read(LOCAL_SETTINGS_FILE)



# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = parser.get('secrets','SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = parser.getboolean('debug','DEBUG')

ALLOWED_HOSTS = parser.get('hosts','ALLOWED_HOSTS').split(',')

# Application definition

INSTALLED_APPS = [
    'DaveIsTheBest_base',
    'HIIT_Timer',
    'ThermoPropertyCalculator',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.humanize',
    'debug_toolbar',
]

BASE_APP = 'DaveIsTheBest_base'

MIDDLEWARE = [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

INTERNAL_IPS = [
    '127.0.0.1',
    ]

ROOT_URLCONF = 'DaveIsTheBest.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'DaveIsTheBest_base.context_processors.comments_context_processor',
                'DaveIsTheBest_base.context_processors.base_context_processor',
            ],
        },
    },
]

WSGI_APPLICATION = 'DaveIsTheBest.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': parser.get('database','DATABASE_ENGINE'),
        'NAME': parser.get('database','DATABASE_NAME'),
        'USER': parser.get('database','DATABASE_USER'),
        'PASSWORD': parser.get('database','DATABASE_PASSWORD'),
        'HOST': parser.get('database','DATABASE_HOST'),
        'PORT': parser.getint('database','DATABASE_PORT'),
        'OPTIONS':{'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"}
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
       'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LOGIN_URL = "/users/login"
LOGIN_REDIRECT_URL = "home"
LOGOUT_REDIRECT_URL = "home"

# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

EMAIL_BACKEND = parser.get('email','EMAIL_BACKEND')
DEFAULT_FROM_EMAIL = parser.get('email','DEFAULT_FROM_EMAIL')
EMAIL_HOST = parser.get('email', 'EMAIL_HOST')
EMAIL_PORT = 465
EMAIL_USE_SSL = True
EMAIL_HOST_USER = parser.get('email','EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = parser.get('email', 'EMAIL_HOST_PASSWORD')