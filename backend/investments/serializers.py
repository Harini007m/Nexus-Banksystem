from rest_framework import serializers
from .models import InvestmentPlan, UserInvestment

class InvestmentPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentPlan
        fields = '__all__'

class UserInvestmentSerializer(serializers.ModelSerializer):
    plan_details = InvestmentPlanSerializer(source='plan', read_only=True)
    
    class Meta:
        model = UserInvestment
        fields = ['id', 'plan', 'plan_details', 'amount', 'start_date', 'maturity_date', 'status']
        read_only_fields = ['start_date', 'maturity_date', 'status']
