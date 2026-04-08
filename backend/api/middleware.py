from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt


class DisableCSRFMiddleware(MiddlewareMixin):
    """
    Disable CSRF for API endpoints during development
    """
    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.path.startswith('/api/'):
            setattr(view_func, 'csrf_exempt', True)
        return None
