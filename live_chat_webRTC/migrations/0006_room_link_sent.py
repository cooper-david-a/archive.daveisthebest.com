# Generated by Django 4.1.7 on 2023-03-19 21:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("live_chat_webRTC", "0005_room_invitee_email"),
    ]

    operations = [
        migrations.AddField(
            model_name="room",
            name="link_sent",
            field=models.BooleanField(default=False),
        ),
    ]
