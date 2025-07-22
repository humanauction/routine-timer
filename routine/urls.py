from django.urls import path
from .views import (
    RoutineBuilderView, SaveRoutineView,
    StartRoutineView, RoutineDetailView
)

app_name = 'routine'

urlpatterns = [
    path('builder/', RoutineBuilderView.as_view(), name='builder'),
    path('save/', SaveRoutineView.as_view(), name='save'),
    path('start/', StartRoutineView.as_view(), name='start'),
    path('detail/<int:pk>/', RoutineDetailView.as_view(), name='detail'),
]