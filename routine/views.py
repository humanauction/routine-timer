from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from .forms import TaskForm
from .services import (
    get_current_routine, add_task, clear_routine, save_routine_to_db
)
from .models import Routine
from django.views.generic import TemplateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth.decorators import login_required


class TimerView(TemplateView):
    template_name = 'routine/timer.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add any required context variables here
        context['title'] = 'Routine Timer'
        return context


@login_required
def routine_list(request):
    routines = Routine.objects.filter(user=request.user)
    return render(request, 'routine/list.html', {'routines': routines})


class RoutineBuilderView(LoginRequiredMixin, View):
    template_name = 'routine/builder.html'
    form_class = TaskForm

    def get(self, request):
        """Handle GET requests for the routine builder"""
        form = self.form_class()
        tasks = get_current_routine(request.session)
        total = sum(task['duration'] for task in tasks)
        context = {
            'form': form,
            'tasks': tasks,
            'total': total,
            'routine_name': request.GET.get('name', 'My Routine')
        }
        return render(request, self.template_name, context)

    def post(self, request):
        form = TaskForm(request.POST)
        if form.is_valid():
            task = form.cleaned_data['task']
            duration = form.cleaned_data['duration']
            name = request.POST.get('name', 'My Routine')

            # Add to session
            add_task(request.session, task, duration)

            # Handle AJAX request
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': True,
                    'task': {
                        'task': task,
                        'duration': duration
                    }
                })

            # Non-AJAX response (regular form submit)
            return redirect('routine:builder')
        else:
            tasks = get_current_routine(request.session)
            total = sum(task['duration'] for task in tasks)

            # Handle AJAX validation errors
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'success': False,
                    'error': form.errors
                })

            # Non-AJAX response
            context = {
                'form': form,
                'tasks': tasks,
                'total': total,
                'routine_name': request.POST.get('name', 'My Routine')
            }
            return render(request, 'routine/builder.html', context)


class SaveRoutineView(LoginRequiredMixin, View):
    def post(self, request):
        # Check for guest user first
        if hasattr(request.user, 'profile') and request.user.profile.is_guest:
            messages.warning(
                request, "Please login or signup to save routines"
            )
            return JsonResponse(
                {'success': False, 'error': 'Guests cannot save routines'},
                status=403
                )
        # Registered user can save routines here
        tasks = get_current_routine(request.session)
        if not tasks:
            return redirect('routine:builder')

        name = request.POST.get('name', 'My Routine')
        routine = save_routine_to_db(request.user, name, tasks)
        clear_routine(request.session)
        return redirect('routine:detail', pk=routine.pk)


class StartRoutineView(LoginRequiredMixin, View):
    def post(self, request):
        tasks = get_current_routine(request.session)
        total = sum(item['duration'] for item in tasks)
        return render(request, 'routine/start.html',
                      {'tasks': tasks, 'total': total})


class RoutineDetailView(LoginRequiredMixin, View):
    def get(self, request, pk):
        routine = get_object_or_404(Routine, pk=pk, user=request.user)
        return render(request, 'routine/detail.html', {'routine': routine})

# delete routine


class DeleteRoutineView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Routine
    template_name = 'routine/routine_confirm_delete.html'
    success_url = reverse_lazy('routine:list')

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
