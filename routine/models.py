from django.conf import settings
from django.db import models


# Create your models here.


class Routine(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL,
                                   on_delete=models.CASCADE,
                                   related_name='routines')
    name       = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def total_time(self) -> int:
        from django.db.models import Sum
        result = self.items.aggregate(total=Sum('duration'))['total']
        return result or 0

class RoutineItem(models.Model):
    routine  = models.ForeignKey(Routine,
                                 on_delete=models.CASCADE,
                                 related_name='items')
    task     = models.CharField(max_length=255)
    duration = models.PositiveIntegerField(help_text='Minutes')
    order    = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
