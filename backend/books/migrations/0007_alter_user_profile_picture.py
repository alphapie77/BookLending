# Generated migration for profile picture field change

from django.db import migrations, models

def user_profile_picture_path(instance, filename):
    return f'profile_pictures/{instance.id}_{filename}'

class Migration(migrations.Migration):

    dependencies = [
        ('books', '0006_remove_userprofile_profile_picture_and_more'),
    ]

    operations = [
        migrations.RunSQL(
            "ALTER TABLE auth_user ADD COLUMN profile_picture VARCHAR(100) NULL;",
            reverse_sql="ALTER TABLE auth_user DROP COLUMN profile_picture;"
        ),
    ]