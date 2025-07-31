from django.views.generic import TemplateView, FormView
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import render


# Create your views here.

class HomePage(TemplateView):
    """
    Displays home page"
    """
    template_name = 'home/index.html'
    index_content_template = 'home/index_content.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        # AJAX partial support here
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return render(request, self.index_content_template, context)
        return render(request, self.template_name, context)


class ContactFormView(FormView):
    """
    Displays contact page"
    """
    template_name = 'home/contact.html'
    success_url = reverse_lazy('home:contact')

    def form_valid(self, form):
        # process form data here
        name = form.cleaned_data['name']
        email = form.cleaned_data['email']
        # success confirmation message
        messages.success(
            self.request,
            (
                "Thanks {0}! We will reply to {1}."
                .format(name, email)
            )
        )
        return super().form_valid(form)


class ContactView(TemplateView):
    template_name = 'home/contact.html'
    contact_content_template = 'home/contact_content.html'

    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return render(request, self.contact_content_template, context)
        return render(request, self.template_name, context)

    def post(self, request, *args, **kwargs):
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        message = request.POST.get('message', '')

        context = self.get_context_data(**kwargs)
        context.update({'name': name, 'email': email, 'message': message})

        if not all([name, email, message]):
            messages.error(request, "Please fill in all fields.")
        else:
            # send_contact_email(name, email, message)
            messages.success(request, "Thank you! Your message has been sent.")

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return render(request, self.contact_content_template, context)
        return render(request, self.template_name, context)
