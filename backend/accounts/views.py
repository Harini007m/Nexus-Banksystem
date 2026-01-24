from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Account, Transaction
from .serializers import AccountSerializer, TransactionSerializer
from decimal import Decimal

class AccountBalanceView(generics.RetrieveAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Ensure account exists for the user
        account, created = Account.objects.get_or_create(user=self.request.user)
        return account

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def deposit(request):
    amount = request.data.get('amount')
    description = request.data.get('description', 'Deposit')
    
    if not amount:
        return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError
    except:
        return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        account.balance += amount
        account.save()
        
        Transaction.objects.create(
            account=account,
            amount=amount,
            transaction_type='DEPOSIT',
            status='SUCCESS',
            description=description
        )
        
    return Response({'message': 'Deposit successful', 'new_balance': account.balance})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def withdraw(request):
    amount = request.data.get('amount')
    description = request.data.get('description', 'Withdrawal')
    
    if not amount:
        return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError
    except:
        return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        account, _ = Account.objects.get_or_create(user=request.user)
        
        if account.balance < amount:
            return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)
        
        account.balance -= amount
        account.save()
        
        Transaction.objects.create(
            account=account,
            amount=amount,
            transaction_type='WITHDRAWAL',
            status='SUCCESS',
            description=description
        )
        
    return Response({'message': 'Withdrawal successful', 'new_balance': account.balance})

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def transfer(request):
    recipient_account_number = request.data.get('recipient_account_number')
    amount = request.data.get('amount')
    description = request.data.get('description', 'Transfer')
    
    if not recipient_account_number or not amount:
        return Response({'error': 'Recipient account and amount are required'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        amount = Decimal(amount)
        if amount <= 0:
            raise ValueError
    except:
        return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        sender_account, _ = Account.objects.get_or_create(user=request.user)
        
        if sender_account.balance < amount:
            return Response({'error': 'Insufficient funds'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            recipient_account = Account.objects.get(account_number=recipient_account_number)
        except Account.DoesNotExist:
            return Response({'error': 'Recipient account not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if sender_account == recipient_account:
            return Response({'error': 'Cannot transfer to self'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Perform transfer
        sender_account.balance -= amount
        sender_account.save()
        
        recipient_account.balance += amount
        recipient_account.save()
        
        # Log for sender
        Transaction.objects.create(
            account=sender_account,
            amount=amount,
            transaction_type='TRANSFER',
            status='SUCCESS',
            description=f"Transfer to {recipient_account.account_number}: {description}",
            related_account=recipient_account
        )
        
        # Log for recipient
        Transaction.objects.create(
            account=recipient_account,
            amount=amount,
            transaction_type='DEPOSIT', # Technically a transfer in, but adds funds
            status='SUCCESS',
            description=f"Transfer from {sender_account.account_number}: {description}",
            related_account=sender_account
        )
        
    return Response({'message': 'Transfer successful', 'new_balance': sender_account.balance})
