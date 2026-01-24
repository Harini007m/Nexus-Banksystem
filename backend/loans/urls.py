from django.urls import path
from .views import LoanListCreateView, LoanDetailView, respond_loan, repay_loan, pay_emi

urlpatterns = [
    path('', LoanListCreateView.as_view(), name='loan-list-create'),
    path('<int:pk>/', LoanDetailView.as_view(), name='loan-detail'),
    path('<int:pk>/respond/', respond_loan, name='respond-loan'),
    path('<int:pk>/repay/', repay_loan, name='repay-loan'),
    path('<int:pk>/pay-emi/', pay_emi, name='pay-emi'),
]
