from django.urls import path
from .views import (
    RoutineBuilderView, SaveRoutineView,
    StartRoutineView, RoutineDetailView, routine_list,
)

app_name = 'routine'

urlpatterns = [
    path('', routine_list, name='routine_list'),
    path('builder/', RoutineBuilderView.as_view(), name='builder'),
    path('save/', SaveRoutineView.as_view(), name='save'),
    path('start/', StartRoutineView.as_view(), name='start'),
    path('detail/<int:pk>/', RoutineDetailView.as_view(), name='detail'),
]