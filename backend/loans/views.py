from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from .models import Loan
from .serializers import LoanSerializer
from accounts.models import Account, Transaction
from django.db import transaction

class LoanListCreateView(generics.ListCreateAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
             return Loan.objects.all()
        return Loan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LoanDetailView(generics.RetrieveAPIView):
    serializer_class = LoanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
             return Loan.objects.all()
        return Loan.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_loan(request, pk):
    """Admin approves/rejects loan and calculates EMI on approval."""
    if request.user.role != 'ADMIN':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
    loan = Loan.objects.filter(pk=pk).first()
    if not loan:
        return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
        
    action = request.data.get('action')
    
    if action == 'APPROVE':
        with transaction.atomic():
            loan.status = 'APPROVED'
            loan.approved_at = timezone.now()
            loan.monthly_emi = loan.calculate_emi()  # Calculate EMI
            loan.save()
            
            # Credit to Account
            account, _ = Account.objects.get_or_create(user=loan.user)
            account.balance += loan.amount
            account.save()
            
            Transaction.objects.create(
                account=account,
                amount=loan.amount,
                transaction_type='DEPOSIT',
                status='SUCCESS',
                description=f"Loan Disbursement: {loan.purpose}"
            )
            
    elif action == 'REJECT':
        loan.status = 'REJECTED'
        loan.save()
    else:
         return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
         
    return Response(LoanSerializer(loan).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def pay_emi(request, pk):
    """User pays one monthly EMI installment."""
    try:
        loan = Loan.objects.get(pk=pk, user=request.user)
    except Loan.DoesNotExist:
        return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if loan.status != 'APPROVED':
        return Response({'error': 'Only approved loans can be repaid'}, status=status.HTTP_400_BAD_REQUEST)
    
    if loan.remaining_emis <= 0:
        return Response({'error': 'All EMIs already paid'}, status=status.HTTP_400_BAD_REQUEST)
    
    emi_amount = loan.monthly_emi
    
    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        
        if account.balance < emi_amount:
            return Response({'error': f'Insufficient funds. EMI amount is ${emi_amount}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct EMI from account
        account.balance -= emi_amount
        account.save()
        
        # Update loan payment tracking
        loan.emis_paid += 1
        loan.amount_paid += emi_amount
        
        # Check if fully paid
        if loan.emis_paid >= loan.duration_months:
            loan.status = 'PAID'
        
        loan.save()
        
        # Log transaction
        Transaction.objects.create(
            account=account,
            amount=emi_amount,
            transaction_type='WITHDRAWAL',
            status='SUCCESS',
            description=f"Loan EMI Payment ({loan.emis_paid}/{loan.duration_months}): {loan.purpose}"
        )
    
    return Response({
        'message': f'EMI payment successful',
        'emi_paid': str(emi_amount),
        'emis_remaining': loan.remaining_emis,
        'amount_remaining': str(loan.remaining_amount),
        'status': loan.status
    })

# Keep the old repay_loan for full repayment option
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def repay_loan(request, pk):
    """User can fully repay their remaining loan balance at once."""
    try:
        loan = Loan.objects.get(pk=pk, user=request.user)
    except Loan.DoesNotExist:
        return Response({'error': 'Loan not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if loan.status != 'APPROVED':
        return Response({'error': 'Only approved loans can be repaid'}, status=status.HTTP_400_BAD_REQUEST)
    
    remaining = loan.remaining_amount
    
    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        
        if account.balance < remaining:
            return Response({'error': f'Insufficient funds. Remaining amount is ${remaining}'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Deduct remaining from account
        account.balance -= remaining
        account.save()
        
        # Mark loan as fully PAID
        loan.emis_paid = loan.duration_months
        loan.amount_paid += remaining
        loan.status = 'PAID'
        loan.save()
        
        # Log transaction
        Transaction.objects.create(
            account=account,
            amount=remaining,
            transaction_type='WITHDRAWAL',
            status='SUCCESS',
            description=f"Loan Full Repayment: {loan.purpose}"
        )
    
    return Response({'status': 'PAID', 'message': 'Loan fully repaid successfully', 'amount_paid': str(remaining)})
