from rest_framework import serializers
from .models import Loan

class LoanSerializer(serializers.ModelSerializer):
    remaining_emis = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    total_payable = serializers.ReadOnlyField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'amount', 'purpose', 'status', 'applied_at', 'approved_at',
            'duration_months', 'interest_rate', 'monthly_emi', 'emis_paid', 'amount_paid',
            'remaining_emis', 'remaining_amount', 'total_payable'
        ]
        read_only_fields = ['status', 'applied_at', 'approved_at', 'monthly_emi', 'emis_paid', 'amount_paid']
