import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiDollarSign, FiCreditCard, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout } = useAuth();

    const links = [
        { name: 'Dashboard', path: '/', icon: FiHome },
        { name: 'Transactions', path: '/transactions', icon: FiDollarSign }, // To be implemented
        { name: 'Loans', path: '/loans', icon: FiCreditCard }, // To be implemented
        { name: 'Investments', path: '/investments', icon: FiTrendingUp }, // To be implemented
        // { name: 'Settings', path: '/settings', icon: FiSettings },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="h-screen w-64 glass-panel m-4 flex flex-col fixed left-0 top-0 hidden md:flex border-r-0">
            <div className="p-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nexus</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(link.path)
                                ? 'bg-blue-600 shadow-lg shadow-blue-500/30 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <link.icon className="text-lg" />
                        <span className="font-medium">{link.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700/50">
                <button
                    onClick={logout}
                    className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors"
                >
                    <FiLogOut className="text-lg" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
