from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import InvestmentPlan, UserInvestment
from .serializers import InvestmentPlanSerializer, UserInvestmentSerializer
from accounts.models import Account, Transaction
from decimal import Decimal

class InvestmentPlanListView(generics.ListCreateAPIView):
    queryset = InvestmentPlan.objects.all()
    serializer_class = InvestmentPlanSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN':
            raise permissions.PermissionDenied("Only admins can create investment plans")
        serializer.save()

class MyInvestmentsView(generics.ListAPIView):
    serializer_class = UserInvestmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'ADMIN':
            return UserInvestment.objects.all()
        return UserInvestment.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def invest(request):
    plan_id = request.data.get('plan_id')
    amount = request.data.get('amount')
    
    if not plan_id or not amount:
        return Response({'error': 'Plan ID and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        amount = Decimal(amount)
        plan = InvestmentPlan.objects.get(pk=plan_id)
    except (ValueError, InvestmentPlan.DoesNotExist):
        return Response({'error': 'Invalid plan or amount'}, status=status.HTTP_400_BAD_REQUEST)
        
    if amount < plan.min_amount:
         return Response({'error': f'Minimum investment amount is {plan.min_amount}'}, status=status.HTTP_400_BAD_REQUEST)
         
    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        
        if account.balance < amount:
            return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Deduct funds
        account.balance -= amount
        account.save()
        
        # Log transaction
        Transaction.objects.create(
            account=account,
            amount=amount,
            transaction_type='WITHDRAWAL', # Or custom type INVESTMENT
            status='SUCCESS',
            description=f"Investment in {plan.name}"
        )
        
        # Create Investment
        start_date = timezone.now().date()
        maturity_date = start_date + relativedelta(months=plan.duration_months)
        
        investment = UserInvestment.objects.create(
            user=request.user,
            plan=plan,
            amount=amount,
            maturity_date=maturity_date
        )
        
    return Response(UserInvestmentSerializer(investment).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mature_investment(request, pk):
    """Admin-only endpoint to mature an investment and credit returns."""
    if request.user.role != 'ADMIN':
        return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        investment = UserInvestment.objects.get(pk=pk)
    except UserInvestment.DoesNotExist:
        return Response({'error': 'Investment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if investment.status == 'COMPLETED':
        return Response({'error': 'Investment already matured'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate returns: Principal + (Principal * Rate * Years)
    principal = investment.amount
    rate = investment.plan.interest_rate / Decimal('100')  # Convert percentage to decimal
    years = Decimal(investment.plan.duration_months) / Decimal('12')
    interest = principal * rate * years
    total_return = principal + interest
    
    with transaction.atomic():
        investment.status = 'COMPLETED'
        investment.save()
        
        # Credit to user's account
        account, _ = Account.objects.get_or_create(user=investment.user)
        account.balance += total_return
        account.save()
        
        # Log transaction
        Transaction.objects.create(
            account=account,
            amount=total_return,
            transaction_type='DEPOSIT',
            status='SUCCESS',
            description=f"Investment Maturity: {investment.plan.name} (Principal: {principal}, Interest: {interest:.2f})"
        )
    
    return Response({
        'status': 'COMPLETED',
        'principal': str(principal),
        'interest': str(round(interest, 2)),
        'total_return': str(round(total_return, 2))
    })
