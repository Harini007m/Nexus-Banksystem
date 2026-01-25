from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from investments.models import InvestmentPlan

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with initial data including officer accounts'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.NOTICE('Seeding database...'))
        
        # Create regular user (customer)
        if not User.objects.filter(email='user@nexus.com').exists():
            User.objects.create_user(
                username='user@nexus.com',
                email='user@nexus.com',
                password='userpassword123',
                first_name='John',
                last_name='Doe',
                role='USER',
                is_verified=True
            )
            self.stdout.write(self.style.SUCCESS('[OK] Customer created: user@nexus.com / userpassword123'))
        else:
            self.stdout.write('  Customer already exists: user@nexus.com')
        
        # Create Application Officer
        if not User.objects.filter(email='application.officer@nexus.com').exists():
            User.objects.create_user(
                username='application.officer@nexus.com',
                email='application.officer@nexus.com',
                password='officer123',
                first_name='Priya',
                last_name='Sharma',
                role='APPLICATION_OFFICER',
                is_verified=True,
                employee_id='NXS-AO-001',
                department='Customer Acquisition'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Application Officer created: application.officer@nexus.com / officer123'))
        else:
            self.stdout.write('  Application Officer already exists')
        
        # Create Credit Officer
        if not User.objects.filter(email='credit.officer@nexus.com').exists():
            User.objects.create_user(
                username='credit.officer@nexus.com',
                email='credit.officer@nexus.com',
                password='officer123',
                first_name='Rajesh',
                last_name='Kumar',
                role='CREDIT_OFFICER',
                is_verified=True,
                employee_id='NXS-CO-001',
                department='Credit & Risk'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Credit Officer created: credit.officer@nexus.com / officer123'))
        else:
            self.stdout.write('  Credit Officer already exists')
        
        # Create Legal Officer
        if not User.objects.filter(email='legal.officer@nexus.com').exists():
            User.objects.create_user(
                username='legal.officer@nexus.com',
                email='legal.officer@nexus.com',
                password='officer123',
                first_name='Anita',
                last_name='Verma',
                role='LEGAL_OFFICER',
                is_verified=True,
                employee_id='NXS-LO-001',
                department='Legal & Compliance'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Legal Officer created: legal.officer@nexus.com / officer123'))
        else:
            self.stdout.write('  Legal Officer already exists')
        
        # Create Disbursement Manager
        if not User.objects.filter(email='disbursement.manager@nexus.com').exists():
            User.objects.create_user(
                username='disbursement.manager@nexus.com',
                email='disbursement.manager@nexus.com',
                password='officer123',
                first_name='Suresh',
                last_name='Patel',
                role='DISBURSEMENT_MANAGER',
                is_verified=True,
                employee_id='NXS-DM-001',
                department='Disbursement'
            )
            self.stdout.write(self.style.SUCCESS('[OK] Disbursement Manager created: disbursement.manager@nexus.com / officer123'))
        else:
            self.stdout.write('  Disbursement Manager already exists')

        # Create Investment Plans
        if not InvestmentPlan.objects.exists():
            InvestmentPlan.objects.create(
                name='Gold Saver',
                description='Low risk, steady returns. Ideal for conservative investors.',
                interest_rate=5.5,
                duration_months=12,
                min_amount=100
            )
            InvestmentPlan.objects.create(
                name='Platinum Growth',
                description='Balanced risk-reward. Good for medium-term goals.',
                interest_rate=8.0,
                duration_months=24,
                min_amount=500
            )
            InvestmentPlan.objects.create(
                name='Diamond Elite',
                description='High growth potential. Best for long-term investors.',
                interest_rate=12.0,
                duration_months=36,
                min_amount=1000
            )
            self.stdout.write(self.style.SUCCESS('[OK] Investment Plans created'))
        else:
            self.stdout.write('  Investment Plans already exist')

        self.stdout.write(self.style.SUCCESS('\n=== Database seeding complete! ===\n'))
        
        self.stdout.write(self.style.NOTICE('=== LOGIN CREDENTIALS ==='))
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Customer:'))
        self.stdout.write('  Email: user@nexus.com')
        self.stdout.write('  Password: userpassword123')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Application Officer:'))
        self.stdout.write('  Email: application.officer@nexus.com')
        self.stdout.write('  Password: officer123')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Credit Officer:'))
        self.stdout.write('  Email: credit.officer@nexus.com')
        self.stdout.write('  Password: officer123')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Legal Officer:'))
        self.stdout.write('  Email: legal.officer@nexus.com')
        self.stdout.write('  Password: officer123')
        self.stdout.write('')
        self.stdout.write(self.style.WARNING('Disbursement Manager:'))
        self.stdout.write('  Email: disbursement.manager@nexus.com')
        self.stdout.write('  Password: officer123')
        self.stdout.write('')

