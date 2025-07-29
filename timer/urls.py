from django.urls import path
from .views import StandaloneTimerView

app_name = 'timer'

urlpatterns = [
    path('standalone/', StandaloneTimerView.as_view(), name='standalone'),
]
