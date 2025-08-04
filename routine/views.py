from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import render, redirect, get_object_or_404
import json
from django.views import View
from .forms import TaskForm
from .services import (
    get_current_routine, add_task, clear_routine, save_routine_to_db,
    get_routine_name, set_routine_name, reorder_tasks, remove_task
)
from .models import Routine, RoutineItem, TimerState
from django.views.generic import TemplateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction


class TimerView(TemplateView):
    template_name = 'routine/timer.html'
    content_template_name = 'routine/timer_content.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add any required context variables here
        context['title'] = 'Routine Timer'
        return context

    # AJAX partial support here

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return render(request, self.content_template_name, context)
        return render(request, self.template_name, context)


@login_required
def get_current_tasks(request):
    """API endpoint to get the current tasks in the session"""
    tasks = get_current_routine(request.session)
    total = sum(task['duration'] for task in tasks)
    return JsonResponse({
        'tasks': tasks,
        'total': total,
    })


@login_required
def routine_list(request):
    routines = Routine.objects.filter(user=request.user)
    context = {'routines': routines}
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return render(request, 'routine/list_content.html', context)
    return render(request, 'routine/list.html', context)


class RoutineBuilderView(LoginRequiredMixin, View):
    template_name = 'routine/builder.html'
    content_template_name = 'routine/builder_content.html'
    form_class = TaskForm

    def get(self, request):
        """Handle GET requests for the routine builder"""
        form = self.form_class()
        tasks = get_current_routine(request.session)
        routine_name = get_routine_name(request.session)
        total = sum(task['duration'] for task in tasks)

        context = {
            'form': form,
            'tasks': tasks,
            'total': total,
            'routine_name': routine_name
        }
        # AJAX partial support here
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return render(request, self.content_template_name, context)
        return render(request, self.template_name, context)

    def post(self, request):
        """Handle POST requests for the routine builder"""
        # Check if it's a routine name update
        if 'name' in request.POST and 'task' not in request.POST:
            # Handle routine name submission
            routine_name = request.POST.get('name', 'My Routine')
            set_routine_name(request.session, routine_name)

            # If it's an AJAX request
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'routine_name': routine_name
                })

            # Regular form submission
            return redirect('routine:builder')

        # Handle task submission
        form = TaskForm(request.POST)
        routine_name = get_routine_name(request.session)

        if form.is_valid():
            task = form.cleaned_data['task']
            duration = form.cleaned_data['duration']

            # Add task to session
            add_task(request.session, task, duration)

            # Handle AJAX request
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'task': {
                        'task': task,
                        'duration': duration
                    },
                    'routine_name': routine_name
                })

            # Regular form submission
            return redirect('routine:builder')

        # Form is invalid
        tasks = get_current_routine(request.session)
        total = sum(task['duration'] for task in tasks)

        # Handle AJAX validation errors
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': False,
                'error': form.errors
            })

        # Regular form submission with errors
        context = {
            'form': form,
            'tasks': tasks,
            'total': total,
            'routine_name': routine_name
        }
        return render(request, self.template_name, context)


@method_decorator(require_http_methods(['POST']), name="dispatch")
class StartRoutineBuilderView(LoginRequiredMixin, View):
    def post(self, request, *args, **kwargs):
        # Save session routine as real Routine, return its ID
        routine_name = (
            request.POST.get('routine_name')
            or (
                request.body
                and json.loads(request.body).get('routine_name')
            )
        )
        tasks = get_current_routine(request.session)
        if not tasks:
            return JsonResponse(
                {'success': False, 'error': 'No tasks in routine'},
                status=400
            )
        routine = save_routine_to_db(request.user, routine_name, tasks)
        clear_routine(request.session)
        return JsonResponse({'success': True, 'routine_id': routine.pk})


class SaveRoutineView(LoginRequiredMixin, View):
    def post(self, request):
        # Check for guest user first
        if hasattr(request.user, 'profile') and request.user.profile.is_guest:
            messages.warning(request,
                             "Please login or signup to save routines"
                             )
            return JsonResponse(
                {'success': False, 'error': 'Guests cannot save routines'},
                status=403
            )

        # Registered user can save routines here
        tasks = get_current_routine(request.session)
        if not tasks:
            return redirect('routine:builder')

        name = get_routine_name(request.session)
        routine = save_routine_to_db(request.user, name, tasks)
        clear_routine(request.session)
        return redirect('routine:detail', pk=routine.pk)


@method_decorator(require_http_methods(["GET", "POST"]), name='dispatch')
class StartRoutineView(LoginRequiredMixin, View):
    def get(self, request, pk=None, *args, **kwargs):
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        routine_items = routine.items.all().order_by('order')
        total = sum(item.duration for item in routine_items)
        # Serialize tasks for JS
        tasks = [
            {'task': item.task, 'duration': item.duration}
            for item in routine_items
        ]
        return render(
            request, 'routine/timer.html',
            {'routine': routine, 'tasks': tasks, 'total': total}
        )

    def post(self, request, pk=None, *args, **kwargs):
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        routine_items = routine.items.all().order_by('order')
        total = sum(item.duration for item in routine_items)
        tasks = [
            {'task': item.task, 'duration': item.duration}
            for item in routine_items
        ]
        return render(
            request, 'routine/timer.html',
            {'routine': routine, 'tasks': tasks, 'total': total}
        )


class RoutineDetailView(LoginRequiredMixin, View):
    def get(self, request, pk, *args, **kwargs):
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        routine_items = routine.items.all().order_by('order')
        total_duration = sum(item.duration for item in routine_items)
        return render(request, 'routine/detail.html', {
            'routine': routine,
            'routine_items': routine_items,  # Changed from 'tasks'
            'total_duration': total_duration
        })


# delete routine


class DeleteRoutineView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Routine
    template_name = 'routine/routine_confirm_delete.html'
    content_template_name = 'routine/routine_confirm_delete_content.html'
    success_url = reverse_lazy('routine:list')

    # AJAX partial support here
    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        context = self.get_context_data(object=self.object)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return render(request, self.content_template_name, context)
        return render(request, self.template_name, context)

    def test_func(self):
        # Security check: only allow users to delete their own routines
        routine = self.get_object()
        return self.request.user == routine.user

    def delete(self, request, *args, **kwargs):
        routine = self.get_object()
        messages.success(
            request,
            f"Routine '{routine.name}' deleted successfully."
        )
        return super().delete(request, *args, **kwargs)


@login_required
def remove_task_from_builder(request):
    """Remove a task from the session by index"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            index = data.get('index')
            tasks = remove_task(request.session, index)
            total = sum(task['duration'] for task in tasks)
            return JsonResponse({
                'success': True,
                'tasks': tasks,
                'total': total
            })
        except (ValueError, IndexError) as e:
            return JsonResponse(
                {'success': False, 'error': str(e)}, status=400
                )
    return JsonResponse(
        {'success': False, 'error': 'Invalid method'}, status=405
        )


@login_required
def reorder_tasks_in_builder(request):
    """Reorder tasks in the session"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_order = data.get('order', [])
            tasks = reorder_tasks(request.session, new_order)
            total = sum(task['duration'] for task in tasks)
            return JsonResponse({
                'success': True,
                'tasks': tasks,
                'total': total
            })
        except (ValueError, TypeError) as e:
            return JsonResponse(
                {'success': False, 'error': str(e)}, status=400
                )
    return JsonResponse(
        {'success': False, 'error': 'Invalid method'}, status=405
    )


@login_required
def remove_routine_item(request, pk):
    """Remove a routine item by its primary key"""
    if request.method == 'POST':
        try:
            item = get_object_or_404(RoutineItem, pk=pk)

            # Security check: only allow users to modify their own routines
            if item.routine.user != request.user:
                return JsonResponse(
                    {'success': False, 'error': 'Permission denied'},
                    status=403
                )

            routine = item.routine
            item.delete_and_reorder()

            # Get updated items and total
            routine_items = routine.items.all().order_by('order')
            total_duration = sum(item.duration for item in routine_items)

            return JsonResponse({
                'success': True,
                'total': total_duration
            })
        except RoutineItem.DoesNotExist:
            return JsonResponse(
                {'success': False, 'error': 'Routine item not found'},
                status=404
            )
        except Exception as e:
            return JsonResponse(
                {'success': False, 'error': str(e)},
                status=400
            )
    return JsonResponse({'success': False, 'error': 'Invalid method'},
                        status=405)


@login_required
def reorder_routine_items(request, routine_pk):
    """Reorder routine items"""
    if request.method == 'POST':
        try:
            routine = get_object_or_404(
                Routine,
                pk=routine_pk,
                user=request.user
            )
            data = json.loads(request.body)
            new_order = data.get('order', [])

            # Validate that all item IDs belong to this routine
            item_ids = [int(id) for id in new_order]
            routine_items = routine.items.filter(id__in=item_ids)

            if routine_items.count() != len(item_ids):
                return JsonResponse(
                    {'success': False, 'error': 'Invalid item IDs'},
                    status=400
                )

            # Update the order of items
            with transaction.atomic():
                for index, item_id in enumerate(new_order):
                    item = routine_items.get(id=item_id)
                    item.order = index
                    item.save()

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse(
                {'success': False, 'error': str(e)}, status=400
            )
    return JsonResponse(
        {'success': False, 'error': 'Invalid method'},
        status=405
    )


def timer(request, routine_pk):
    routine = get_object_or_404(Routine, pk=routine_pk, user=request.user)
    items = routine.items.all().order_by('order')
    tasks = [
        {'task': item.task, 'duration': item.duration}
        for item in items
    ]
    total = sum(item['duration'] for item in tasks)
    return render(request, 'routine/timer.html', {
        'routine': routine,
        'tasks': tasks,
        'total': total,
    })


@csrf_exempt
def save_timer_state(request, routine_pk):
    if request.method == 'POST':
        data = json.loads(request.body)
        state, _ = TimerState.objects.get_or_create(
            user=request.user, routine_id=routine_pk
        )
        state.current_task_index = data['current_task_index']
        state.current_seconds = data['current_seconds']
        state.is_paused = data['is_paused']
        state.save()
        return JsonResponse({'success': True})


def get_timer_state(request, routine_pk):
    try:
        state = TimerState.objects.get(user=request.user, routine_id=routine_pk)
        return JsonResponse({
            'current_task_index': state.current_task_index,
            'current_seconds': state.current_seconds,
            'is_paused': state.is_paused,
            'last_updated': state.last_updated.timestamp(),
        })
    except TimerState.DoesNotExist:
        return JsonResponse({'current_task_index': 0, 'current_seconds': 0, 'is_paused': True})
