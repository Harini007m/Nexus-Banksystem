from django.db import models
from django.conf import settings
import uuid

class Account(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='account')
    account_number = models.CharField(max_length=20, unique=True, editable=False)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.account_number:
            # Generate a simple unique account number (e.g., timestamp + user id part)
            # In production, use a more robust sequence
            self.account_number = str(uuid.uuid4().int)[:10]
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - {self.account_number}"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('DEPOSIT', 'Deposit'),
        ('WITHDRAWAL', 'Withdrawal'),
        ('TRANSFER', 'Transfer'),
    ]
    
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('PENDING', 'Pending'),
    ]

    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(max_length=15, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='SUCCESS')
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True, null=True)
    
    # For transfers
    related_account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True, related_name='related_transactions')

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} - {self.status}"
