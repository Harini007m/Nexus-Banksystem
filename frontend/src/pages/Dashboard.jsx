import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import ReactApexChart from 'react-apexcharts';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowDownLeft, FiCreditCard, FiDollarSign, FiSend, FiTrendingUp, FiActivity, FiPieChart } from 'react-icons/fi';

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

    // Advanced Chart Configuration
    const chartOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
            }
        },
        colors: ['#3b82f6', '#10b981'],
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 99, 100]
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            labels: { style: { colors: '#64748b' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b' },
                formatter: (value) => `$${value}`
            },
        },
        grid: {
            borderColor: '#33415520',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        theme: { mode: 'dark' },
        tooltip: {
            theme: 'dark',
            x: { show: false },
            y: { formatter: (val) => `$${val}` }
        }
    };

    const chartSeries = [
        { name: 'Income', data: [3100, 4000, 2800, 5100, 4200, 6900, 7000] },
        { name: 'Expense', data: [1100, 3200, 4500, 3200, 3400, 5200, 4100] }
    ];

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                    <div>
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            Dashboard Overview
                        </h1>
                        <p className="text-slate-400 mt-1">Welcome back! Here's your financial summary.</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTransferModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all"
                    >
                        <FiSend /> Quick Transfer
                    </motion.button>
                </motion.div>

                {/* Account Number & Abstract Background */}
                <motion.div variants={itemVariants} className="relative">
                    <div className="glass-panel p-4 inline-flex items-center gap-3 border-blue-500/20 bg-blue-500/5">
                        <span className="text-blue-200 text-sm">Your Account Number:</span>
                        <span className="font-mono text-blue-400 font-bold text-lg tracking-wider">{account?.account_number || '---'}</span>
                    </div>
                </motion.div>

                {/* Cards Grid */}
                <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group border-t-4 border-t-blue-500">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all duration-500"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <FiDollarSign className="text-2xl" />
                            </div>
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1">
                                <FiTrendingUp /> +2.5%
                            </span>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Total Balance</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            ${account ? parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '---'}
                        </h3>
                    </motion.div>

                    {/* Income Card */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group border-t-4 border-t-emerald-500">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <FiArrowUpRight className="text-2xl" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Total Income</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            ${account ? parseFloat(account.total_income).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </h3>
                    </motion.div>

                    {/* Expense Card */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 relative overflow-hidden group border-t-4 border-t-rose-500">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl group-hover:bg-rose-500/30 transition-all duration-500"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                                <FiArrowDownLeft className="text-2xl" />
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Total Expense</p>
                        <h3 className="text-3xl font-bold text-white mt-1">
                            ${account ? parseFloat(account.total_expense).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                        </h3>
                    </motion.div>
                </motion.div>

                {/* Analytics & Transactions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart Section */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 lg:col-span-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FiActivity className="text-blue-400" /> Financial Analytics
                                </h3>
                                <p className="text-slate-500 text-sm">Income vs Expense analysis</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm bg-slate-800/50 p-1 rounded-lg">
                                <button className="px-3 py-1 rounded-md bg-slate-700 text-white shadow-sm">Weekly</button>
                                <button className="px-3 py-1 rounded-md text-slate-400 hover:text-white transition-colors">Monthly</button>
                            </div>
                        </div>
                        <div className="h-[350px] w-full">
                            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height="100%" />
                        </div>
                    </motion.div>

                    {/* Recent Transactions Section */}
                    <motion.div variants={itemVariants} className="glass-panel p-6 flex flex-col h-full">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <FiCreditCard className="text-emerald-400" /> Recent Transactions
                        </h3>

                        <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                            {account?.transactions?.slice(0, 5).map((txn, index) => (
                                <motion.div
                                    key={txn.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ${txn.transaction_type === 'DEPOSIT' ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white' :
                                                txn.transaction_type === 'WITHDRAWAL' ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white' :
                                                    'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                                            }`}>
                                            {txn.transaction_type === 'DEPOSIT' ? <FiArrowUpRight /> :
                                                txn.transaction_type === 'WITHDRAWAL' ? <FiArrowDownLeft /> : <FiCreditCard />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                                                {txn.description || txn.transaction_type}
                                            </p>
                                            <p className="text-xs text-slate-400">{new Date(txn.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${txn.transaction_type === 'DEPOSIT' ? 'text-emerald-400' : 'text-rose-400'
                                        }`}>
                                        {txn.transaction_type === 'DEPOSIT' ? '+' : '-'}${parseFloat(txn.amount).toFixed(2)}
                                    </span>
                                </motion.div>
                            ))}

                            {!account?.transactions?.length && (
                                <div className="text-center py-10 opacity-50">
                                    <FiPieChart className="text-4xl mx-auto mb-2 text-slate-600" />
                                    <p className="text-slate-500">No recent transactions</p>
                                </div>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full mt-6 py-3 text-sm font-medium text-slate-300 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                        >
                            View All Transactions <FiArrowUpRight />
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>

            {/* Transfer Modal - Enhanced */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="glass-panel w-full max-w-md p-0 overflow-hidden shadow-2xl shadow-blue-900/20"
                    >
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FiSend /> Quick Transfer
                            </h2>
                            <p className="text-blue-100 text-sm mt-1">Send money securely to another account</p>
                        </div>

                        <form onSubmit={handleTransfer} className="p-6 space-y-5">
                            <div>
                                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Recipient Account Number</label>
                                <div className="relative">
                                    <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="text"
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                                        placeholder="Enter account number"
                                        value={recipientAccount}
                                        onChange={(e) => setRecipientAccount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Amount</label>
                                <div className="relative">
                                    <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                    <input
                                        type="number"
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600"
                                        placeholder="0.00"
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-slate-300 text-sm font-medium mb-1.5 block">Description (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-800 transition-all placeholder:text-slate-600 resize-none h-24"
                                    placeholder="What's this for?"
                                    value={transferDescription}
                                    onChange={(e) => setTransferDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="flex-1 py-3 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded-xl text-white font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <FiSend /> Send Money
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Dashboard;
