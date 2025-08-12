from django.views.generic import TemplateView
from django.shortcuts import render
from django.http import JsonResponse


class StandaloneTimerView(TemplateView):
    template_name = 'timer/standaloneTimer.html'
    content_template_name = 'timer/standaloneTimer_content.html'
    """    Displays the standalone timer page
    """
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['time_remaining'] = '00:00:00'
        return context

    def get(self, request, *args, **kwargs):
        content = self.get_context_data(**kwargs)
        # AJAX partial support here
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return render(request, self.content_template_name, content)
        return render(request, self.template_name, content)


# Unit tests for timer views
def standalone_timer(request):
    return render(request, 'timer/standaloneTimer.html')


def standalone_timer_start(request):
    return JsonResponse({'status': 'started'})


def standalone_timer_pause(request):
    return JsonResponse({'status': 'paused'})


def standalone_timer_complete(request):
    return JsonResponse({'status': 'completed'})
