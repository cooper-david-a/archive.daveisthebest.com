from django.core.exceptions import ValidationError

def validate_file_size(value):
    filesize= value.size
    
    if filesize > 1073741824:
        raise ValidationError("Files are currently limited to 1GB, leave a comment or email me if you need more.")
    else:
        return value