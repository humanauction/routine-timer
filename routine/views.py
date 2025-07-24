from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from .forms import TaskForm
from .services import (
    get_current_routine, add_task, clear_routine, save_routine_to_db
)
from .models import Routine
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required


class TimerView(TemplateView):
    template_name = 'routine/timer.html'


@login_required
def routine_list(request):
    routines = Routine.objects.filter(user=request.user)
    return render(request, 'routine/list.html', {'routines': routines})


class RoutineBuilderView(LoginRequiredMixin, View):
    template_name = 'routine/builder.html'
    form_class = TaskForm

    def get(self, request):
        if 'routine_tasks' not in request.session:
            request.session['routine_tasks'] = []
        form = self.form_class()
        tasks = get_current_routine(request.session)
        total = sum(item['duration'] for item in tasks)
        return render(request, self.template_name,
                      {'form': form, 'tasks': tasks, 'total': total})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            add_task(request.session,
                     form.cleaned_data['task'],
                     form.cleaned_data['duration'])
            return redirect('routine:builder')

        tasks = get_current_routine(request.session)
        total = sum(item['duration'] for item in tasks)
        return render(request, self.template_name,
                      {'form': form, 'tasks': tasks, 'total': total})


class SaveRoutineView(LoginRequiredMixin, View):
    def post(self, request):
        tasks = get_current_routine(request.session)
        if not tasks:
            return redirect('routine:builder')

        name    = request.POST.get('name', 'My Routine')
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
