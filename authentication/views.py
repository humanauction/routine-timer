from django.urls import reverse_lazy
from django.views.generic import FormView
from django.contrib.auth.views import LoginView as DjangoLoginView, LogoutView
from .forms import SignUpForm, LoginForm
from .services import register_user, send_welcome_mail
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
        messages.success(self.request, "Success, please sign in.")
        # Console log success message
        print("User registration successful for:", user.username)
        return super().form_valid(form)


class LoginView(DjangoLoginView):
    template_name = 'authentication/login.html'
    authentication_form = LoginForm
    redirect_authenticated_user = True


class LogoutView(LogoutView):
    next_page = reverse_lazy('authentication:login')
