import sys, os
INTERP = "/home/dh_989cte/.local/share/virtualenvs/daveisthebest.com-58Ok65Hk/bin/python3"
#INTERP is present twice so that the new python interpreter 
#knows the actual executable path 
if sys.executable != INTERP: os.execl(INTERP, INTERP, *sys.argv)

cwd = os.getcwd()
sys.path.append(cwd)
sys.path.append(cwd + '/daveisthebest')  #You must add your project here

sys.path.insert(0,'/home/dh_989cte/.local/share/virtualenvs/daveisthebest.com-58Ok65Hk/bin')
sys.path.insert(0,cwd+'/home/dh_989cte/.local/share/virtualenvs/daveisthebest.com-58Ok65Hk/lib/python3.9/site-packages')

os.environ['DJANGO_SETTINGS_MODULE'] = "daveisthebest.settings"
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()