from django.views.generic import TemplateView


class StandaloneTimerView(TemplateView):
    template_name = 'timer/standalone.html'
