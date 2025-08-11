from django.urls import path
from .views import (
    RoutineBuilderView, SaveRoutineView, RoutineDetailView,
    routine_list, TimerView, DeleteRoutineView,
    get_current_tasks, StartRoutineView,
    remove_task_from_builder, reorder_tasks_in_builder,
    remove_routine_item, reorder_routine_items, StartRoutineBuilderView)
from . import views

app_name = 'routine'

urlpatterns = [
    path('', routine_list, name='list'),
    path('builder/', RoutineBuilderView.as_view(), name='builder'),
    path('start-builder/', StartRoutineBuilderView.as_view(),
         name='start_builder'),
    path('save/', SaveRoutineView.as_view(), name='save'),
    path('start/<int:pk>/', StartRoutineView.as_view(), name='start'),
    path('detail/<int:pk>/', RoutineDetailView.as_view(), name='detail'),
    path('delete/<int:pk>/', DeleteRoutineView.as_view(), name='delete'),
    path('timer/<int:routine_pk>/', TimerView.as_view(), name='timer'),
    path('get-current-tasks/', get_current_tasks, name='get_current_tasks'),
    path('task/remove/', remove_task_from_builder, name='remove '),
    path('task/reorder/', reorder_tasks_in_builder, name='reorder'),
    path('item/<int:pk>/remove/', remove_routine_item, name='remove_item'),
    path('<int:routine_pk>/reorder/',
         reorder_routine_items, name='reorder_items'),
    path(
        'timer/<int:routine_pk>/state/',
        views.get_timer_state,
        name='get_timer_state'
    ),
    path(
        'timer/<int:routine_pk>/state/save/',
        views.save_timer_state,
        name='save_timer_state'
        ),
    path('create/', views.create_routine, name='create'),
    path('task/remove/', views.remove_task_from_builder, name='remove'),
    path('builder/add-task/', views.add_task_to_builder, name='add_task_to_builder'),
]
