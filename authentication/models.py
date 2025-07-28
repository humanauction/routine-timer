from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.


class CustomUser(AbstractUser):
    """
    Extend model (e.g. add profile picture,
    phone number, preferences) here.
    """
    # These fields already exist in AbstractUser, no need to redefine:
    # username = models.CharField(max_length=150, unique=True)
    # email = models.EmailField(unique=True)
    # password = models.CharField(max_length=128)
    
    created_on = models.DateTimeField(auto_now_add=True)
    # Remove the unnecessary 'pass' statement

    class Meta:
        ordering = ["-date_joined"]


class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    is_guest = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} Profile"


@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


def create_normal_user(username, email, password):
    user = CustomUser.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=False,
        is_superuser=False
    )
    return user
