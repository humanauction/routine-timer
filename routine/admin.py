from django.contrib import admin
from .models import Routine, RoutineItem

# Register your models here.

admin.site.register(Routine)
admin.site.register(RoutineItem)
