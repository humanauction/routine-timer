from django.urls import path
from .views import HomePage, ContactView


app_name = 'home'

urlpatterns = [
    path('', HomePage.as_view(), name='index'),
    path('contact/', ContactView.as_view(), name='contact'),
]
