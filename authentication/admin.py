from django.contrib import admin
from django_summernote.admin import SummernoteModelAdmin
from .models import CustomUser


# Register your models here.


@admin.register(CustomUser)
class MyModelAdmin(SummernoteModelAdmin):
    list_display = ('username', 'email', 'date_joined')
    search_fields = ['username', 'email',]
    list_filter = ('is_active', 'date_joined')