from rest_framework import serializers
from .models import Loan
from django.contrib.auth import get_user_model

User = get_user_model()

class OfficerBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for officer info display"""
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role']

class LoanSerializer(serializers.ModelSerializer):
    """Full loan serializer for list/detail views"""
    remaining_emis = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    total_payable = serializers.ReadOnlyField()
    current_stage = serializers.ReadOnlyField()
    is_rejected = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    loan_type_display = serializers.CharField(source='get_loan_type_display', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    
    # Officer info
    application_officer_info = OfficerBasicSerializer(source='application_officer', read_only=True)
    credit_officer_info = OfficerBasicSerializer(source='credit_officer', read_only=True)
    legal_officer_info = OfficerBasicSerializer(source='legal_officer', read_only=True)
    disbursement_manager_info = OfficerBasicSerializer(source='disbursement_manager', read_only=True)
    
    class Meta:
        model = Loan
        fields = [
            'id', 'loan_type', 'loan_type_display', 'amount', 'purpose', 'status', 'status_display',
            'applied_at', 'submitted_at', 'approved_at', 'disbursed_at',
            'duration_months', 'interest_rate', 'monthly_emi', 'emis_paid', 'amount_paid',
            'remaining_emis', 'remaining_amount', 'total_payable', 'current_stage', 'is_rejected',
            'user_name', 'user_email',
            # Application review fields
            'kyc_verified', 'documents_complete', 'application_remarks', 'application_reviewed_at',
            'application_officer_info',
            # Credit review fields
            'cibil_score', 'monthly_income', 'existing_emi', 'foir', 'ltv',
            'employment_verified', 'residence_verified', 'credit_remarks', 'credit_reviewed_at',
            'credit_officer_info',
            # Legal review fields
            'property_value', 'title_verified', 'encumbrance_clear', 'legal_compliance',
            'legal_remarks', 'legal_reviewed_at', 'legal_officer_info',
            # Final review fields
            'final_remarks', 'final_reviewed_at', 'disbursement_manager_info',
        ]
        read_only_fields = [
            'status', 'applied_at', 'submitted_at', 'approved_at', 'disbursed_at',
            'monthly_emi', 'emis_paid', 'amount_paid',
            'application_officer', 'credit_officer', 'legal_officer', 'disbursement_manager',
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_user_email(self, obj):
        return obj.user.email


class LoanApplySerializer(serializers.ModelSerializer):
    """Serializer for customers to apply for loans"""
    class Meta:
        model = Loan
        fields = [
            'loan_type', 'amount', 'purpose', 'duration_months', 'interest_rate',
            'pan_card', 'aadhaar_card', 'bank_statements', 'salary_slips', 'employment_proof'
        ]


class ApplicationReviewSerializer(serializers.Serializer):
    """Serializer for Application Officer review"""
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'])
    kyc_verified = serializers.BooleanField(required=True)
    documents_complete = serializers.BooleanField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class CreditReviewSerializer(serializers.Serializer):
    """Serializer for Credit Officer review"""
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'])
    cibil_score = serializers.IntegerField(min_value=300, max_value=900)
    monthly_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    existing_emi = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    employment_verified = serializers.BooleanField(required=True)
    residence_verified = serializers.BooleanField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class LegalReviewSerializer(serializers.Serializer):
    """Serializer for Legal Officer review"""
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT'])
    property_value = serializers.DecimalField(max_digits=14, decimal_places=2, required=False)
    title_verified = serializers.BooleanField(required=True)
    encumbrance_clear = serializers.BooleanField(required=True)
    legal_compliance = serializers.BooleanField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)


class FinalReviewSerializer(serializers.Serializer):
    """Serializer for Disbursement Manager final review"""
    action = serializers.ChoiceField(choices=['APPROVE', 'REJECT', 'DISBURSE'])
    remarks = serializers.CharField(required=False, allow_blank=True)
