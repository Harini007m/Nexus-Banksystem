import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../api/axios';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTxns = async () => {
            const res = await api.get('/accounts/balance/'); // Balance endpoint includes transactions
            setTransactions(res.data.transactions);
        };
        fetchTxns();
    }, []);

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold text-white mb-8">Transaction History</h1>
            <div className="glass-panel p-0 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase font-medium text-slate-300">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                        {transactions.map((txn) => (
                            <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">{new Date(txn.timestamp).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${txn.transaction_type === 'DEPOSIT' ? 'bg-green-500/20 text-green-400' :
                                            txn.transaction_type === 'WITHDRAWAL' ? 'bg-red-500/20 text-red-400' :
                                                'bg-blue-500/20 text-blue-400'
                                        }`}>
                                        {txn.transaction_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{txn.description || '-'}</td>
                                <td className={`px-6 py-4 text-right font-medium ${txn.transaction_type === 'DEPOSIT' ? 'text-green-400' : 'text-white'
                                    }`}>
                                    {txn.transaction_type === 'DEPOSIT' ? '+' : '-'}${parseFloat(txn.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-slate-500">{txn.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
