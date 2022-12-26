from django.shortcuts import redirect
from django.views.generic import ListView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .models import Position

# Create your views here.
class PositionList(LoginRequiredMixin, ListView):
    model = Position
    def get_queryset(self):
        return Position.objects.filter(profile__user=self.request.user) | Position.objects.filter(profile__user=None)


class PositionDetail(UserPassesTestMixin, DetailView):
    model = Position
    permission_denied_message = "WTF are you doing?"

    def test_func(self):

        if (self.request.user.is_staff):
            return True

        if (self.get_object().profile is None):
            return True

        return self.request.user == self.get_object().profile.user

    def handle_no_permission(self):
        return redirect('position_list')
