from django.test import TestCase, Client
from django.urls import reverse


class HomeViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_home_page_loads(self):
        response = self.client.get(reverse('home:index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home/index.html')

    def test_contact_page_loads(self):
        response = self.client.get(reverse('home:contact'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home/contact.html')

    def test_contact_form_post(self):
        response = self.client.post(reverse('home:contact'), {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Hello!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(
            response, 'Bojangles'
        )  # Adjust to your success message
