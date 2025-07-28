from django.urls import path
from .views import (
    RoutineBuilderView, SaveRoutineView, RoutineDetailView,
    routine_list, TimerView, DeleteRoutineView, 
    get_current_tasks, StartRoutineView,
    remove_task_from_builder, reorder_tasks_in_builder,
    remove_routine_item, reorder_routine_items
)

app_name = 'routine'

urlpatterns = [
    path('', routine_list, name='list'),
    path('builder/', RoutineBuilderView.as_view(), name='builder'),
    path('save/', SaveRoutineView.as_view(), name='save'),
    path('start/', StartRoutineView.as_view(), name='start'),
    path('detail/<int:pk>/', RoutineDetailView.as_view(), name='detail'),
    path('delete/<int:pk>/', DeleteRoutineView.as_view(), name='delete'),
    path('timer/', TimerView.as_view(), name='timer'),
    path('get-current-tasks/', get_current_tasks, name='get_current_tasks'),
    path('task/remove/', remove_task_from_builder, name='remove_task'),
    path('task/reorder/', reorder_tasks_in_builder, name='reorder_tasks'),
    path('item/<int:pk>/remove/', remove_routine_item, name='remove_item'),
    path('<int:routine_pk>/reorder/', reorder_routine_items, name='reorder_items'),
]
