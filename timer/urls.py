from django.urls import path
from .views import StandaloneTimerView

urlpatterns = [
    path('', StandaloneTimerView.as_view(), name='standalone_timer'),
]