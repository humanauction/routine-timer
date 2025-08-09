from django.test import TestCase, Client
from django.urls import reverse


class RoutineViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    def test_routine_list_loads(self):
        response = self.client.get(reverse('routine:list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/list.html')

    def test_routine_builder_loads(self):
        response = self.client.get(reverse('routine:builder'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/builder.html')


# Create your tests here.
