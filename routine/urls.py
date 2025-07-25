from django.urls import path
from .views import (
    RoutineBuilderView, SaveRoutineView, RoutineDetailView,
    routine_list, TimerView, DeleteRoutineView
)

app_name = 'routine'

urlpatterns = [
    path('', routine_list, name='list'),
    path('builder/', RoutineBuilderView.as_view(), name='builder'),
    path('save/', SaveRoutineView.as_view(), name='save'),
    path('start/', TimerView.as_view(), name='start'),
    path('detail/<int:pk>/', RoutineDetailView.as_view(), name='detail'),
    path('delete/<int:pk>/', DeleteRoutineView.as_view(), name='delete'),
    path('timer/', TimerView.as_view(), name='timer'),
]
