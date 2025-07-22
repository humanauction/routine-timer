from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.utils.html import escape
from django.utils.translation import gettext_lazy as _
import re

User = get_user_model()


class SignUpForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        help_text=_('Please enter a valid email address.'),
        max_length=254,
        widget=forms.EmailInput(attrs={'autocomplete': 'email'})
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def clean_username(self):
        username = self.cleaned_data.get('username', '').strip()
        # Enforce allowed characters (letters, digits, underscores, hyphens)
        if not re.match(r'^[\w.@+-]+$', username):
            raise ValidationError(
                _("Username may contain only letters, digits, and @/./+/-/_ characters.")
            )
        # Prevent XSS by escaping username
        username = escape(username)
        # Check for duplicate usernames (case-insensitive)
        if User.objects.filter(username__iexact=username).exists():
            raise ValidationError(_("Username already exists. Please choose another."))
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        # Basic email format validation is already handled by EmailField
        # Prevent duplicate emails (case-insensitive)
        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError(_("Email already exists - please login instead or use a different email."))
        return email

    def clean(self):
        cleaned_data = super().clean()
        # Additional checks can be added here (e.g., password strength, etc.)
        return cleaned_data


class LoginForm(AuthenticationForm):
    """
    Form for user login.
    """
    username = forms.CharField(
        label='Username or Email',
        max_length=200,
        widget=forms.TextInput(
            attrs={'autofocus': True, 'autocomplete': 'username'}),
        strip=True,
    )
    password = forms.CharField(
        label='Password',
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'current-password'}),
    )

    def clean_username(self):
        username = self.cleaned_data.get('username', '').strip()
        # todo: add further validation and normalization here
        return username

    def clean_password(self):
        password = self.cleaned_data.get('password', '')
        # todo: add further validation here
        return password