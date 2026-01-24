from django.db import models
from django.conf import settings

class InvestmentPlan(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2) # Annual interest rate %
    duration_months = models.IntegerField()
    min_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.interest_rate}%"

class UserInvestment(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='investments')
    plan = models.ForeignKey(InvestmentPlan, on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField(auto_now_add=True)
    maturity_date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ACTIVE')

    def __str__(self):
        return f"{self.user.email} - {self.plan.name} - {self.amount}"
