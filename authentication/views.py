from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.generic import FormView, View
from django.contrib.auth.views import LoginView as DjangoLoginView, LogoutView
from django.contrib.auth import login, get_user_model
from django.contrib.auth.models import Group
from .forms import SignUpForm, LoginForm
from .services import register_user, send_welcome_mail
from django.contrib import messages
from django.utils.crypto import get_random_string

# Create your views here.

User = get_user_model()

class LoginView(DjangoLoginView):
    template_name = 'authentication/login.html'
    form_class = LoginForm
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('home:index')

    def form_valid(self, form):
        username = form.cleaned_data.get('username')
        messages.success(self.request, f"Welcome back, {username}!")
        return super().form_valid(form)

    def get(self, request, *args, **kwargs):
        """If user is already logged in, redirect to home"""
        if request.user.is_authenticated:
            return redirect('home:index')
        # Initialize both forms for the template
        login_form = self.form_class()
        signup_form = SignUpForm()
        return render(request, self.template_name, {
            'login_form': login_form,
            'signup_form': signup_form
        })

    def post(self, request, *args, **kwargs):
        """Handle both login and register form submissions"""
        # Check which form was submitted
        form_type = request.POST.get('form_type')
        
        if form_type == 'sign_up':
            # This is a sign up submission
            signup_form = SignUpForm(request.POST)
            login_form = self.form_class()
            
            if signup_form.is_valid():
                # Create the new user
                user = register_user(
                    username=signup_form.cleaned_data['username'],
                    email=signup_form.cleaned_data['email'],
                    password=signup_form.cleaned_data['password1']
                )
                # Send welcome email
                send_welcome_mail(user)
                
                # Log the user in
                login(request, user)
                
                # Add success message
                messages.success(request, f"Welcome to Routine Timer, {user.username}!")
                
                # Redirect to home
                return redirect('home:index')
            else:
                # Form is invalid, re-render with errors
                return render(request, self.template_name, {
                    'login_form': login_form,
                    'signup_form': signup_form
                })
        else:
            # This is a login submission, let the parent class handle it
            return super().post(request, *args, **kwargs)


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

        # login guest_user
        login(request, guest_user)

        messages.success(
            request,
            "Logged in as guest user: {}".format(guest_user.username))
        return redirect('home:index')


class LogoutView(LogoutView):
    next_page = reverse_lazy('authentication:login')