from django.test import TestCase
from django.urls import reverse


class StandaloneTimerTests(TestCase):
    def test_timer_page_loads(self):
        response = self.client.get(reverse('timer:standalone'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'timer/standaloneTimer.html')

    def test_timer_start(self):
        # Simulate starting the timer via POST (adjust endpoint as needed)
        response = self.client.post(
            reverse('timer:standalone_start'),
            {'duration': 60}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('started', response.json().get('status', ''))

    def test_timer_pause(self):
        # Simulate pausing the timer (adjust endpoint as needed)
        response = self.client.post(reverse('timer:standalone_pause'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('paused', response.json().get('status', ''))

    def test_timer_complete(self):
        # Simulate completing the timer (adjust endpoint as needed)
        response = self.client.post(reverse('timer:standalone_complete'))
        self.assertEqual(response.status_code, 200)
        self.assertIn('completed', response.json().get('status', ''))

