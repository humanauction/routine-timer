from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    message = forms.CharField(
        max_length=1000, widget=forms.Textarea, required=True
        )

    def clean(self):
        cleaned_data = super().clean()
        # Add any additional validation here
        return cleaned_data
