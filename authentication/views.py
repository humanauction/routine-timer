from django.contrib.auth import login
from django.contrib.auth.models import User, Group
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.contrib.auth.views import LoginView as DjangoLoginView, LogoutView
from .forms import SignUpForm, LoginForm
from .services import register_user, send_welcome_mail
from django.contrib import messages
from django.views import View
from django.utils.crypto import get_random_string
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

    def get_success_url(self):

        """Redirect to the home after login"""
        return reverse_lazy('home:index')
    
    def form_valid(self, form):
        """ Add success message """
        messages.success(self.request, "Hi, {}".format(form.cleaned_data['username']))
        return super().form_valid(form)


class GuestLoginView(View):
    """ guest user login. limited permissions """

    def get(self, request):
        """ create guest user, log in and redirect """
        if request.user.is_authenticated:
            messages.info(request, "love to, but you're already logged in.")
            return redirect('home:index')
        
        # create guest user
        guest_username = f"guest_{get_random_string(8)}"
        
        guest_user = User.objects.create_user(username=guest_username)

        # add to guest group(or create group if none exists)
        guest_group, _ = Group.objects.get_or_create(name='Guests')
        guest_user.groups.add(guest_group)

        # flag as guest account
        guest_user.profile.is_guest = True
        guest_user.profile.save()

        #login guest_user
        login(request, guest_user)

        messages.success(request, "Logged in as guest user: {}".format(guest_user.username))
        return redirect('home:index')

class LogoutView(LogoutView):
    next_page = reverse_lazy('authentication:login')
