from django import forms


class TaskForm(forms.Form):
    task = forms.CharField(max_length=255)
    duration = forms.IntegerField(min_value=1, max_value=90,
                                  help_text='Duration in minutes'
                                  )
