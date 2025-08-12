from django.urls import path
from .views import StandaloneTimerView
from . import views

app_name = 'timer'

urlpatterns = [
    path('standalone/', StandaloneTimerView.as_view(), name='standalone'),
    # Unit tests for timer views
    path(
        'standalone/start/',
        views.standalone_timer_start,
        name='standalone_start'
    ),
    path(
        'standalone/pause/',
        views.standalone_timer_pause,
        name='standalone_pause'
    ),
    path(
        'standalone/complete/',
        views.standalone_timer_complete,
        name='standalone_complete'
    ),
]
