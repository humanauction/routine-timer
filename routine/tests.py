from django.test import TestCase, Client
from django.urls import reverse
from .models import Routine, RoutineItem
from authentication.models import CustomUser


class RoutineViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = CustomUser.objects.create_user(
            username='routineuser',
            email='routine@example.com',
            password='routinepass'
        )
        self.client.login(username='routineuser', password='routinepass')
        self.routine = Routine.objects.create(
            user=self.user,
            name='Morning Routine'
        )

    def test_create_routine(self):
        response = self.client.post(
            reverse('routine:create'),
            {
                'name': 'Evening Routine'
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            Routine.objects.filter(name='Evening Routine').exists()
        )

    def test_add_item_to_routine(self):
        item = RoutineItem.objects.create(
            routine=self.routine, order=1, duration=10, task='Test Task'
        )
        self.assertEqual(item.routine, self.routine)
        self.assertEqual(item.duration, 10)
        self.assertEqual(item.task, 'Test Task')

    def test_routine_list_view(self):
        response = self.client.get(reverse('routine:list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Morning Routine')

    def test_routine_delete(self):
        response = self.client.post(
            reverse('routine:delete', args=[self.routine.id])
        )
        self.assertEqual(
            response.status_code,
            302
        )
        self.assertFalse(Routine.objects.filter(id=self.routine.id).exists())

    def test_routine_list_loads(self):
        response = self.client.get(reverse('routine:list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/list.html')

    def test_routine_builder_loads(self):
        response = self.client.get(reverse('routine:builder'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/builder.html')

    def test_add_task_to_builder_zero_duration(self):
        response = self.client.post(
            reverse('routine:add_task_to_builder'),
            {'task': 'Test', 'duration': 0}
        )
        self.assertEqual(response.status_code, 400)
        
        # Access the nested error structure
        error_data = response.json().get('error', {})
        duration_errors = error_data.get('duration', [])
        
        self.assertTrue(len(duration_errors) > 0)
        self.assertIn(
            'Ensure this value is greater than or equal to 1.',
            duration_errors[0]
        )
