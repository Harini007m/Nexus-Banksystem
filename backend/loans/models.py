from django.db import models
from django.conf import settings
from decimal import Decimal

class Loan(models.Model):
    # Loan Status Workflow Stages
    DRAFT = 'DRAFT'
    SUBMITTED = 'SUBMITTED'
    APPLICATION_REVIEW = 'APPLICATION_REVIEW'
    APPLICATION_APPROVED = 'APPLICATION_APPROVED'
    APPLICATION_REJECTED = 'APPLICATION_REJECTED'
    CREDIT_REVIEW = 'CREDIT_REVIEW'
    CREDIT_APPROVED = 'CREDIT_APPROVED'
    CREDIT_REJECTED = 'CREDIT_REJECTED'
    LEGAL_REVIEW = 'LEGAL_REVIEW'
    LEGAL_APPROVED = 'LEGAL_APPROVED'
    LEGAL_REJECTED = 'LEGAL_REJECTED'
    FINAL_REVIEW = 'FINAL_REVIEW'
    APPROVED = 'APPROVED'
    REJECTED = 'REJECTED'
    DISBURSED = 'DISBURSED'
    PAID = 'PAID'
    
    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (SUBMITTED, 'Submitted'),
        (APPLICATION_REVIEW, 'Under Application Review'),
        (APPLICATION_APPROVED, 'Application Approved'),
        (APPLICATION_REJECTED, 'Application Rejected'),
        (CREDIT_REVIEW, 'Under Credit Review'),
        (CREDIT_APPROVED, 'Credit Approved'),
        (CREDIT_REJECTED, 'Credit Rejected'),
        (LEGAL_REVIEW, 'Under Legal Review'),
        (LEGAL_APPROVED, 'Legal Approved'),
        (LEGAL_REJECTED, 'Legal Rejected'),
        (FINAL_REVIEW, 'Final Review'),
        (APPROVED, 'Loan Approved'),
        (REJECTED, 'Loan Rejected'),
        (DISBURSED, 'Disbursed'),
        (PAID, 'Fully Paid'),
    ]

    # Loan Types
    PERSONAL = 'PERSONAL'
    HOME = 'HOME'
    VEHICLE = 'VEHICLE'
    BUSINESS = 'BUSINESS'
    EDUCATION = 'EDUCATION'
    
    LOAN_TYPE_CHOICES = [
        (PERSONAL, 'Personal Loan'),
        (HOME, 'Home Loan'),
        (VEHICLE, 'Vehicle Loan'),
        (BUSINESS, 'Business Loan'),
        (EDUCATION, 'Education Loan'),
    ]

    # Basic loan info
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    loan_type = models.CharField(max_length=20, choices=LOAN_TYPE_CHOICES, default=PERSONAL)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    purpose = models.TextField()
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default=DRAFT)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    disbursed_at = models.DateTimeField(null=True, blank=True)
    
    # EMI Fields
    duration_months = models.IntegerField(default=12)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('10.00'))
    monthly_emi = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    emis_paid = models.IntegerField(default=0)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    # KYC Documents (Application Officer checks these)
    pan_card = models.FileField(upload_to='loan_docs/pan/', null=True, blank=True)
    aadhaar_card = models.FileField(upload_to='loan_docs/aadhaar/', null=True, blank=True)
    bank_statements = models.FileField(upload_to='loan_docs/bank/', null=True, blank=True)
    salary_slips = models.FileField(upload_to='loan_docs/salary/', null=True, blank=True)
    employment_proof = models.FileField(upload_to='loan_docs/employment/', null=True, blank=True)
    
    # Application Review (by Application Officer)
    application_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='application_reviews'
    )
    kyc_verified = models.BooleanField(default=False)
    documents_complete = models.BooleanField(default=False)
    application_remarks = models.TextField(blank=True, null=True)
    application_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Credit Review (by Credit Officer)
    credit_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='credit_reviews'
    )
    cibil_score = models.IntegerField(null=True, blank=True)
    monthly_income = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    existing_emi = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    foir = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # Fixed Obligation to Income Ratio
    ltv = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)   # Loan to Value
    employment_verified = models.BooleanField(default=False)
    residence_verified = models.BooleanField(default=False)
    credit_remarks = models.TextField(blank=True, null=True)
    credit_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Legal Review (by Legal Officer)
    legal_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='legal_reviews'
    )
    property_value = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    title_verified = models.BooleanField(default=False)
    encumbrance_clear = models.BooleanField(default=False)
    legal_compliance = models.BooleanField(default=False)
    legal_documents = models.FileField(upload_to='loan_docs/legal/', null=True, blank=True)
    legal_remarks = models.TextField(blank=True, null=True)
    legal_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    # Final Approval (by Disbursement Manager)
    disbursement_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='disbursement_approvals'
    )
    sanction_letter = models.FileField(upload_to='loan_docs/sanction/', null=True, blank=True)
    loan_agreement = models.FileField(upload_to='loan_docs/agreement/', null=True, blank=True)
    final_remarks = models.TextField(blank=True, null=True)
    final_reviewed_at = models.DateTimeField(null=True, blank=True)
    
    @property
    def total_payable(self):
        if self.monthly_emi:
            return self.monthly_emi * self.duration_months
        return self.amount
    
    @property
    def remaining_emis(self):
        return self.duration_months - self.emis_paid
    
    @property
    def remaining_amount(self):
        if self.monthly_emi:
            return self.monthly_emi * self.remaining_emis
        return self.amount - self.amount_paid
    
    @property
    def current_stage(self):
        """Returns current workflow stage for UI display"""
        stage_map = {
            self.DRAFT: 0,
            self.SUBMITTED: 1,
            self.APPLICATION_REVIEW: 1,
            self.APPLICATION_APPROVED: 2,
            self.APPLICATION_REJECTED: -1,
            self.CREDIT_REVIEW: 2,
            self.CREDIT_APPROVED: 3,
            self.CREDIT_REJECTED: -1,
            self.LEGAL_REVIEW: 3,
            self.LEGAL_APPROVED: 4,
            self.LEGAL_REJECTED: -1,
            self.FINAL_REVIEW: 4,
            self.APPROVED: 5,
            self.REJECTED: -1,
            self.DISBURSED: 6,
            self.PAID: 7,
        }
        return stage_map.get(self.status, 0)
    
    @property
    def is_rejected(self):
        return self.status in [
            self.APPLICATION_REJECTED,
            self.CREDIT_REJECTED,
            self.LEGAL_REJECTED,
            self.REJECTED
        ]
    
    def calculate_emi(self):
        """Calculate EMI using simple interest formula"""
        principal = self.amount
        rate = self.interest_rate
        time_years = Decimal(self.duration_months) / Decimal('12')
        total_interest = principal * rate * time_years / Decimal('100')
        total_amount = principal + total_interest
        emi = total_amount / Decimal(self.duration_months)
        return round(emi, 2)
    
    def calculate_foir(self):
        """Calculate Fixed Obligation to Income Ratio"""
        if self.monthly_income and self.monthly_income > 0:
            proposed_emi = self.calculate_emi()
            total_obligations = self.existing_emi + proposed_emi
            return round((total_obligations / self.monthly_income) * 100, 2)
        return None
    
    def __str__(self):
        return f"Loan {self.id} - {self.user.email} - {self.get_status_display()}"
    
    class Meta:
        ordering = ['-applied_at']
