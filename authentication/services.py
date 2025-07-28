from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.contrib.auth.models import AbstractBaseUser

User = get_user_model()


def register_user(
        username: str, email: str, password: str) -> AbstractBaseUser:
    """
    Create and return a new user instance.
    This function sets the password and saves the user to the database.
    :param username: The username for the new user.
    :param email: The email address for the new user.
    :param password: The password for the new user.
    :return: The created user instance.
    """


    print(f"Creating user: {username}, {email}")

    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    print(f"User created: {user.id}")
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
