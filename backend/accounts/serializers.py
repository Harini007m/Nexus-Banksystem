from rest_framework import serializers
from .models import Account, Transaction

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'transaction_type', 'status', 'timestamp', 'description', 'related_account']

class AccountSerializer(serializers.ModelSerializer):
    transactions = TransactionSerializer(many=True, read_only=True)
    total_income = serializers.SerializerMethodField()
    total_expense = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['account_number', 'balance', 'transactions', 'total_income', 'total_expense']

    def get_total_income(self, obj):
        income = sum(t.amount for t in obj.transactions.filter(transaction_type='DEPOSIT', status='SUCCESS'))
        return income

    def get_total_expense(self, obj):
        expense = sum(t.amount for t in obj.transactions.filter(transaction_type__in=['WITHDRAWAL', 'TRANSFER'], status='SUCCESS'))
        return expense
