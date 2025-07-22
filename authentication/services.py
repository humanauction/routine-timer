from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.contrib.auth.models import AbstractBaseUser

User = get_user_model()


def register_user(username: str, email: str, password: str) -> AbstractBaseUser:
    """
    Create and return a new user instance.
    add email confirmation here.
    """
    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return user


def send_welcome_mail(user: AbstractBaseUser):
    """
    Send email confirmation to new user.
    """
    send_mail(
        subject='Welcome to Routine Timer',
        message='Thanks for signing up!',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
