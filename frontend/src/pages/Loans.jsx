import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiCreditCard,
    FiFileText, FiAlertTriangle, FiInfo, FiCheck, FiChevronRight, FiArrowRight,
    FiHome, FiTruck, FiBriefcase, FiBook, FiUser, FiActivity
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LoanProgressTracker = ({ currentStage, stages }) => {
    return (
        <div className="w-full py-8">
            <div className="relative">
                {/* Progress Bar Background */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full z-0 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                    />
                </div>

                <div className="flex justify-between relative z-10">
                    {stages.map((stage, index) => {
                        const isCompleted = currentStage > stage.step;
                        const isActive = currentStage === stage.step;
                        const isPending = currentStage < stage.step;

                        return (
                            <div key={stage.step} className="flex flex-col items-center group cursor-default">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        borderColor: isActive ? '#3b82f6' : isCompleted ? '#22c55e' : '#334155'
                                    }}
                                    className={`
                                        w-10 h-10 rounded-full flex items-center justify-center border-4 
                                        transition-colors duration-300 relative bg-slate-900
                                        ${isCompleted ? 'border-green-500 text-green-400' :
                                            isActive ? 'border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]' :
                                                'border-slate-700 text-slate-600'}
                                    `}
                                >
                                    {isCompleted ? <FiCheck className="text-xl" /> :
                                        isActive ? <FiActivity className="animate-pulse" /> :
                                            <span className="text-sm font-bold">{stage.step}</span>}

                                    {/* Active Pulse Effect */}
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0.5, scale: 1 }}
                                            animate={{ opacity: 0, scale: 2 }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-blue-500/30 -z-10"
                                        />
                                    )}
                                </motion.div>

                                {/* Stage Label */}
                                <div className="absolute top-14 w-32 text-center transition-all duration-300">
                                    <p className={`text-xs font-semibold mb-1 ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                                        }`}>
                                        {stage.name}
                                    </p>

                                    {/* Hover Details */}
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        whileHover={{ opacity: 1, y: 0 }}
                                        className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 top-full w-48 bg-slate-800 p-2 rounded-lg border border-slate-700 shadow-xl z-20 pointer-events-none"
                                    >
                                        <p className="text-[10px] text-slate-400 text-center">
                                            {isCompleted ? 'Completed successfully' :
                                                isActive ? 'Currently being processed by our team' :
                                                    'Waiting for previous steps'}
                                        </p>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Context Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-20 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-start gap-3"
            >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <FiInfo />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-blue-100">Current Status: {stages[currentStage - 1]?.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                        {currentStage === 1 && "We have received your application. It is currently under initial review."}
                        {currentStage === 2 && "Our credit team is analyzing your financial profile and CIBIL score."}
                        {currentStage === 3 && "Legal team is verifying your submitted documents for compliance."}
                        {currentStage === 4 && "Final executive review before funds release."}
                        {currentStage === 5 && "Funds have been approved! Disbursement is in progress."}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const Loans = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showGuideModal, setShowGuideModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Form state
    const [loanType, setLoanType] = useState('PERSONAL');
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

    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const fetchLoans = async () => {
        try {
            const response = await api.get('/loans/');
            setLoans(response.data);
        } catch (error) {
            console.error("Failed to fetch loans", error);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, []);

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

    const allDocumentsChecked = Object.values(documents).every(Boolean);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!acceptedTerms) {
            alert('Please accept the terms and conditions');
            return;
        }
        try {
            await api.post('/loans/', {
                loan_type: loanType,
                amount,
                purpose,
                duration_months: parseInt(durationMonths),
                interest_rate: parseFloat(interestRate),
            });
            setShowModal(false);
            resetForm();
            fetchLoans();
            alert('🎉 Loan application submitted successfully! It will be reviewed by our team.');
        } catch (error) {
            alert('Failed to apply for loan: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const resetForm = () => {
        setLoanType('PERSONAL');
        setAmount('');
        setPurpose('');
        setDurationMonths('12');
        setInterestRate('10');
        setMonthlyIncome('');
        setDocuments({ panCard: false, aadhaar: false, bankStatements: false, salarySlips: false, employmentProof: false });
        setAcceptedTerms(false);
        setCurrentStep(1);
    };

    const handlePayEmi = async (loanId, emiAmount) => {
        if (!confirm(`Pay monthly EMI of ₹${parseFloat(emiAmount).toFixed(2)}? This will be deducted from your balance.`)) {
            return;
        }
        try {
            const response = await api.post(`/loans/${loanId}/pay-emi/`);
            alert(`✅ EMI paid successfully! Remaining EMIs: ${response.data.emis_remaining}`);
            fetchLoans();
        } catch (error) {
            alert('Failed to pay EMI: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const getLoanTypeIcon = (type) => {
        const icons = {
            PERSONAL: <FiUser />,
            HOME: <FiHome />,
            VEHICLE: <FiTruck />,
            BUSINESS: <FiBriefcase />,
            EDUCATION: <FiBook />,
        };
        return icons[type] || <FiDollarSign />;
    };

    const getStatusStyle = (status) => {
        if (status.includes('APPROVED') || status === 'DISBURSED') return 'bg-green-500/20 text-green-400';
        if (status.includes('REJECTED')) return 'bg-red-500/20 text-red-400';
        if (status === 'PAID') return 'bg-blue-500/20 text-blue-400';
        if (status.includes('REVIEW')) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-slate-500/20 text-slate-400';
    };

    const getWorkflowStages = () => [
        { step: 1, name: 'Application', status: 'APPLICATION_REVIEW' },
        { step: 2, name: 'Credit Check', status: 'CREDIT_REVIEW' },
        { step: 3, name: 'Legal Review', status: 'LEGAL_REVIEW' },
        { step: 4, name: 'Final Approval', status: 'FINAL_REVIEW' },
        { step: 5, name: 'Disbursement', status: 'DISBURSED' },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Loans</h1>
                    <p className="text-slate-400">Track your loan applications and EMI payments.</p>
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
                        <FiPlus /> Apply for Loan
                    </button>
                </div>
            </div>

            {/* Loans List */}
            <div className="space-y-6">
                {loans.length === 0 ? (
                    <div className="glass-panel p-12 text-center">
                        <FiFileText className="text-5xl text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">No loan applications yet</p>
                        <p className="text-slate-500 text-sm mt-2">Click "Apply for Loan" to get started</p>
                    </div>
                ) : (
                    loans.map((loan) => (
                        <div key={loan.id} className="glass-panel p-6">
                            {/* Loan Header */}
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 text-2xl">
                                        {getLoanTypeIcon(loan.loan_type)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            ₹{parseFloat(loan.amount).toLocaleString()}
                                        </h3>
                                        <p className="text-slate-400 text-sm">{loan.loan_type_display} • {loan.purpose}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusStyle(loan.status)}`}>
                                        {loan.status_display}
                                    </span>
                                    <span className="text-slate-500 text-sm">
                                        Applied: {new Date(loan.applied_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Workflow Progress (for non-final statuses) */}
                            {!loan.is_rejected && loan.status !== 'PAID' && (
                                <LoanProgressTracker
                                    currentStage={parseInt(loan.current_stage || 1)}
                                    stages={getWorkflowStages()}
                                />
                            )}

                            {/* Rejection Notice */}
                            {loan.is_rejected && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-2 text-red-400">
                                        <FiXCircle />
                                        <span className="font-medium">Application Rejected</span>
                                    </div>
                                    {(loan.application_remarks || loan.credit_remarks || loan.legal_remarks || loan.final_remarks) && (
                                        <p className="text-slate-400 text-sm mt-2">
                                            Reason: {loan.application_remarks || loan.credit_remarks || loan.legal_remarks || loan.final_remarks}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* EMI Details - Show for DISBURSED loans */}
                            {loan.status === 'DISBURSED' && loan.monthly_emi && (
                                <div className="bg-slate-800/50 rounded-xl p-4 mb-4 mt-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div>
                                            <p className="text-slate-500 text-sm">Monthly EMI</p>
                                            <p className="text-white font-semibold">₹{parseFloat(loan.monthly_emi).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-sm">EMIs Paid</p>
                                            <p className="text-green-400 font-semibold">{loan.emis_paid} / {loan.duration_months}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-sm">Amount Paid</p>
                                            <p className="text-white font-semibold">₹{parseFloat(loan.amount_paid).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-sm">Remaining</p>
                                            <p className="text-yellow-400 font-semibold">₹{parseFloat(loan.remaining_amount).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all"
                                            style={{ width: `${(loan.emis_paid / loan.duration_months) * 100}%` }}
                                        ></div>
                                    </div>

                                    {/* Pay EMI Button */}
                                    {loan.remaining_emis > 0 && (
                                        <button
                                            onClick={() => handlePayEmi(loan.id, loan.monthly_emi)}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <FiCreditCard /> Pay EMI (₹{parseFloat(loan.monthly_emi).toFixed(2)})
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Loan Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-6 pt-6 border-t border-slate-700/50">
                                <div>
                                    <p className="text-slate-500">Duration</p>
                                    <p className="text-white">{loan.duration_months} months</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Interest Rate</p>
                                    <p className="text-white">{loan.interest_rate}% p.a.</p>
                                </div>
                                {loan.cibil_score && (
                                    <div>
                                        <p className="text-slate-500">CIBIL Score</p>
                                        <p className={loan.cibil_score >= 750 ? 'text-green-400' : 'text-yellow-400'}>{loan.cibil_score}</p>
                                    </div>
                                )}
                                {loan.foir && (
                                    <div>
                                        <p className="text-slate-500">FOIR</p>
                                        <p className={parseFloat(loan.foir) <= 40 ? 'text-green-400' : 'text-yellow-400'}>{loan.foir}%</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Loan Guide Modal */}
            {showGuideModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800/95 backdrop-blur-sm">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">📋 Loan Application Guide</h2>
                                <button onClick={() => setShowGuideModal(false)} className="text-slate-400 hover:text-white">
                                    <FiXCircle className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Workflow */}
                            <div className="bg-slate-700/30 rounded-xl p-5">
                                <h3 className="text-lg font-semibold text-white mb-4">Approval Process</h3>
                                <div className="space-y-4">
                                    {[
                                        { step: 1, title: 'Application Review', officer: 'Application Officer', desc: 'KYC verification and document check' },
                                        { step: 2, title: 'Credit Analysis', officer: 'Credit Officer', desc: 'CIBIL score, income verification, FOIR calculation' },
                                        { step: 3, title: 'Legal Verification', officer: 'Legal Officer', desc: 'Document verification, title check, compliance' },
                                        { step: 4, title: 'Final Approval & Disbursement', officer: 'Disbursement Manager', desc: 'Sanction letter, agreement, fund transfer' },
                                    ].map((item) => (
                                        <div key={item.step} className="flex gap-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold flex-shrink-0">
                                                {item.step}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{item.title}</p>
                                                <p className="text-slate-500 text-xs">{item.officer}</p>
                                                <p className="text-slate-400 text-sm mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Required Documents */}
                            <div className="bg-slate-700/30 rounded-xl p-5">
                                <h3 className="text-lg font-semibold text-white mb-3">Required Documents</h3>
                                <ul className="space-y-2 text-slate-300">
                                    {['PAN Card', 'Aadhaar Card', 'Bank Statements (6 months)', 'Salary Slips (3-6 months)', 'Employment Proof'].map((doc, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <FiCheck className="text-green-400" />
                                            {doc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-700/50">
                            <button
                                onClick={() => { setShowGuideModal(false); setShowModal(true); }}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
                            >
                                Apply Now <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Apply Loan Modal - Multi-Step */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto">
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
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-all ${currentStep >= step ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                                            }`}>
                                            {currentStep > step ? <FiCheck /> : step}
                                        </div>
                                        {step < 3 && <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${currentStep > step ? 'bg-blue-500' : 'bg-slate-700'}`}></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleApply} className="p-6">
                            {/* Step 1: Loan Details */}
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-slate-300 text-sm block mb-2">Loan Type</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { type: 'PERSONAL', label: 'Personal', icon: <FiUser /> },
                                                { type: 'HOME', label: 'Home', icon: <FiHome /> },
                                                { type: 'VEHICLE', label: 'Vehicle', icon: <FiTruck /> },
                                                { type: 'BUSINESS', label: 'Business', icon: <FiBriefcase /> },
                                                { type: 'EDUCATION', label: 'Education', icon: <FiBook /> },
                                            ].map((item) => (
                                                <button
                                                    key={item.type}
                                                    type="button"
                                                    onClick={() => setLoanType(item.type)}
                                                    className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${loanType === item.type
                                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                                        }`}
                                                >
                                                    {item.icon} {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm block mb-1">Amount (₹)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="Enter amount"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            min="10000"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-slate-300 text-sm block mb-1">Duration</label>
                                            <select className="input-field" value={durationMonths} onChange={(e) => setDurationMonths(e.target.value)}>
                                                {[12, 24, 36, 48, 60].map((m) => (
                                                    <option key={m} value={m}>{m} Months</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-slate-300 text-sm block mb-1">Interest (%)</label>
                                            <input type="number" className="input-field" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.5" min="5" max="25" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-slate-300 text-sm block mb-1">Purpose</label>
                                        <textarea className="input-field h-20 resize-none" placeholder="Describe loan purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} required></textarea>
                                    </div>

                                    {amount && (
                                        <div className="bg-slate-800/50 rounded-xl p-4">
                                            <p className="text-slate-400 text-sm">Estimated Monthly EMI</p>
                                            <p className="text-2xl font-bold text-white">₹{calculateEmi()}</p>
                                            <p className="text-slate-500 text-xs mt-1">Total Payable: ₹{calculateTotalPayable()}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Documents */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                                        <p className="text-blue-400 font-medium">Document Checklist</p>
                                        <p className="text-slate-400 text-sm">Confirm you have these documents ready.</p>
                                    </div>

                                    {[
                                        { key: 'panCard', label: 'PAN Card' },
                                        { key: 'aadhaar', label: 'Aadhaar Card' },
                                        { key: 'bankStatements', label: 'Bank Statements (6 months)' },
                                        { key: 'salarySlips', label: 'Salary Slips (3-6 months)' },
                                        { key: 'employmentProof', label: 'Employment Proof' },
                                    ].map((doc) => (
                                        <label key={doc.key} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${documents[doc.key] ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700/50'
                                            }`}>
                                            <input
                                                type="checkbox"
                                                checked={documents[doc.key]}
                                                onChange={(e) => setDocuments({ ...documents, [doc.key]: e.target.checked })}
                                                className="w-5 h-5 rounded"
                                            />
                                            <span className="text-slate-300">{doc.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}

                            {/* Step 3: Review & Submit */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="bg-slate-800/50 rounded-xl p-4">
                                        <h3 className="text-white font-semibold mb-3">Loan Summary</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><p className="text-slate-500">Type</p><p className="text-white">{loanType}</p></div>
                                            <div><p className="text-slate-500">Amount</p><p className="text-white">₹{parseFloat(amount).toLocaleString()}</p></div>
                                            <div><p className="text-slate-500">Duration</p><p className="text-white">{durationMonths} months</p></div>
                                            <div><p className="text-slate-500">EMI</p><p className="text-green-400">₹{calculateEmi()}</p></div>
                                        </div>
                                    </div>

                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1 w-4 h-4 rounded" />
                                        <span className="text-sm text-slate-300">I agree to the terms and conditions</span>
                                    </label>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex justify-between gap-3 mt-6 pt-4 border-t border-slate-700">
                                {currentStep > 1 ? (
                                    <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="px-4 py-2 text-slate-300">← Back</button>
                                ) : (
                                    <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 text-slate-300">Cancel</button>
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentStep === 1 && (!amount || !purpose)) { alert('Fill all fields'); return; }
                                            if (currentStep === 2 && !allDocumentsChecked) { alert('Check all documents'); return; }
                                            setCurrentStep(currentStep + 1);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                                    >
                                        Next <FiChevronRight />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!acceptedTerms}
                                        className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 ${acceptedTerms ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <FiCheck /> Submit
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
