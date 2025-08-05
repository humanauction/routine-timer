from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Routine(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='routines'
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def total_time(self) -> int:
        from django.db.models import Sum
        result = self.items.aggregate(total=Sum('duration'))['total']
        return result if result is not None else 0


class RoutineItem(models.Model):
    routine = models.ForeignKey(Routine,
                                on_delete=models.CASCADE,
                                related_name='items')
    task = models.CharField(max_length=255)
    duration = models.PositiveIntegerField(help_text='Minutes')
    order = models.PositiveIntegerField()

    def delete_and_reorder(self):
        """Delete this item and reorder remaining items"""
        routine = self.routine
        order = self.order

        # Delete this item
        self.delete()

        # Reorder remaining items to avoid gaps
        for item in routine.items.filter(order__gt=order).order_by('order'):
            item.order -= 1
            item.save()

    class Meta:
        ordering = ['order']

    def __str__(self):
        return (
            f"in {self.routine.name})",
            f"{self.task} ({self.duration} min)"
        )


class TimerState(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    routine = models.ForeignKey(Routine, on_delete=models.CASCADE)
    current_task_index = models.PositiveIntegerField(default=0)
    current_seconds = models.PositiveIntegerField(default=0)
    is_paused = models.BooleanField(default=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'TimerState for {self.user.username} - {self.routine.name}'
