from django.test import TestCase, Client
from django.urls import reverse


class AuthViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_login_page_loads(self):
        response = self.client.get(reverse('authentication:login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'authentication/login.html')

    def test_signup_page_loads(self):
        response = self.client.get(reverse('authentication:signup'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'authentication/signup.html')

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
# Create your tests here.
