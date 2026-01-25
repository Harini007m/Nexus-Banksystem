from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom JWT login view that accepts email instead of username"""
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class PublicBankInfoView(APIView):
    """Public endpoint - no authentication required"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'bank_name': 'Nexus Bank',
            'tagline': 'Your Trusted Financial Partner',
            'established': 2020,
            'branches': 150,
            'customers': '1M+',
            'contact': {
                'email': 'support@nexusbank.com',
                'phone': '+91 1800-123-4567',
                'address': '123 Financial District, Mumbai, India'
            },
            'loan_types': [
                {
                    'type': 'PERSONAL',
                    'name': 'Personal Loan',
                    'description': 'Quick personal loans for your needs',
                    'interest_rate': '10.5% - 18%',
                    'max_amount': '₹25,00,000',
                    'tenure': '12 - 60 months'
                },
                {
                    'type': 'HOME',
                    'name': 'Home Loan',
                    'description': 'Make your dream home a reality',
                    'interest_rate': '8.5% - 10%',
                    'max_amount': '₹5,00,00,000',
                    'tenure': '12 - 360 months'
                },
                {
                    'type': 'VEHICLE',
                    'name': 'Vehicle Loan',
                    'description': 'Drive your dream car home',
                    'interest_rate': '9% - 12%',
                    'max_amount': '₹50,00,000',
                    'tenure': '12 - 84 months'
                },
                {
                    'type': 'BUSINESS',
                    'name': 'Business Loan',
                    'description': 'Fuel your business growth',
                    'interest_rate': '11% - 16%',
                    'max_amount': '₹2,00,00,000',
                    'tenure': '12 - 60 months'
                },
                {
                    'type': 'EDUCATION',
                    'name': 'Education Loan',
                    'description': 'Invest in your future',
                    'interest_rate': '8% - 11%',
                    'max_amount': '₹75,00,000',
                    'tenure': '12 - 180 months'
                }
            ],
            'loan_process': [
                {
                    'step': 1,
                    'title': 'Application Submission',
                    'description': 'Submit your loan application with required documents',
                    'officer': 'Customer Acquisition & Application Officer'
                },
                {
                    'step': 2,
                    'title': 'Credit Analysis',
                    'description': 'Our team verifies your credit score and financial details',
                    'officer': 'Credit, Risk & Verification Officer'
                },
                {
                    'step': 3,
                    'title': 'Legal Verification',
                    'description': 'Document verification and legal compliance check',
                    'officer': 'Technical & Legal Evaluation Officer'
                },
                {
                    'step': 4,
                    'title': 'Approval & Disbursement',
                    'description': 'Final approval and fund disbursement to your account',
                    'officer': 'Approval, Documentation & Disbursement Manager'
                }
            ],
            'required_documents': [
                'PAN Card',
                'Aadhaar Card',
                'Bank Statements (6 months)',
                'Salary Slips (3-6 months)',
                'Employment Proof'
            ],
            'eligibility': {
                'min_age': 21,
                'max_age': 60,
                'min_income': '₹25,000/month',
                'min_cibil': 650,
                'employment': 'Salaried or Self-employed'
            }
        })
