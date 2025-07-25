from django.urls import path
from .views import SignUpView, LoginView, LogoutView, GuestLoginView

app_name = 'authentication'

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('guest-login/', GuestLoginView.as_view(), name='guest_login')
]
