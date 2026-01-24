import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FiCheck } from 'react-icons/fi';

const Investments = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState([]);
    const [myInvestments, setMyInvestments] = useState([]);
    const [allInvestments, setAllInvestments] = useState([]); // For admin
    const [activeTab, setActiveTab] = useState('plans');

    const fetchData = async () => {
        const plansRes = await api.get('/investments/plans/');
        setPlans(plansRes.data);

        const myRes = await api.get('/investments/my-investments/');
        setMyInvestments(myRes.data);

        // If admin, fetch all investments (we'll use the same endpoint but backend shows all for admin)
        // For now, we'll just show my-investments for both but add admin actions
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInvest = async (planId, minAmount) => {
        const amount = prompt(`Enter amount to invest (Min: ${minAmount})`, minAmount);
        if (amount) {
            try {
                await api.post('/investments/invest/', {
                    plan_id: planId,
                    amount: amount
                });
                alert('Investment successful!');
                fetchData();
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

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Investments</h1>
                    <p className="text-slate-400">Grow your wealth with our plans.</p>
                </div>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-700/50 pb-1">
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'plans' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                    Available Plans
                </button>
                <button
                    onClick={() => setActiveTab('my-investments')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'my-investments' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white'}`}
                >
                    My Portfolio
                </button>
            </div>

            {activeTab === 'plans' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="glass-panel p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                            <p className="text-slate-400 text-sm mb-4 flex-1">{plan.description}</p>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500">Interest</p>
                                    <p className="text-lg font-bold text-green-400">{plan.interest_rate}%</p>
                                </div>
                                <div className="bg-slate-800/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500">Duration</p>
                                    <p className="text-lg font-bold text-white">{plan.duration_months} Mo</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleInvest(plan.id, plan.min_amount)}
                                className="w-full btn-primary py-2 text-sm"
                            >
                                Invest Now
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel p-0 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800/50 text-xs uppercase font-medium text-slate-300">
                            <tr>
                                <th className="px-6 py-4">Plan Name</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Maturity Date</th>
                                {user?.role === 'ADMIN' && <th className="px-6 py-4">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {myInvestments.map((inv) => (
                                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{inv.plan_details.name}</td>
                                    <td className="px-6 py-4">${parseFloat(inv.amount).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs ${inv.status === 'COMPLETED'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-green-500/20 text-green-400'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{inv.maturity_date}</td>
                                    {user?.role === 'ADMIN' && (
                                        <td className="px-6 py-4">
                                            {inv.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => handleMatureInvestment(inv.id)}
                                                    className="flex items-center gap-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1 rounded-lg text-xs transition-colors"
                                                >
                                                    <FiCheck /> Mature
                                                </button>
                                            )}
                                            {inv.status === 'COMPLETED' && (
                                                <span className="text-slate-500 text-xs">Completed</span>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Investments;
