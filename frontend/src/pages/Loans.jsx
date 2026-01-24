import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { FiPlus, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Loans = () => {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [amount, setAmount] = useState('');
    const [purpose, setPurpose] = useState('');
    const [durationMonths, setDurationMonths] = useState('12');
    const [interestRate, setInterestRate] = useState('10');

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

    const handleApply = async (e) => {
        e.preventDefault();
        try {
            await api.post('/loans/', {
                amount,
                purpose,
                duration_months: parseInt(durationMonths),
                interest_rate: parseFloat(interestRate),
                identity_proof: null
            });
            setShowModal(false);
            setAmount('');
            setPurpose('');
            setDurationMonths('12');
            setInterestRate('10');
            fetchLoans();
        } catch (error) {
            alert('Failed to apply for loan');
        }
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
            alert(`EMI paid successfully! Remaining EMIs: ${response.data.emis_remaining}`);
            fetchLoans();
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
            alert('Loan fully repaid successfully!');
            fetchLoans();
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

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Loans</h1>
                    <p className="text-slate-400">Manage your loan applications and EMI payments.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                >
                    <FiPlus /> Apply New Loan
                </button>
            </div>

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
                        <div className="text-slate-500 text-lg">No loans found</div>
                        <p className="text-slate-600 text-sm mt-2">Click "Apply New Loan" to get started</p>
                    </div>
                )}
            </div>

            {/* Apply Loan Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel w-full max-w-md p-6 m-4">
                        <h2 className="text-xl font-bold text-white mb-6">Apply for Loan</h2>
                        <form onSubmit={handleApply} className="space-y-4">
                            <div>
                                <label className="text-slate-300 text-sm block mb-1">Loan Amount ($)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Enter amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="100"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-slate-300 text-sm block mb-1">Duration (Months)</label>
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
                                <label className="text-slate-300 text-sm block mb-1">Purpose</label>
                                <textarea
                                    className="input-field h-24 resize-none"
                                    placeholder="Describe the purpose of your loan"
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            {/* EMI Preview */}
                            {amount && (
                                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-slate-400 text-sm mb-2">Estimated Monthly EMI</p>
                                    <p className="text-2xl font-bold text-white">
                                        ${((parseFloat(amount) * (1 + (parseFloat(interestRate) / 100) * (parseInt(durationMonths) / 12))) / parseInt(durationMonths)).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Total Payable: ${(parseFloat(amount) * (1 + (parseFloat(interestRate) / 100) * (parseInt(durationMonths) / 12))).toFixed(2)}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all"
                                >
                                    Submit Application
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Loans;
