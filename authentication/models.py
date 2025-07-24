from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
# Create your models here.
class CustomUser(AbstractUser):
    """
    Extend model (e.g. add profile picture,
    phone number, preferences).
    """
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    created_on = models.DateTimeField(auto_now_add=True)
    pass
    class Meta:
        ordering = ["-date_joined"]


def create_normal_user(username, email, password):
    User = get_user_model()
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=False,
        is_superuser=False
    )
    return user