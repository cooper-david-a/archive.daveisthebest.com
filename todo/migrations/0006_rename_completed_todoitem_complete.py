# Generated by Django 3.2.8 on 2021-10-10 23:22

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('todo', '0005_alter_todoitem_date_completed'),
    ]

    operations = [
        migrations.RenameField(
            model_name='todoitem',
            old_name='completed',
            new_name='complete',
        ),
    ]
