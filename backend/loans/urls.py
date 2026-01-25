from django.urls import path
from .views import (
    # Customer views
    CustomerLoanListCreateView, CustomerLoanDetailView, pay_emi,
    # Application Officer views
    ApplicationOfficerLoanListView, ApplicationOfficerReviewView,
    # Credit Officer views
    CreditOfficerLoanListView, CreditOfficerReviewView,
    # Legal Officer views
    LegalOfficerLoanListView, LegalOfficerReviewView,
    # Disbursement Manager views
    DisbursementManagerLoanListView, DisbursementManagerReviewView,
    # General
    AllLoansView,
)

urlpatterns = [
    # Customer endpoints
    path('', CustomerLoanListCreateView.as_view(), name='customer-loan-list-create'),
    path('<int:pk>/', CustomerLoanDetailView.as_view(), name='customer-loan-detail'),
    path('<int:pk>/pay-emi/', pay_emi, name='pay-emi'),
    
    # Application Officer endpoints
    path('officer/application/', ApplicationOfficerLoanListView.as_view(), name='application-officer-list'),
    path('officer/application/<int:pk>/review/', ApplicationOfficerReviewView.as_view(), name='application-officer-review'),
    
    # Credit Officer endpoints
    path('officer/credit/', CreditOfficerLoanListView.as_view(), name='credit-officer-list'),
    path('officer/credit/<int:pk>/review/', CreditOfficerReviewView.as_view(), name='credit-officer-review'),
    
    # Legal Officer endpoints
    path('officer/legal/', LegalOfficerLoanListView.as_view(), name='legal-officer-list'),
    path('officer/legal/<int:pk>/review/', LegalOfficerReviewView.as_view(), name='legal-officer-review'),
    
    # Disbursement Manager endpoints
    path('officer/disbursement/', DisbursementManagerLoanListView.as_view(), name='disbursement-manager-list'),
    path('officer/disbursement/<int:pk>/review/', DisbursementManagerReviewView.as_view(), name='disbursement-manager-review'),
    
    # All loans (role-based filtering)
    path('all/', AllLoansView.as_view(), name='all-loans'),
]
