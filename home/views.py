from django.views.generic import TemplateView, FormView
from django.urls import reverse_lazy
from django.contrib import messages


# Create your views here.


class HomePage(TemplateView):
    """
    Displays home page"
    """
    template_name = 'home/index.html'


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
        messages.success(self.request, "Thanks, {}! We will contact you at {}.".format(name, email))
        return super().form_valid(form)


class ContactView(TemplateView):
    template_name = 'home/contact.html'

    def get(self, request, *args, **kwargs):
        # Render the contact page
        return self.render_to_response({})

    def post(self, request, *args, **kwargs):
        # Handle POST request - process form submission
        name = request.POST.get('name', '')
        email = request.POST.get('email', '')
        message = request.POST.get('message', '')

        # Form data validation
        if not all([name, email, message]):
            messages.error(request, "Please fill in all fields.")
            return self.render_to_response({})
            
        # Process form data
        # send_contact_email(name, email, message)
        
        messages.success(request, "Thank you! Your message has been sent.")
        return self.render_to_response({})
