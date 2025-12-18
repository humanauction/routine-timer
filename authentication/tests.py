from django.test import TestCase, Client
from django.urls import reverse
from .models import CustomUser


class AuthViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_login_page_loads(self):
        response = self.client.get(reverse('authentication:login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'authentication/login.html')

    def test_signup_page_loads(self):
        response = self.client.get(reverse('authentication:login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'authentication/login.html')

    def test_login_form_invalid(self):
        response = self.client.post(reverse('authentication:login'), {
            'username': 'wrong',
            'password': 'wrong'
        })
        self.assertContains(
            response,
            ('Please enter a correct username and password')
        )

    def test_signup_form_invalid(self):
        response = self.client.post(reverse('authentication:signup'), {
            'username': '',
            'email': 'not-an-email',
            'password1': '123',
            'password2': '456'
        })
        self.assertContains(response, 'This field is required')

    def test_login_success(self):
        response = self.client.post(reverse('authentication:login'), {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 302)  # Redirect on success

    def test_login_failure(self):
        response = self.client.post(reverse('authentication:login'), {
            'username': 'testuser',
            'password': 'wrongpass'
        })
        self.assertContains(
            response,
            "Please enter a correct username and password",
            status_code=200
        )

    def test_signup(self):
        response = self.client.post(reverse('authentication:login'), {
            'form_type': 'sign_up',
            'username': 'newuser',
            'email': 'new@example.com',
            'password1': 'newpass123',
            'password2': 'newpass123'
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(CustomUser.objects.filter(username='newuser').exists())

    def test_guest_access(self):
        response = self.client.get(reverse('authentication:guest_login'))
        self.assertEqual(response.status_code, 302)

    def test_admin_login(self):
        admin = CustomUser.objects.create_superuser(
            username='admin', email='admin@example.com', password='adminpass'
        )
        response = self.client.post(reverse('authentication:login'), {
            'username': 'admin',
            'password': 'adminpass'
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response.url.startswith(reverse('home:index')))
