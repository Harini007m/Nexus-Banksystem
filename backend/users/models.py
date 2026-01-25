from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Role choices - 4 officer roles + regular user
    USER = 'USER'
    APPLICATION_OFFICER = 'APPLICATION_OFFICER'
    CREDIT_OFFICER = 'CREDIT_OFFICER'
    LEGAL_OFFICER = 'LEGAL_OFFICER'
    DISBURSEMENT_MANAGER = 'DISBURSEMENT_MANAGER'
    
    ROLE_CHOICES = [
        (USER, 'Customer'),
        (APPLICATION_OFFICER, 'Customer Acquisition & Application Officer'),
        (CREDIT_OFFICER, 'Credit, Risk & Verification Officer'),
        (LEGAL_OFFICER, 'Technical & Legal Evaluation Officer'),
        (DISBURSEMENT_MANAGER, 'Approval, Documentation & Disbursement Manager'),
    ]
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=25, choices=ROLE_CHOICES, default=USER)
    is_verified = models.BooleanField(default=False)
    
    # Additional fields for officers
    employee_id = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    def __str__(self):
        return self.email
    
    @property
    def is_officer(self):
        return self.role in [
            self.APPLICATION_OFFICER,
            self.CREDIT_OFFICER,
            self.LEGAL_OFFICER,
            self.DISBURSEMENT_MANAGER
        ]
    
    @property
    def role_display(self):
        role_names = {
            self.USER: 'Customer',
            self.APPLICATION_OFFICER: 'Application Officer',
            self.CREDIT_OFFICER: 'Credit Officer',
            self.LEGAL_OFFICER: 'Legal Officer',
            self.DISBURSEMENT_MANAGER: 'Disbursement Manager',
        }
        return role_names.get(self.role, 'Unknown')
