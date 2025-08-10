from django.test import TestCase
from django.urls import reverse


class HomeTests(TestCase):
    def test_home_page_loads(self):
        response = self.client.get(reverse('home:index'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Routine Timer")

    def test_contact_form_submission(self):
        response = self.client.post(reverse('home:contact'), {
            'name': 'Test User',
            'email': 'test@example.com',
            'message': 'Hello!'
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Thank you")
