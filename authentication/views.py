from django.http import HttpResponse
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.contrib.auth.views import LoginView as DjangoLoginView, LogoutView
from .forms import SignUpForm, LoginForm
from .services import register_user, send_welcome_mail
from django.shortcuts import render
from django.contrib import messages

# Create your views here.


class SignUpView(FormView):
    template_name = 'authentication/signup.html'
    form_class = SignUpForm
    success_url = reverse_lazy('authentication:login')

    def form_valid(self, form):
        """"register new user"""
        user = register_user(
            username=form.cleaned_data['username'],
            email=form.cleaned_data['email'],
            password=form.cleaned_data['password1']
        )
        """send welcome email"""
        send_welcome_mail(user)
        # Add success message
        messages.warning(self.request, "Account created successfully! Please log in.")
        print("Message added to request:", self.request._messages._queued_messages)  # Debug print
        return super().form_valid(form)


class LoginView(DjangoLoginView):
    template_name = 'authentication/login.html'
    authentication_form = LoginForm
    redirect_authenticated_user = True


class LogoutView(LogoutView):
    next_page = reverse_lazy('authentication:login')

