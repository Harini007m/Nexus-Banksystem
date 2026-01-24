import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiX, FiCheck, FiDollarSign, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';

const Navbar = () => {
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // Fetch recent transactions as notifications
            const response = await api.get('/accounts/balance/');
            const transactions = response.data.transactions || [];

            // Convert recent transactions to notifications format
            const notifs = transactions.slice(0, 5).map((tx, index) => ({
                id: index,
                type: tx.transaction_type,
                message: tx.description || `${tx.transaction_type} of $${parseFloat(tx.amount).toFixed(2)}`,
                amount: tx.amount,
                time: new Date(tx.created_at).toLocaleString(),
                read: false
            }));

            setNotifications(notifs);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (showNotifications) {
            fetchNotifications();
        }
    }, [showNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'DEPOSIT': return <FiDollarSign className="text-green-400" />;
            case 'WITHDRAWAL': return <FiArrowRight className="text-red-400" />;
            case 'TRANSFER': return <FiArrowRight className="text-blue-400" />;
            default: return <FiTrendingUp className="text-purple-400" />;
        }
    };

    const getNotificationStyle = (type) => {
        switch (type) {
            case 'DEPOSIT': return 'bg-green-500/10 border-green-500/20';
            case 'WITHDRAWAL': return 'bg-red-500/10 border-red-500/20';
            case 'TRANSFER': return 'bg-blue-500/10 border-blue-500/20';
            default: return 'bg-purple-500/10 border-purple-500/20';
        }
    };

    return (
        <div className="h-20 px-8 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
                Welcome back, {user?.first_name || 'User'}
            </h2>

            <div className="flex items-center gap-6">
                {/* Notification Bell */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <FiBell className="text-xl" />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
                                <h3 className="text-white font-semibold">Notifications</h3>
                                <button
                                    onClick={() => setShowNotifications(false)}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="p-6 text-center text-slate-400">
                                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        Loading...
                                    </div>
                                ) : notifications.length > 0 ? (
                                    <div className="divide-y divide-slate-700/30">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 hover:bg-slate-700/20 transition-colors border-l-2 ${getNotificationStyle(notif.type)}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${getNotificationStyle(notif.type)}`}>
                                                        {getNotificationIcon(notif.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-white font-medium truncate">
                                                            {notif.type === 'DEPOSIT' && '💰 '}
                                                            {notif.type === 'WITHDRAWAL' && '💸 '}
                                                            {notif.type === 'TRANSFER' && '↔️ '}
                                                            {notif.message}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                                                    </div>
                                                    <span className={`text-sm font-semibold ${notif.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                                                        {notif.type === 'DEPOSIT' ? '+' : '-'}${parseFloat(notif.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <FiBell className="text-4xl text-slate-600 mx-auto mb-3" />
                                        <p className="text-slate-400 text-sm">No notifications yet</p>
                                        <p className="text-slate-500 text-xs mt-1">Your recent activities will appear here</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-slate-700/50 text-center">
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        View All Transactions →
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-6 border-l border-slate-700/50">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-white">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-slate-400">{user?.role === 'ADMIN' ? 'Administrator' : 'Premium Member'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
