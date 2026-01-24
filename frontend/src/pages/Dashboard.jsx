import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReactApexChart from 'react-apexcharts';
import { FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiDollarSign, FiSend } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    // Transfer Modal State
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [recipientAccount, setRecipientAccount] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferDescription, setTransferDescription] = useState('');

    const fetchAccountData = async () => {
        try {
            const response = await api.get('/accounts/balance/');
            setAccount(response.data);
        } catch (error) {
            console.error("Failed to fetch account data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/accounts/transfer/', {
                recipient_account_number: recipientAccount,
                amount: transferAmount,
                description: transferDescription
            });
            alert('Transfer successful!');
            setShowTransferModal(false);
            setRecipientAccount('');
            setTransferAmount('');
            setTransferDescription('');
            fetchAccountData(); // Refresh data
        } catch (error) {
            alert('Transfer failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    // Chart Data
    const chartOptions = {
        chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
        colors: ['#3b82f6', '#8b5cf6'],
        stroke: { curve: 'smooth', width: 2 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.3 } },
        dataLabels: { enabled: false },
        xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { style: { colors: '#94a3b8' } } },
        grid: { borderColor: '#33415550' },
        theme: { mode: 'dark' }
    };
    const chartSeries = [{ name: 'Income', data: [31, 40, 28, 51, 42, 109, 100] }, { name: 'Expense', data: [11, 32, 45, 32, 34, 52, 41] }];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                        <p className="text-slate-400">Track your financial activities.</p>
                    </div>
                    <button
                        onClick={() => setShowTransferModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                    >
                        <FiSend /> Quick Transfer
                    </button>
                </div>

                {/* Account Number Display */}
                <div className="glass-panel p-4 inline-flex items-center gap-3">
                    <span className="text-slate-400 text-sm">Your Account Number:</span>
                    <span className="font-mono text-blue-400 font-bold">{account?.account_number || '---'}</span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="glass-panel p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/30"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
                                <FiDollarSign className="text-xl" />
                            </div>
                            <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">+2.5%</span>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                        <h3 className="text-3xl font-bold text-white">
                            ${account ? parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '---'}
                        </h3>
                    </div>

                    {/* Income Card */}
                    <div className="glass-panel p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-green-500/30"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-500/20 p-3 rounded-lg text-green-400">
                                <FiArrowUpRight className="text-xl" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">Total Income</p>
                        <h3 className="text-3xl font-bold text-white">
                            ${account ? parseFloat(account.total_income).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </h3>
                    </div>

                    {/* Expense Card */}
                    <div className="glass-panel p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-red-500/30"></div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-red-500/20 p-3 rounded-lg text-red-400">
                                <FiArrowDownLeft className="text-xl" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-1">Total Expense</p>
                        <h3 className="text-3xl font-bold text-white">
                            ${account ? parseFloat(account.total_expense).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </h3>
                    </div>
                </div>

                {/* Charts & Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart */}
                    <div className="glass-panel p-6 lg:col-span-2">
                        <h3 className="text-xl font-semibold text-white mb-6">Financial Analytics</h3>
                        <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={350} />
                    </div>

                    {/* Recent Transactions */}
                    <div className="glass-panel p-6">
                        <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
                        <div className="space-y-4">
                            {account?.transactions?.slice(0, 5).map((txn) => (
                                <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${txn.transaction_type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' :
                                            txn.transaction_type === 'WITHDRAWAL' ? 'bg-red-500/20 text-red-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {txn.transaction_type === 'DEPOSIT' ? <FiArrowUpRight /> :
                                                txn.transaction_type === 'WITHDRAWAL' ? <FiArrowDownLeft /> : <FiCreditCard />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{txn.description || txn.transaction_type}</p>
                                            <p className="text-xs text-slate-400">{new Date(txn.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${txn.transaction_type === 'DEPOSIT' ? 'text-green-400' : 'text-slate-200'
                                        }`}>
                                        {txn.transaction_type === 'DEPOSIT' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}

                            {!account?.transactions?.length && (
                                <p className="text-slate-500 text-center py-4">No recent transactions</p>
                            )}
                        </div>

                        <button className="w-full mt-6 py-2 text-sm text-slate-400 hover:text-white border border-slate-700/50 rounded-lg hover:bg-slate-800 transition-colors">
                            View All Transactions
                        </button>
                    </div>
                </div>
            </div>

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FiSend className="text-blue-400" /> Quick Transfer
                        </h2>
                        <form onSubmit={handleTransfer} className="space-y-4">
                            <div>
                                <label className="text-slate-300 text-sm">Recipient Account Number</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter account number"
                                    value={recipientAccount}
                                    onChange={(e) => setRecipientAccount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm">Amount</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="What's this for?"
                                    value={transferDescription}
                                    onChange={(e) => setTransferDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-slate-300 hover:text-white">Cancel</button>
                                <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg text-white flex items-center gap-2">
                                    <FiSend /> Send Money
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Dashboard;
