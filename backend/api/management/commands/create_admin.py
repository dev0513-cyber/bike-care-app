from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import UserProfile


class Command(BaseCommand):
    help = 'Create an admin user for the BikeCare admin panel'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--password', type=str, help='Admin password')
        parser.add_argument('--first-name', type=str, help='Admin first name')
        parser.add_argument('--last-name', type=str, help='Admin last name')

    def handle(self, *args, **options):
        email = options.get('email') or 'admin@bikecare.com'
        password = options.get('password') or 'admin123'
        first_name = options.get('first_name') or 'Admin'
        last_name = options.get('last_name') or 'User'

        # Check if admin user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Admin user with email {email} already exists.')
            )
            return

        # Create admin user
        admin_user = User.objects.create_user(
            username=email,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            is_staff=True,
            is_superuser=True
        )

        # Set admin role in profile
        profile = admin_user.profile
        profile.role = 'admin'
        profile.save()

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created admin user:\n'
                f'Email: {email}\n'
                f'Password: {password}\n'
                f'Role: {profile.get_role_display()}'
            )
        )
