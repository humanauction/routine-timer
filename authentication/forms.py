from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class SignUpForm(UserCreationForm):
    email = forms.EmailField(required=True, help_text='Please enter a valid email address.')
    """
    Form for user (onboarding/sign up) registration.
    """
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("Email already exists - please login instead or use a different email.")
        return email

class LoginForm(AuthenticationForm):
    """
    Form for user login.
    """
    username = forms.CharField(label='Username or Email', max_length=200, widget=forms.TextInput(attrs={'autofocus': True}))