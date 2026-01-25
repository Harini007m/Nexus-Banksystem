import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DashboardLayout from '../layouts/DashboardLayout';
import {
    FiUser, FiFileText, FiCheckCircle, FiXCircle, FiClock,
    FiDollarSign, FiAlertTriangle, FiSearch, FiFilter,
    FiChevronDown, FiChevronUp, FiEye, FiSend
} from 'react-icons/fi';

const OfficerDashboard = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Get the correct API endpoint based on role
    const getApiEndpoint = () => {
        switch (user?.role) {
            case 'APPLICATION_OFFICER':
                return '/loans/officer/application/';
            case 'CREDIT_OFFICER':
                return '/loans/officer/credit/';
            case 'LEGAL_OFFICER':
                return '/loans/officer/legal/';
            case 'DISBURSEMENT_MANAGER':
                return '/loans/officer/disbursement/';
            default:
                return '/loans/all/';
        }
    };

    const getReviewEndpoint = (loanId) => {
        switch (user?.role) {
            case 'APPLICATION_OFFICER':
                return `/loans/officer/application/${loanId}/review/`;
            case 'CREDIT_OFFICER':
                return `/loans/officer/credit/${loanId}/review/`;
            case 'LEGAL_OFFICER':
                return `/loans/officer/legal/${loanId}/review/`;
            case 'DISBURSEMENT_MANAGER':
                return `/loans/officer/disbursement/${loanId}/review/`;
            default:
                return null;
        }
    };

    const fetchLoans = async () => {
        setLoading(true);
        try {
            const response = await api.get(getApiEndpoint());
            setLoans(response.data);
        } catch (error) {
            console.error('Failed to fetch loans', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLoans();
    }, [user?.role]);

    const handleReview = async (action) => {
        if (!selectedLoan) return;

        setSubmitting(true);
        try {
            const endpoint = getReviewEndpoint(selectedLoan.id);
            await api.post(endpoint, { ...reviewData, action });
            alert(`Loan ${action === 'APPROVE' ? 'approved' : action === 'DISBURSE' ? 'disbursed' : 'rejected'} successfully!`);
            setShowReviewModal(false);
            setSelectedLoan(null);
            setReviewData({});
            fetchLoans();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.error || 'Failed to process review'));
        } finally {
            setSubmitting(false);
        }
    };

    const openReviewModal = (loan) => {
        setSelectedLoan(loan);
        // Pre-fill review data based on role
        switch (user?.role) {
            case 'APPLICATION_OFFICER':
                setReviewData({ kyc_verified: false, documents_complete: false, remarks: '' });
                break;
            case 'CREDIT_OFFICER':
                setReviewData({
                    cibil_score: 750,
                    monthly_income: '',
                    existing_emi: 0,
                    employment_verified: false,
                    residence_verified: false,
                    remarks: ''
                });
                break;
            case 'LEGAL_OFFICER':
                setReviewData({
                    property_value: '',
                    title_verified: false,
                    encumbrance_clear: false,
                    legal_compliance: false,
                    remarks: ''
                });
                break;
            case 'DISBURSEMENT_MANAGER':
                setReviewData({ remarks: '' });
                break;
        }
        setShowReviewModal(true);
    };

    const getStatusColor = (status) => {
        if (status.includes('APPROVED') || status === 'DISBURSED' || status === 'PAID') return 'text-green-400 bg-green-500/20';
        if (status.includes('REJECTED')) return 'text-red-400 bg-red-500/20';
        if (status.includes('REVIEW')) return 'text-yellow-400 bg-yellow-500/20';
        return 'text-blue-400 bg-blue-500/20';
    };

    const getRoleTitle = () => {
        switch (user?.role) {
            case 'APPLICATION_OFFICER': return 'Application Review Queue';
            case 'CREDIT_OFFICER': return 'Credit Analysis Queue';
            case 'LEGAL_OFFICER': return 'Legal Verification Queue';
            case 'DISBURSEMENT_MANAGER': return 'Final Approval Queue';
            default: return 'All Loans';
        }
    };

    const getRoleDescription = () => {
        switch (user?.role) {
            case 'APPLICATION_OFFICER':
                return 'Review customer applications, verify KYC documents, and check document completeness.';
            case 'CREDIT_OFFICER':
                return 'Analyze credit scores, verify income and employment, and calculate EMI affordability.';
            case 'LEGAL_OFFICER':
                return 'Verify property documents, check legal compliance, and assess collateral.';
            case 'DISBURSEMENT_MANAGER':
                return 'Final approval, sanction letter generation, and loan disbursement.';
            default:
                return 'View and manage all loan applications.';
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <FiUser className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.role_display || 'Officer'} Dashboard</h1>
                        <p className="text-slate-400 text-sm">{user?.department}</p>
                    </div>
                </div>
                <p className="text-slate-400 mt-4">{getRoleDescription()}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Pending Review</p>
                            <p className="text-2xl font-bold text-white">{loans.length}</p>
                        </div>
                        <FiClock className="text-2xl text-yellow-400" />
                    </div>
                </div>
                <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Value</p>
                            <p className="text-2xl font-bold text-white">
                                ₹{loans.reduce((sum, l) => sum + parseFloat(l.amount), 0).toLocaleString()}
                            </p>
                        </div>
                        <FiDollarSign className="text-2xl text-green-400" />
                    </div>
                </div>
                <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">High Priority</p>
                            <p className="text-2xl font-bold text-white">
                                {loans.filter(l => parseFloat(l.amount) > 500000).length}
                            </p>
                        </div>
                        <FiAlertTriangle className="text-2xl text-red-400" />
                    </div>
                </div>
                <div className="glass-panel p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Average Amount</p>
                            <p className="text-2xl font-bold text-white">
                                ₹{loans.length ? (loans.reduce((sum, l) => sum + parseFloat(l.amount), 0) / loans.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                            </p>
                        </div>
                        <FiFileText className="text-2xl text-blue-400" />
                    </div>
                </div>
            </div>

            {/* Loans Table */}
            <div className="glass-panel overflow-hidden">
                <div className="p-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-semibold text-white">{getRoleTitle()}</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading loans...</p>
                    </div>
                ) : loans.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiCheckCircle className="text-5xl text-green-400 mx-auto mb-4" />
                        <p className="text-slate-400 text-lg">All caught up!</p>
                        <p className="text-slate-500 text-sm">No loans pending your review</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Applicant</th>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Loan Type</th>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Amount</th>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Status</th>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Applied</th>
                                    <th className="text-left text-slate-400 text-sm font-medium p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {loans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="text-white font-medium">{loan.user_name}</p>
                                                <p className="text-slate-500 text-xs">{loan.user_email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-slate-300">{loan.loan_type_display}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-white font-semibold">₹{parseFloat(loan.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(loan.status)}`}>
                                                {loan.status_display}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-slate-400 text-sm">
                                                {new Date(loan.applied_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => openReviewModal(loan)}
                                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                            >
                                                <FiEye /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {showReviewModal && selectedLoan && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800/95 backdrop-blur-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Review Loan Application</h2>
                                    <p className="text-slate-400 text-sm">Loan ID: #{selectedLoan.id}</p>
                                </div>
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <FiXCircle className="text-xl" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Applicant Info */}
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <h3 className="text-white font-semibold mb-3">Applicant Information</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Name</p>
                                        <p className="text-white">{selectedLoan.user_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Email</p>
                                        <p className="text-white">{selectedLoan.user_email}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Loan Type</p>
                                        <p className="text-white">{selectedLoan.loan_type_display}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Amount</p>
                                        <p className="text-green-400 font-semibold">₹{parseFloat(selectedLoan.amount).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Duration</p>
                                        <p className="text-white">{selectedLoan.duration_months} months</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Interest Rate</p>
                                        <p className="text-white">{selectedLoan.interest_rate}%</p>
                                    </div>
                                </div>
                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                    <p className="text-slate-500 text-sm">Purpose</p>
                                    <p className="text-white">{selectedLoan.purpose}</p>
                                </div>
                            </div>

                            {/* Role-specific Review Form */}
                            {user?.role === 'APPLICATION_OFFICER' && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold">KYC & Document Verification</h3>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.kyc_verified}
                                            onChange={(e) => setReviewData({ ...reviewData, kyc_verified: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">KYC Verified (PAN, Aadhaar checked)</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.documents_complete}
                                            onChange={(e) => setReviewData({ ...reviewData, documents_complete: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">All Documents Complete</span>
                                    </label>
                                </div>
                            )}

                            {user?.role === 'CREDIT_OFFICER' && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold">Credit Analysis</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-slate-400 text-sm block mb-1">CIBIL Score</label>
                                            <input
                                                type="number"
                                                min="300"
                                                max="900"
                                                className="input-field"
                                                value={reviewData.cibil_score}
                                                onChange={(e) => setReviewData({ ...reviewData, cibil_score: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-400 text-sm block mb-1">Monthly Income (₹)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={reviewData.monthly_income}
                                                onChange={(e) => setReviewData({ ...reviewData, monthly_income: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-slate-400 text-sm block mb-1">Existing EMI (₹)</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={reviewData.existing_emi}
                                                onChange={(e) => setReviewData({ ...reviewData, existing_emi: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.employment_verified}
                                            onChange={(e) => setReviewData({ ...reviewData, employment_verified: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">Employment Verified</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.residence_verified}
                                            onChange={(e) => setReviewData({ ...reviewData, residence_verified: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">Residence Verified</span>
                                    </label>
                                </div>
                            )}

                            {user?.role === 'LEGAL_OFFICER' && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold">Legal Verification</h3>

                                    <div>
                                        <label className="text-slate-400 text-sm block mb-1">Property/Asset Value (₹)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={reviewData.property_value}
                                            onChange={(e) => setReviewData({ ...reviewData, property_value: e.target.value })}
                                        />
                                    </div>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.title_verified}
                                            onChange={(e) => setReviewData({ ...reviewData, title_verified: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">Title Ownership Verified</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.encumbrance_clear}
                                            onChange={(e) => setReviewData({ ...reviewData, encumbrance_clear: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">No Encumbrances Found</span>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={reviewData.legal_compliance}
                                            onChange={(e) => setReviewData({ ...reviewData, legal_compliance: e.target.checked })}
                                            className="w-5 h-5 rounded"
                                        />
                                        <span className="text-slate-300">Legal Compliance Verified</span>
                                    </label>
                                </div>
                            )}

                            {user?.role === 'DISBURSEMENT_MANAGER' && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-semibold">Final Review Summary</h3>

                                    {/* Show previous reviews */}
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                            <div className="flex items-center gap-2 text-green-400 mb-1">
                                                <FiCheckCircle /> Application Review
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                KYC: {selectedLoan.kyc_verified ? '✓' : '✗'} |
                                                Documents: {selectedLoan.documents_complete ? '✓' : '✗'}
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <div className="flex items-center gap-2 text-blue-400 mb-1">
                                                <FiCheckCircle /> Credit Analysis
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                CIBIL: {selectedLoan.cibil_score || 'N/A'} |
                                                FOIR: {selectedLoan.foir || 'N/A'}%
                                            </p>
                                        </div>

                                        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                            <div className="flex items-center gap-2 text-purple-400 mb-1">
                                                <FiCheckCircle /> Legal Verification
                                            </div>
                                            <p className="text-sm text-slate-400">
                                                Title: {selectedLoan.title_verified ? '✓' : '✗'} |
                                                Encumbrance: {selectedLoan.encumbrance_clear ? 'Clear' : 'Issues'} |
                                                Compliance: {selectedLoan.legal_compliance ? '✓' : '✗'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            <div>
                                <label className="text-slate-400 text-sm block mb-1">Remarks / Notes</label>
                                <textarea
                                    className="input-field h-24 resize-none"
                                    placeholder="Add any notes or observations..."
                                    value={reviewData.remarks || ''}
                                    onChange={(e) => setReviewData({ ...reviewData, remarks: e.target.value })}
                                ></textarea>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-slate-700/50 bg-slate-800/95 sticky bottom-0">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleReview('REJECT')}
                                    disabled={submitting}
                                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <FiXCircle /> Reject
                                </button>

                                {user?.role === 'DISBURSEMENT_MANAGER' && selectedLoan.status === 'APPROVED' ? (
                                    <button
                                        onClick={() => handleReview('DISBURSE')}
                                        disabled={submitting}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiSend /> Disburse Loan
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleReview('APPROVE')}
                                        disabled={submitting}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <FiCheckCircle /> Approve
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default OfficerDashboard;
