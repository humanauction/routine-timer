from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from .models import Routine, RoutineItem, TimerState
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


class TimerTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='timeruser', email='timer@example.com', password='timerpass'
        )
        self.client.login(username='timeruser', password='timerpass')
        self.routine = Routine.objects.create(
            user=self.user, name='Test Routine'
        )
        self.timer = TimerState.objects.create(
            user=self.user,
            routine=self.routine,
            current_task_index=0,
            current_seconds=0,
            is_paused=True,
            start_time=timezone.now(),
            end_time=timezone.now()
        )

    def test_start_timer(self):
        response = self.client.post(reverse('routine:start', args=[self.timer.id]))
        self.timer.refresh_from_db()
        self.assertEqual(self.timer.status, 'running')

    def test_complete_timer(self):
        self.timer.status = 'running'
        self.timer.save()
        response = self.client.post(reverse('routine:complete', args=[self.timer.id]))
        self.timer.refresh_from_db()
        self.assertEqual(self.timer.status, 'complete')

    def test_timer_edge_case_negative_duration(self):
        from django.utils import timezone
        now = timezone.now()
        self.timer.start_time = now
        self.timer.end_time = now  # Explicitly same time
        self.timer.save()
    
    # Add debug in test
        print(f"Test: start_time={self.timer.start_time}, end_time={self.timer.end_time}")
        
        response = self.client.get(reverse('routine:timerstate_detail', args=[self.timer.id]))
        
        # Debug response content
        print(f"Response content: {response.content.decode()}")
        
        self.assertContains(response, "Invalid timer duration", status_code=200)

    def test_timer_view_access(self):
        response = self.client.get(reverse('routine:timerstate_detail', args=[self.timer.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Routine')
