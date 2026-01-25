import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import {
    FiPlus, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiCreditCard,
    FiFileText, FiAlertTriangle, FiShield, FiPercent, FiInfo, FiCheck,
    FiUpload, FiChevronRight, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Loans = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [accountData, setAccountData] = useState(null);

    // Form state
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [durationMonths, setDurationMonths] = useState('12');
    const [interestRate, setInterestRate] = useState('10');
    const [monthlyIncome, setMonthlyIncome] = useState('');

    // Document checklist state
    const [documents, setDocuments] = useState({
        panCard: false,
        aadhaar: false,
        bankStatements: false,
        salarySlips: false,
        employmentProof: false
    });

    // Terms acceptance
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [autoDebit, setAutoDebit] = useState(false);

    // Simulated credit score (in real app, this would come from backend)
    const creditScore = 750 + Math.floor(Math.random() * 100);
    const getCreditScoreStatus = () => {
        if (creditScore >= 750) return { status: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20' };
        if (creditScore >= 650) return { status: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { status: 'Fair', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const fetchLoans = async () => {
        try {
            const response = await api.get('/loans/');
            setLoans(response.data);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        }
    };

    const fetchAccountData = async () => {
        try {
            const response = await api.get('/accounts/balance/');
            setAccountData(response.data);
        } catch (error) {
            console.error("Failed to fetch account data", error);
        }
    };

    useEffect(() => {
        fetchLoans();
        fetchAccountData();
    }, []);

    // Calculate EMI
    const calculateEmi = () => {
        if (!amount || !interestRate || !durationMonths) return 0;
        const principal = parseFloat(amount);
        const rate = parseFloat(interestRate) / 100;
        const months = parseInt(durationMonths);
        const total = principal * (1 + rate * (months / 12));
        return (total / months).toFixed(2);
    };

    const calculateTotalPayable = () => {
        if (!amount || !interestRate || !durationMonths) return 0;
        const principal = parseFloat(amount);
        const rate = parseFloat(interestRate) / 100;
        const months = parseInt(durationMonths);
        return (principal * (1 + rate * (months / 12))).toFixed(2);
    };

    // Check EMI affordability (should be <= 40-50% of monthly income)
    const getAffordabilityStatus = () => {
        if (!monthlyIncome || !amount) return null;
        const emi = parseFloat(calculateEmi());
        const income = parseFloat(monthlyIncome);
        const ratio = (emi / income) * 100;

        if (ratio <= 30) return { status: 'Safe', color: 'text-green-400', message: 'EMI is well within your budget', icon: <FiCheckCircle /> };
        if (ratio <= 40) return { status: 'Good', color: 'text-yellow-400', message: 'EMI is manageable', icon: <FiCheck /> };
        if (ratio <= 50) return { status: 'Caution', color: 'text-orange-400', message: 'EMI is at the upper limit', icon: <FiAlertTriangle /> };
        return { status: 'Risk', color: 'text-red-400', message: 'EMI exceeds recommended limit (50%)', icon: <FiXCircle /> };
    };

    // Check if all required documents are checked
    const allDocumentsChecked = Object.values(documents).every(Boolean);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!acceptedTerms) {
            alert('Please accept the terms and conditions');
            return;
        }
        try {
            await api.post('/loans/', {
                amount,
                purpose,
                duration_months: parseInt(durationMonths),
                interest_rate: parseFloat(interestRate),
                identity_proof: null
            });
            setShowModal(false);
            resetForm();
            fetchLoans();
            alert('🎉 Loan application submitted successfully! You will be notified once it is reviewed.');
        } catch (error) {
            alert('Failed to apply for loan: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const resetForm = () => {
        setAmount('');
        setPurpose('');
        setDurationMonths('12');
        setInterestRate('10');
        setMonthlyIncome('');
        setDocuments({ panCard: false, aadhaar: false, bankStatements: false, salarySlips: false, employmentProof: false });
        setAcceptedTerms(false);
        setAutoDebit(false);
        setCurrentStep(1);
    };

    const handleAction = async (id, action) => {
        try {
            await api.post(`/loans/${id}/respond/`, { action });
            fetchLoans();
        } catch (error) {
            alert(`Failed to ${action} loan`);
        }
    };

    const handlePayEmi = async (loanId, emiAmount) => {
        if (!confirm(`Pay monthly EMI of $${parseFloat(emiAmount).toFixed(2)}? This will be deducted from your balance.`)) {
            return;
        }
        try {
            const response = await api.post(`/loans/${loanId}/pay-emi/`);
            alert(`✅ EMI paid successfully! Remaining EMIs: ${response.data.emis_remaining}`);
            fetchLoans();
            fetchAccountData();
        } catch (error) {
            alert('Failed to pay EMI: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const handleFullRepay = async (loanId, remainingAmount) => {
        if (!confirm(`Pay full remaining amount of $${parseFloat(remainingAmount).toFixed(2)}? This will close your loan.`)) {
            return;
        }
        try {
            await api.post(`/loans/${loanId}/repay/`);
            alert('✅ Loan fully repaid successfully!');
            fetchLoans();
            fetchAccountData();
        } catch (error) {
            alert('Failed to repay loan: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <FiCheckCircle />;
            case 'REJECTED': return <FiXCircle />;
            case 'PAID': return <FiDollarSign />;
            default: return <FiClock />;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-500/20 text-green-400';
            case 'REJECTED': return 'bg-red-500/20 text-red-400';
            case 'PAID': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    const pendingLoansCount = loans.filter(l => l.status === 'PENDING').length;

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Loans</h1>
                    <p className="text-slate-400">Manage your loan applications and EMI payments.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowGuideModal(true)}
                        className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 px-4 py-3 rounded-xl font-medium transition-all border border-slate-600/50"
                    >
                        <FiInfo /> Loan Guide
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <FiPlus /> Apply New Loan
                    </button>
                </div>
            </div>

            {/* Credit Score & Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Credit Score Card */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Credit Score</h3>
                        <FiShield className={getCreditScoreStatus().color} />
                    </div>
                    <div className="flex items-end gap-3">
                        <span className={`text-4xl font-bold ${getCreditScoreStatus().color}`}>{creditScore}</span>
                        <span className={`text-sm px-2 py-1 rounded-lg ${getCreditScoreStatus().bg} ${getCreditScoreStatus().color}`}>
                            {getCreditScoreStatus().status}
                        </span>
                    </div>
                    <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full"
                            style={{ width: `${((creditScore - 300) / 550) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Score range: 300 - 850</p>
                </div>

                {/* Active Loans */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Active Loans</h3>
                        <FiFileText className="text-blue-400" />
                    </div>
                    <span className="text-4xl font-bold text-white">
                        {loans.filter(l => l.status === 'APPROVED').length}
                    </span>
                    {pendingLoansCount > 0 && (
                        <p className="text-yellow-400 text-sm mt-2">
                            <FiClock className="inline mr-1" />
                            {pendingLoansCount} pending approval
                        </p>
                    )}
                </div>

                {/* Total Outstanding */}
                <div className="glass-panel p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">Total Outstanding</h3>
                        <FiDollarSign className="text-yellow-400" />
                    </div>
                    <span className="text-4xl font-bold text-white">
                        ${loans.filter(l => l.status === 'APPROVED')
                            .reduce((sum, l) => sum + parseFloat(l.remaining_amount || 0), 0)
                            .toLocaleString()}
                    </span>
                    <p className="text-slate-500 text-sm mt-2">Across all active loans</p>
                </div>
            </div>

            {/* Loans Grid */}
            <h2 className="text-xl font-semibold text-white mb-4">Your Loans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.map((loan) => (
                    <div key={loan.id} className="glass-panel p-6 relative overflow-hidden">
                        {/* Status Badge */}
                        <div className="absolute top-0 right-0">
                            <span className={`py-1 px-3 rounded-bl-lg text-xs font-medium ${getStatusStyle(loan.status)}`}>
                                {loan.status}
                            </span>
                        </div>

                        {/* Loan Amount & Purpose */}
                        <div className="mb-4 pt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`p-2 rounded-lg ${getStatusStyle(loan.status)}`}>
                                    {getStatusIcon(loan.status)}
                                </span>
                                <h3 className="text-2xl font-bold text-white">${parseFloat(loan.amount).toLocaleString()}</h3>
                            </div>
                            <p className="text-sm text-slate-400 truncate">{loan.purpose}</p>
                        </div>

                        {/* EMI Details - Show for approved loans */}
                        {loan.status === 'APPROVED' && loan.monthly_emi && (
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Monthly EMI</span>
                                    <span className="text-white font-semibold">${parseFloat(loan.monthly_emi).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">EMIs Paid</span>
                                    <span className="text-green-400">{loan.emis_paid} / {loan.duration_months}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Remaining</span>
                                    <span className="text-yellow-400">${parseFloat(loan.remaining_amount).toFixed(2)}</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(loan.emis_paid / loan.duration_months) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Loan Info */}
                        <div className="text-xs text-slate-500 flex justify-between border-t border-slate-700/50 pt-4">
                            <span>Applied: {new Date(loan.applied_at).toLocaleDateString()}</span>
                            {loan.interest_rate && <span>{loan.interest_rate}% Interest</span>}
                        </div>

                        {/* Admin: Approve/Reject for PENDING loans */}
                        {user?.role === 'ADMIN' && loan.status === 'PENDING' && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={() => handleAction(loan.id, 'APPROVE')}
                                    className="bg-green-600/20 hover:bg-green-600/40 text-green-400 py-2 rounded-lg text-sm transition-colors font-medium"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(loan.id, 'REJECT')}
                                    className="bg-red-600/20 hover:bg-red-600/40 text-red-400 py-2 rounded-lg text-sm transition-colors font-medium"
                                >
                                    Reject
                                </button>
                            </div>
                        )}

                        {/* User: Pay EMI / Full Repay for APPROVED loans */}
                        {user?.role !== 'ADMIN' && loan.status === 'APPROVED' && loan.remaining_emis > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                <button
                                    onClick={() => handlePayEmi(loan.id, loan.monthly_emi)}
                                    className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/50 hover:to-cyan-600/50 text-blue-400 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-1 font-medium"
                                >
                                    <FiCreditCard /> Pay EMI
                                </button>
                                <button
                                    onClick={() => handleFullRepay(loan.id, loan.remaining_amount)}
                                    className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 font-medium"
                                >
                                    <FiDollarSign /> Pay Full
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {loans.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <FiFileText className="text-5xl text-slate-600 mx-auto mb-4" />
                        <div className="text-slate-500 text-lg">No loans found</div>
                        <p className="text-slate-600 text-sm mt-2">Click "Apply New Loan" to get started</p>
                    </div>
                )}
            </div>

            {/* Loan Guide Modal */}
            {showGuideModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800/95 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">📋 First-Time Loan Guide</h2>
                                <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white">
                                    <FiXCircle className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Step 1 */}
                            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</span>
                                    <h3 className="text-lg font-semibold text-white">Pre-Application Preparation</h3>
                                </div>
                                <ul className="space-y-2 text-slate-300 text-sm ml-11">
                                    <li className="flex items-start gap-2">
                                        <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                                        <span><strong>Check Credit Score:</strong> Ensure your score is 750+ for best rates</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                                        <span><strong>Evaluate Needs:</strong> Determine exact amount needed</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiCheck className="text-green-400 mt-1 flex-shrink-0" />
                                        <span><strong>Compare Lenders:</strong> Research for best interest rates</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">2</span>
                                    <h3 className="text-lg font-semibold text-white">Required Documents</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">KYC Documents</p>
                                        <p className="text-slate-200 text-sm">PAN Card, Aadhaar Card</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Income Proof</p>
                                        <p className="text-slate-200 text-sm">Salary Slips (3-6 months)</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Bank Statements</p>
                                        <p className="text-slate-200 text-sm">Last 6 months</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg">
                                        <p className="text-slate-400 text-xs mb-1">Employment</p>
                                        <p className="text-slate-200 text-sm">ID Card, Appointment Letter</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold">3</span>
                                    <h3 className="text-lg font-semibold text-white">During Application</h3>
                                </div>
                                <ul className="space-y-2 text-slate-300 text-sm ml-11">
                                    <li className="flex items-start gap-2">
                                        <FiAlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
                                        <span><strong>Fill Accurately:</strong> Incorrect details lead to rejection</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiAlertTriangle className="text-yellow-400 mt-1 flex-shrink-0" />
                                        <span><strong>Avoid Multiple Applications:</strong> This reduces your credit score</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Step 4 */}
                            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">4</span>
                                    <h3 className="text-lg font-semibold text-white">Before Signing</h3>
                                </div>
                                <ul className="space-y-2 text-slate-300 text-sm ml-11">
                                    <li className="flex items-start gap-2">
                                        <FiInfo className="text-blue-400 mt-1 flex-shrink-0" />
                                        <span><strong>Read Fine Print:</strong> Check interest rates & prepayment penalties</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiInfo className="text-blue-400 mt-1 flex-shrink-0" />
                                        <span><strong>Hidden Fees:</strong> Processing fees, late payment charges</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Step 5 */}
                            <div className="bg-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">5</span>
                                    <h3 className="text-lg font-semibold text-white">Repayment Strategy</h3>
                                </div>
                                <ul className="space-y-2 text-slate-300 text-sm ml-11">
                                    <li className="flex items-start gap-2">
                                        <FiCreditCard className="text-cyan-400 mt-1 flex-shrink-0" />
                                        <span><strong>Set Up Auto-Debit:</strong> Never miss a payment, protect your credit score</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <FiPercent className="text-cyan-400 mt-1 flex-shrink-0" />
                                        <span><strong>EMI ≤ 40-50% of Income:</strong> Keep your budget manageable</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700/50 bg-slate-800/95 sticky bottom-0">
                            <button
                                onClick={() => { setShowGuideModal(false); setShowModal(true); }}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                            >
                                I'm Ready to Apply <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Loan Modal - Multi-Step */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        {/* Header with Steps */}
                        <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800/95 backdrop-blur-sm z-10">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-white">Apply for Loan</h2>
                                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-slate-400 hover:text-white">
                                    <FiXCircle className="text-xl" />
                                </button>
                            </div>
                            {/* Step Indicators */}
                            <div className="flex items-center justify-between">
                                {[1, 2, 3].map((step) => (
                                    <div key={step} className="flex items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${currentStep >= step
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {currentStep > step ? <FiCheck /> : step}
                                        </div>
                                        {step < 3 && (
                                            <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${currentStep > step ? 'bg-blue-500' : 'bg-slate-700'
                                                }`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-slate-500">
                                <span>Loan Details</span>
                                <span>Documents</span>
                                <span>Review</span>
                            </div>
                        </div>

                        <form onSubmit={handleApply} className="p-6">
                            {/* Step 1: Loan Details & EMI Calculator */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-300 text-sm block mb-1">Loan Amount ($) *</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="Enter amount (min: $100)"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="100"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-slate-300 text-sm block mb-1">Duration *</label>
                                            <select
                                                className="input-field"
                                                value={durationMonths}
                                                onChange={(e) => setDurationMonths(e.target.value)}
                                            >
                                                <option value="6">6 Months</option>
                                                <option value="12">12 Months</option>
                                                <option value="24">24 Months</option>
                                                <option value="36">36 Months</option>
                                                <option value="48">48 Months</option>
                                                <option value="60">60 Months</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-slate-300 text-sm block mb-1">Interest Rate (%)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={interestRate}
                                                onChange={(e) => setInterestRate(e.target.value)}
                                                step="0.5"
                                                min="1"
                                                max="30"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm block mb-1">Your Monthly Income ($)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="For affordability check"
                                            value={monthlyIncome}
                                            onChange={(e) => setMonthlyIncome(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm block mb-1">Purpose *</label>
                                        <textarea
                                            className="input-field h-20 resize-none"
                                            placeholder="Describe the purpose of your loan"
                                            value={purpose}
                                            onChange={(e) => setPurpose(e.target.value)}
                                            required
                                        ></textarea>
                                    </div>

                                    {/* EMI Preview */}
                                    {amount && (
                                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/50 rounded-xl p-5 border border-slate-600/50">
                                            <div className="flex justify-between items-center mb-3">
                                                <p className="text-slate-400 text-sm">Estimated Monthly EMI</p>
                                                <FiPercent className="text-blue-400" />
                                            </div>
                                            <p className="text-3xl font-bold text-white mb-2">
                                                ${calculateEmi()}
                                            </p>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Total Payable: ${calculateTotalPayable()}</span>
                                                <span>Interest: ${(calculateTotalPayable() - parseFloat(amount || 0)).toFixed(2)}</span>
                                            </div>

                                            {/* Affordability Indicator */}
                                            {getAffordabilityStatus() && (
                                                <div className={`mt-4 p-3 rounded-lg ${getAffordabilityStatus().color.replace('text-', 'bg-').replace('400', '500/10')} border border-current/20`}>
                                                    <div className={`flex items-center gap-2 ${getAffordabilityStatus().color}`}>
                                                        {getAffordabilityStatus().icon}
                                                        <span className="font-medium">{getAffordabilityStatus().status}</span>
                                                    </div>
                                                    <p className="text-sm mt-1 text-slate-400">{getAffordabilityStatus().message}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Document Checklist */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 text-blue-400 mb-1">
                                            <FiInfo />
                                            <span className="font-medium">Document Verification</span>
                                        </div>
                                        <p className="text-sm text-slate-400">Please confirm you have the following documents ready for verification.</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { key: 'panCard', label: 'PAN Card', desc: 'Permanent Account Number' },
                                            { key: 'aadhaar', label: 'Aadhaar Card', desc: '12-digit UIDAI number' },
                                            { key: 'bankStatements', label: 'Bank Statements', desc: 'Last 6 months' },
                                            { key: 'salarySlips', label: 'Salary Slips', desc: 'Last 3-6 months' },
                                            { key: 'employmentProof', label: 'Employment Proof', desc: 'ID Card / Appointment Letter' },
                                        ].map((doc) => (
                                            <label
                                                key={doc.key}
                                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${documents[doc.key]
                                                        ? 'bg-green-500/10 border-green-500/30'
                                                        : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={documents[doc.key]}
                                                    onChange={(e) => setDocuments({ ...documents, [doc.key]: e.target.checked })}
                                                    className="sr-only"
                                                />
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${documents[doc.key]
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-slate-700 border border-slate-600'
                                                    }`}>
                                                    {documents[doc.key] && <FiCheck />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{doc.label}</p>
                                                    <p className="text-xs text-slate-500">{doc.desc}</p>
                                                </div>
                                                <FiUpload className={documents[doc.key] ? 'text-green-400' : 'text-slate-500'} />
                                            </label>
                                        ))}
                                    </div>

                                    {!allDocumentsChecked && (
                                        <p className="text-yellow-400 text-sm flex items-center gap-2">
                                            <FiAlertTriangle />
                                            Please confirm all documents to proceed
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Review & Terms */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    {/* Summary */}
                                    <div className="bg-slate-800/50 rounded-xl p-5 space-y-3">
                                        <h3 className="text-white font-semibold mb-3">Loan Summary</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500">Loan Amount</p>
                                                <p className="text-white font-medium">${parseFloat(amount).toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Duration</p>
                                                <p className="text-white font-medium">{durationMonths} Months</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Interest Rate</p>
                                                <p className="text-white font-medium">{interestRate}% p.a.</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Monthly EMI</p>
                                                <p className="text-green-400 font-medium">${calculateEmi()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Total Payable</p>
                                                <p className="text-white font-medium">${calculateTotalPayable()}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Total Interest</p>
                                                <p className="text-yellow-400 font-medium">${(calculateTotalPayable() - parseFloat(amount)).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-700">
                                            <p className="text-slate-500 text-sm">Purpose</p>
                                            <p className="text-white">{purpose}</p>
                                        </div>
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 max-h-40 overflow-y-auto text-xs text-slate-400">
                                        <h4 className="text-slate-300 font-medium mb-2">Terms & Conditions</h4>
                                        <ul className="space-y-1 list-disc list-inside">
                                            <li>Interest is calculated using simple interest formula.</li>
                                            <li>Late payment will incur a penalty of 2% on the EMI amount.</li>
                                            <li>Prepayment is allowed without any additional charges.</li>
                                            <li>Processing fee: 1% of loan amount (min $10).</li>
                                            <li>Loan approval is subject to document verification.</li>
                                            <li>The bank reserves the right to reject applications without explanation.</li>
                                        </ul>
                                    </div>

                                    {/* Checkboxes */}
                                    <div className="space-y-3">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptedTerms}
                                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-300">
                                                I have read and agree to the <span className="text-blue-400">Terms & Conditions</span> and understand the repayment schedule.
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autoDebit}
                                                onChange={(e) => setAutoDebit(e.target.checked)}
                                                className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-slate-300">
                                                Enable <span className="text-green-400">Auto-Debit</span> for monthly EMI payments (Recommended)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-700">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setCurrentStep(currentStep - 1)}
                                        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                        ← Back
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setShowModal(false); resetForm(); }}
                                        className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentStep === 1 && (!amount || !purpose)) {
                                                alert('Please fill in all required fields');
                                                return;
                                            }
                                            if (currentStep === 2 && !allDocumentsChecked) {
                                                alert('Please confirm all documents');
                                                return;
                                            }
                                            setCurrentStep(currentStep + 1);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2"
                                    >
                                        Next <FiChevronRight />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!acceptedTerms}
                                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${acceptedTerms
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <FiCheck /> Submit Application
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Loans;
