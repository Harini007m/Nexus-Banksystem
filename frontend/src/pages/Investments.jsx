import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiTrendingUp, FiPieChart, FiActivity, FiClock, FiDollarSign, FiHexagon, FiShield, FiAward } from 'react-icons/fi';

const Investments = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [myInvestments, setMyInvestments] = useState([]);
    const [activeTab, setActiveTab] = useState('plans');
    const [totalInvested, setTotalInvested] = useState(0);

    const fetchData = async () => {
        try {
            const plansRes = await api.get('/investments/plans/');
            setPlans(plansRes.data);

            const myRes = await api.get('/investments/my-investments/');
            setMyInvestments(myRes.data);

            // Calculate total invested
            const total = myRes.data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            setTotalInvested(total);
        } catch (err) {
            console.error("Failed to fetch investment data", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvest = async (planId, minAmount) => {
        const amount = prompt(`Enter amount to invest (Min: $${minAmount})`, minAmount);
        if (amount) {
            try {
                await api.post('/investments/invest/', {
                    plan_id: planId,
                    amount: amount
                });
                alert('Investment successful!');
                fetchData();
                setActiveTab('my-investments');
            } catch (error) {
                alert('Investment failed: ' + (error.response?.data?.error || 'Unknown error'));
            }
        }
    };

    const handleMatureInvestment = async (investmentId) => {
        if (!confirm('Are you sure you want to mature this investment? This will credit returns to the user.')) {
            return;
        }
        try {
            const res = await api.post(`/investments/${investmentId}/mature/`);
            alert(`Investment matured!\nPrincipal: $${res.data.principal}\nInterest: $${res.data.interest}\nTotal Credited: $${res.data.total_return}`);
            fetchData();
        } catch (error) {
            alert('Failed to mature investment: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    const getPlanIcon = (name) => {
        if (name.toLowerCase().includes('gold')) return <div className="text-yellow-400 bg-yellow-400/20 p-3 rounded-full"><FiHexagon className="text-2xl" /></div>;
        if (name.toLowerCase().includes('platinum')) return <div className="text-slate-300 bg-slate-400/20 p-3 rounded-full"><FiShield className="text-2xl" /></div>;
        return <div className="text-blue-400 bg-blue-400/20 p-3 rounded-full"><FiAward className="text-2xl" /></div>;
    };

    const getPlanColor = (name) => {
        if (name.toLowerCase().includes('gold')) return 'border-yellow-500/50 shadow-yellow-500/20';
        if (name.toLowerCase().includes('platinum')) return 'border-slate-400/50 shadow-slate-400/20';
        return 'border-blue-500/50 shadow-blue-500/20';
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <DashboardLayout>
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-8"
            >
                {/* Header Profile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                            Wealth Management
                        </h1>
                        <p className="text-slate-400">Grow your portfolio with our secure plans.</p>
                    </div>

                    {/* Portfolio Summary Pill */}
                    <div className="glass-panel px-6 py-2 flex items-center gap-4 border border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-center gap-2">
                            <FiActivity className="text-emerald-400" />
                            <span className="text-slate-400 text-sm">Total Invested</span>
                        </div>
                        <span className="text-2xl font-bold text-white">${totalInvested.toLocaleString()}</span>
                    </div>
                </div>

                {/* Custom Tab Switcher */}
                <div className="flex justify-center mb-8">
                    <div className="glass-panel p-1 flex gap-1 rounded-xl">
                        {['plans', 'my-investments'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 z-10
                                    ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'}
                                `}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-600 rounded-lg shadow-lg"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-2">
                                    {tab === 'plans' ? <FiTrendingUp /> : <FiPieChart />}
                                    {tab === 'plans' ? 'Available Plans' : 'My Portfolio'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'plans' ? (
                        <motion.div
                            key="plans"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-6"
                        >
                            {plans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className={`glass-panel p-6 flex flex-col relative overflow-hidden border-t-4 ${getPlanColor(plan.name)}`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl -mr-10 -mt-10"></div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            {getPlanIcon(plan.name)}
                                        </div>
                                        <span className="text-xs font-bold bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-slate-300">
                                            {plan.duration_months} Months
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm mb-6 flex-1 relative z-10 leading-relaxed">{plan.description}</p>

                                    <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                            <p className="text-xs text-slate-500 mb-1">Interest Rate</p>
                                            <p className="text-lg font-bold text-emerald-400">{plan.interest_rate}%</p>
                                        </div>
                                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                                            <p className="text-xs text-slate-500 mb-1">Min. Amount</p>
                                            <p className="text-lg font-bold text-white">${plan.min_amount}</p>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleInvest(plan.id, plan.min_amount)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-blue-500/20 transition-all relative z-10"
                                    >
                                        Invest Now
                                    </motion.button>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="portfolio"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel p-0 overflow-hidden"
                        >
                            <div className="p-6 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <FiPieChart className="text-blue-400" /> Your Active Investments
                                </h3>
                                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Download Report</button>
                            </div>

                            {myInvestments.length === 0 ? (
                                <div className="text-center py-16">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 text-3xl">
                                        <FiTrendingUp />
                                    </div>
                                    <h3 className="text-white font-medium mb-1">No investments yet</h3>
                                    <p className="text-slate-500 text-sm">Start your wealth journey today!</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-800/80 text-xs uppercase font-medium text-slate-300">
                                        <tr>
                                            <th className="px-6 py-4">Plan Name</th>
                                            <th className="px-6 py-4">Amount Invested</th>
                                            <th className="px-6 py-4">Current Status</th>
                                            <th className="px-6 py-4">Maturity Date</th>
                                            {user?.role === 'ADMIN' && <th className="px-6 py-4">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {myInvestments.map((inv, index) => (
                                            <motion.tr
                                                key={inv.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-white/5 transition-colors group"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="text-white font-medium block">{inv.plan_details.name}</span>
                                                    <span className="text-xs text-slate-500">{inv.plan_details.interest_rate}% Return</span>
                                                </td>
                                                <td className="px-6 py-4 text-white font-mono">${parseFloat(inv.amount).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 w-fit ${inv.status === 'COMPLETED'
                                                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${inv.status === 'COMPLETED' ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 flex items-center gap-2">
                                                    <FiClock className="text-slate-600" />
                                                    {inv.maturity_date}
                                                </td>
                                                {user?.role === 'ADMIN' && (
                                                    <td className="px-6 py-4">
                                                        {inv.status === 'ACTIVE' && (
                                                            <button
                                                                onClick={() => handleMatureInvestment(inv.id)}
                                                                className="flex items-center gap-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-emerald-500/20"
                                                            >
                                                                <FiCheck /> Mature Now
                                                            </button>
                                                        )}
                                                    </td>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </DashboardLayout>
    );
};

export default Investments;
