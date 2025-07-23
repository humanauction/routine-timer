from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class CustomUser(AbstractUser):
    """
    Extend model (e.g. add profile picture,
    phone number, preferences).
    """
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128, unique=True)
    created_on = models.DateTimeField(auto_now_add=True)
    pass
    class Meta:
        ordering = ["-date_joined"]
