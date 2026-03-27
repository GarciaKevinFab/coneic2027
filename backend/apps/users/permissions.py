from rest_framework.permissions import BasePermission


class IsOrganizer(BasePermission):
    """
    Permission that checks if the authenticated user has an associated
    Participant record with a ParticipantType of 'organizer'.
    """

    message = "Solo los organizadores pueden realizar esta acción."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Staff and superusers always have organizer-level access
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Check if the user has a participant profile with organizer type
        try:
            participant = request.user.participant
            return (
                participant.participant_type is not None
                and participant.participant_type.name == "organizer"
            )
        except AttributeError:
            return False
