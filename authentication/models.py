from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class CustomUser(AbstractUser):
    """
    Extend model (e.g. add profile picture,
    phone number, preferences).
    """
    pass


