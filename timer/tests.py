from django.test import TestCase
from django.urls import reverse
from routine.models import Routine, Timer
from authentication.models import CustomUser

class TimerTests(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username='timeruser', email='timer@example.com', password='timerpass'
        )
        self.client.login(username='timeruser', password='timerpass')
        self.routine = Routine.objects.create(
            user=self.user, title='Test Routine', total_duration=20, status='draft'
        )
        self.timer = Timer.objects.create(
            routine=self.routine, start_time=None, end_time=None, status='pending'
        )

    def test_start_timer(self):
        response = self.client.post(reverse('timer:start', args=[self.timer.id]))
        self.timer.refresh_from_db()
        self.assertEqual(self.timer.status, 'running')

    def test_complete_timer(self):
        self.timer.status = 'running'
        self.timer.save()
        response = self.client.post(reverse('timer:complete', args=[self.timer.id]))
        self.timer.refresh_from_db()
        self.assertEqual(self.timer.status, 'complete')

    def test_timer_edge_case_negative_duration(self):
        self.timer.end_time = self.timer.start_time
        self.timer.save()
        response = self.client.get(reverse('timer:detail', args=[self.timer.id]))
        self.assertContains(response, "Invalid timer duration", status_code=200)

    def test_timer_view_access(self):
        response = self.client.get(reverse('timer:detail', args=[self.timer.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Routine')
