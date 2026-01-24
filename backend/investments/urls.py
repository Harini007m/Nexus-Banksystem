from django.urls import path
from .views import InvestmentPlanListView, MyInvestmentsView, invest, mature_investment

urlpatterns = [
    path('plans/', InvestmentPlanListView.as_view(), name='investment-plans'),
    path('my-investments/', MyInvestmentsView.as_view(), name='my-investments'),
    path('invest/', invest, name='invest'),
    path('<int:pk>/mature/', mature_investment, name='mature-investment'),
]
