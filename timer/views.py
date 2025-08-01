from django.views.generic import TemplateView
from django.shortcuts import render


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
