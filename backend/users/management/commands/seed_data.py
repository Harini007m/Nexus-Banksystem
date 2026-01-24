from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from investments.models import InvestmentPlan

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with initial data'

    def handle(self, *args, **kwargs):
        # Create Admin
        if not User.objects.filter(email='admin@nexus.com').exists():
            admin = User.objects.create_superuser(
                username='admin@nexus.com',
                email='admin@nexus.com',
                password='adminpassword123',
                first_name='Admin',
                last_name='User',
                role='ADMIN',
                is_verified=True
            )
            self.stdout.write(self.style.SUCCESS('Admin created: admin@nexus.com / adminpassword123'))
        
        # Create User
        if not User.objects.filter(email='user@nexus.com').exists():
            user = User.objects.create_user(
                username='user@nexus.com',
                email='user@nexus.com',
                password='userpassword123',
                first_name='John',
                last_name='Doe',
                role='USER',
                is_verified=True
            )
            self.stdout.write(self.style.SUCCESS('User created: user@nexus.com / userpassword123'))

        # Create Investment Plans
        if not InvestmentPlan.objects.exists():
            InvestmentPlan.objects.create(
                name='Gold Saver',
                description='Low risk, steady returns.',
                interest_rate=5.5,
                duration_months=12,
                min_amount=100
            )
            InvestmentPlan.objects.create(
                name='Platinum Growth',
                description='High risk, high reward.',
                interest_rate=12.0,
                duration_months=24,
                min_amount=1000
            )
            self.stdout.write(self.style.SUCCESS('Investment Plans created'))
