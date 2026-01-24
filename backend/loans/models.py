from django.db import models
from django.conf import settings
from decimal import Decimal

class Loan(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('PAID', 'Paid'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    
    # EMI Fields
    duration_months = models.IntegerField(default=12)  # Loan tenure in months
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))  # Annual interest rate %
    monthly_emi = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    emis_paid = models.IntegerField(default=0)  # Number of EMIs paid
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    identity_proof = models.FileField(upload_to='loan_docs/', null=True, blank=True)
    
    @property
    def total_payable(self):
        """Total amount including interest"""
        if self.monthly_emi:
            return self.monthly_emi * self.duration_months
        return self.amount
    
    @property
    def remaining_emis(self):
        return self.duration_months - self.emis_paid
    
    @property
    def remaining_amount(self):
        if self.monthly_emi:
            return self.monthly_emi * self.remaining_emis
        return self.amount - self.amount_paid
    
    def calculate_emi(self):
        """Calculate EMI using simple interest formula"""
        # Simple Interest: Total = P + (P * R * T / 100)
        # EMI = Total / T
        principal = self.amount
        rate = self.interest_rate
        time_years = Decimal(self.duration_months) / Decimal('12')
        total_interest = principal * rate * time_years / Decimal('100')
        total_amount = principal + total_interest
        emi = total_amount / Decimal(self.duration_months)
        return round(emi, 2)
    
    def __str__(self):
        return f"Loan {self.id} - {self.user.email} - {self.status}"
