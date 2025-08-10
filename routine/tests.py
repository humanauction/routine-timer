from django.test import TestCase, Client
from django.urls import reverse
from .models import Routine, RoutineTask
from authentication.models import CustomUser


class RoutineViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = CustomUser.objects.create_user(
            username='routineuser', email='routine@example.com', password='routinepass'
        )
        self.client.login(username='routineuser', password='routinepass')
        self.routine = Routine.objects.create(
            user=self.user, title='Morning Routine', total_duration=30, status='draft'
        )

    def test_create_routine(self):
        response = self.client.post(reverse('routine:create'), {
            'title': 'Evening Routine',
            'total_duration': 45
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Routine.objects.filter(title='Evening Routine').exists())

    def test_add_task_to_routine(self):
        task = RoutineTask.objects.create(
            routine=self.routine, sequence_order=1, duration=10
        )
        self.assertEqual(task.routine, self.routine)
        self.assertEqual(task.duration, 10)

    def test_routine_list_view(self):
        response = self.client.get(reverse('routine:list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Morning Routine')

    def test_routine_delete(self):
        response = self.client.post(reverse('routine:delete', args=[self.routine.id]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Routine.objects.filter(id=self.routine.id).exists())

    def test_routine_edge_case_zero_duration(self):
        response = self.client.post(reverse('routine:create'), {
            'title': 'Zero Duration',
            'total_duration': 0
        })
        self.assertContains(response, "Duration must be greater than zero", status_code=200)

    def test_routine_list_loads(self):
        response = self.client.get(reverse('routine:list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/list.html')

    def test_routine_builder_loads(self):
        response = self.client.get(reverse('routine:builder'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'routine/builder.html')


# Create your tests here.
