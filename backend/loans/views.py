from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.utils import timezone
from django.db import transaction
from decimal import Decimal

from .models import Loan
from .serializers import (
    LoanSerializer, LoanApplySerializer,
    ApplicationReviewSerializer, CreditReviewSerializer,
    LegalReviewSerializer, FinalReviewSerializer
)
from accounts.models import Account, Transaction


# ============== Customer Views ==============

class CustomerLoanListCreateView(generics.ListCreateAPIView):
    """Customer can view their loans and apply for new ones"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LoanApplySerializer
        return LoanSerializer
    
    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status=Loan.SUBMITTED, submitted_at=timezone.now())


class CustomerLoanDetailView(generics.RetrieveAPIView):
    """Customer can view details of their loan"""
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user)


# ============== Application Officer Views ==============

class ApplicationOfficerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'APPLICATION_OFFICER'


class ApplicationOfficerLoanListView(generics.ListAPIView):
    """Application Officer sees all submitted loans pending their review"""
    serializer_class = LoanSerializer
    permission_classes = [ApplicationOfficerPermission]
    
    def get_queryset(self):
        return Loan.objects.filter(status__in=[Loan.SUBMITTED, Loan.APPLICATION_REVIEW])


class ApplicationOfficerReviewView(APIView):
    """Application Officer reviews a loan application"""
    permission_classes = [ApplicationOfficerPermission]
    
    def post(self, request, pk):
        try:
            loan = Loan.objects.get(pk=pk, status__in=[Loan.SUBMITTED, Loan.APPLICATION_REVIEW])
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found or not in reviewable state'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ApplicationReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            loan.application_officer = request.user
            loan.kyc_verified = data['kyc_verified']
            loan.documents_complete = data['documents_complete']
            loan.application_remarks = data.get('remarks', '')
            loan.application_reviewed_at = timezone.now()
            
            if data['action'] == 'APPROVE':
                if not (data['kyc_verified'] and data['documents_complete']):
                    return Response({'error': 'Cannot approve without KYC and document verification'}, status=status.HTTP_400_BAD_REQUEST)
                loan.status = Loan.CREDIT_REVIEW  # Move to next stage
            else:
                loan.status = Loan.APPLICATION_REJECTED
            
            loan.save()
        
        return Response(LoanSerializer(loan).data)


# ============== Credit Officer Views ==============

class CreditOfficerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'CREDIT_OFFICER'


class CreditOfficerLoanListView(generics.ListAPIView):
    """Credit Officer sees loans pending credit review"""
    serializer_class = LoanSerializer
    permission_classes = [CreditOfficerPermission]
    
    def get_queryset(self):
        return Loan.objects.filter(status=Loan.CREDIT_REVIEW)


class CreditOfficerReviewView(APIView):
    """Credit Officer performs credit analysis"""
    permission_classes = [CreditOfficerPermission]
    
    def post(self, request, pk):
        try:
            loan = Loan.objects.get(pk=pk, status=Loan.CREDIT_REVIEW)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found or not in credit review state'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CreditReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            loan.credit_officer = request.user
            loan.cibil_score = data['cibil_score']
            loan.monthly_income = data['monthly_income']
            loan.existing_emi = data.get('existing_emi', Decimal('0'))
            loan.employment_verified = data['employment_verified']
            loan.residence_verified = data['residence_verified']
            loan.credit_remarks = data.get('remarks', '')
            loan.credit_reviewed_at = timezone.now()
            
            # Calculate FOIR
            loan.foir = loan.calculate_foir()
            
            if data['action'] == 'APPROVE':
                # Credit score check
                if data['cibil_score'] < 650:
                    return Response({'error': 'CIBIL score too low (minimum 650 required)'}, status=status.HTTP_400_BAD_REQUEST)
                # FOIR check (should be <= 50%)
                if loan.foir and loan.foir > 50:
                    return Response({'error': f'FOIR too high ({loan.foir}%). Maximum allowed is 50%'}, status=status.HTTP_400_BAD_REQUEST)
                
                loan.status = Loan.LEGAL_REVIEW  # Move to next stage
            else:
                loan.status = Loan.CREDIT_REJECTED
            
            loan.save()
        
        return Response(LoanSerializer(loan).data)


# ============== Legal Officer Views ==============

class LegalOfficerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'LEGAL_OFFICER'


class LegalOfficerLoanListView(generics.ListAPIView):
    """Legal Officer sees loans pending legal review"""
    serializer_class = LoanSerializer
    permission_classes = [LegalOfficerPermission]
    
    def get_queryset(self):
        return Loan.objects.filter(status=Loan.LEGAL_REVIEW)


class LegalOfficerReviewView(APIView):
    """Legal Officer performs legal verification"""
    permission_classes = [LegalOfficerPermission]
    
    def post(self, request, pk):
        try:
            loan = Loan.objects.get(pk=pk, status=Loan.LEGAL_REVIEW)
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found or not in legal review state'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = LegalReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            loan.legal_officer = request.user
            loan.property_value = data.get('property_value')
            loan.title_verified = data['title_verified']
            loan.encumbrance_clear = data['encumbrance_clear']
            loan.legal_compliance = data['legal_compliance']
            loan.legal_remarks = data.get('remarks', '')
            loan.legal_reviewed_at = timezone.now()
            
            # Calculate LTV if property value provided
            if loan.property_value and loan.property_value > 0:
                loan.ltv = round((loan.amount / loan.property_value) * 100, 2)
            
            if data['action'] == 'APPROVE':
                if not all([data['title_verified'], data['encumbrance_clear'], data['legal_compliance']]):
                    return Response({'error': 'All legal checks must pass for approval'}, status=status.HTTP_400_BAD_REQUEST)
                loan.status = Loan.FINAL_REVIEW  # Move to final stage
            else:
                loan.status = Loan.LEGAL_REJECTED
            
            loan.save()
        
        return Response(LoanSerializer(loan).data)


# ============== Disbursement Manager Views ==============

class DisbursementManagerPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DISBURSEMENT_MANAGER'


class DisbursementManagerLoanListView(generics.ListAPIView):
    """Disbursement Manager sees loans pending final approval or disbursement"""
    serializer_class = LoanSerializer
    permission_classes = [DisbursementManagerPermission]
    
    def get_queryset(self):
        return Loan.objects.filter(status__in=[Loan.FINAL_REVIEW, Loan.APPROVED])


class DisbursementManagerReviewView(APIView):
    """Disbursement Manager performs final approval and disbursement"""
    permission_classes = [DisbursementManagerPermission]
    
    def post(self, request, pk):
        try:
            loan = Loan.objects.get(pk=pk, status__in=[Loan.FINAL_REVIEW, Loan.APPROVED])
        except Loan.DoesNotExist:
            return Response({'error': 'Loan not found or not in final review state'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = FinalReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        with transaction.atomic():
            loan.disbursement_manager = request.user
            loan.final_remarks = data.get('remarks', '')
            loan.final_reviewed_at = timezone.now()
            
            if data['action'] == 'APPROVE':
                loan.status = Loan.APPROVED
                loan.approved_at = timezone.now()
                loan.monthly_emi = loan.calculate_emi()  # Calculate EMI
                
            elif data['action'] == 'DISBURSE':
                if loan.status != Loan.APPROVED:
                    return Response({'error': 'Loan must be approved before disbursement'}, status=status.HTTP_400_BAD_REQUEST)
                
                loan.status = Loan.DISBURSED
                loan.disbursed_at = timezone.now()
                
                # Credit amount to customer's account
                account, _ = Account.objects.get_or_create(user=loan.user)
                account.balance += loan.amount
                account.save()
                
                Transaction.objects.create(
                    account=account,
                    amount=loan.amount,
                    transaction_type='DEPOSIT',
                    status='SUCCESS',
                    description=f"Loan Disbursement: {loan.get_loan_type_display()} - {loan.purpose[:50]}"
                )
                
            else:  # REJECT
                loan.status = Loan.REJECTED
            
            loan.save()
        
        return Response(LoanSerializer(loan).data)


# ============== EMI Payment Views (for customers) ==============

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pay_emi(request, pk):
    """Customer pays one monthly EMI installment"""
    try:
        loan = Loan.objects.get(pk=pk, user=request.user, status=Loan.DISBURSED)
    except Loan.DoesNotExist:
        return Response({'error': 'Loan not found or not disbursed'}, status=status.HTTP_404_NOT_FOUND)
    
    if loan.remaining_emis <= 0:
        return Response({'error': 'All EMIs already paid'}, status=status.HTTP_400_BAD_REQUEST)
    
    emi_amount = loan.monthly_emi
    
    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        
        if account.balance < emi_amount:
            return Response({'error': f'Insufficient funds. EMI amount is ₹{emi_amount}'}, status=status.HTTP_400_BAD_REQUEST)
        
        account.balance -= emi_amount
        account.save()
        
        loan.emis_paid += 1
        loan.amount_paid += emi_amount
        
        if loan.emis_paid >= loan.duration_months:
            loan.status = Loan.PAID
        
        loan.save()
        
        Transaction.objects.create(
            account=account,
            amount=emi_amount,
            transaction_type='WITHDRAWAL',
            status='SUCCESS',
            description=f"Loan EMI Payment ({loan.emis_paid}/{loan.duration_months}): {loan.purpose[:30]}"
        )
    
    return Response({
        'message': 'EMI payment successful',
        'emi_paid': str(emi_amount),
        'emis_remaining': loan.remaining_emis,
        'amount_remaining': str(loan.remaining_amount),
        'status': loan.status
    })


# ============== All Loans View (for any authenticated officer) ==============

class AllLoansView(generics.ListAPIView):
    """View all loans (for officers to see overall status)"""
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'USER':
            return Loan.objects.filter(user=user)
        else:
            # Officers can see all loans
            return Loan.objects.all()
