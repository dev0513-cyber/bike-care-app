from django.utils.deprecation import MiddlewareMixin
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


class DisableCSRFMiddleware(MiddlewareMixin):
    """
    Disable CSRF for API endpoints during development
    Allow CSRF-exempt for /api/ routes
    """
    def process_request(self, request):
        # Exempt all /api/ requests from CSRF validation
        if request.path.startswith('/api/'):
            # Add a dummy CSRF token to bypass CSRF check
            request.META['CSRF_COOKIE'] = 'null'
            setattr(request, '_dont_enforce_csrf_checks', True)
        return None


class CORSMiddleware(MiddlewareMixin):
    """
    Add CORS headers to responses
    """
    def process_response(self, request, response):
        # Allow requests from frontend
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
        response['Access-Control-Allow-Credentials'] = 'true'
        return response
