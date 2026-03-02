import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiDollarSign, FiCreditCard, FiTrendingUp, FiLogOut, FiFileText, FiUsers, FiShield, FiCheckSquare, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ mobileOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Customer navigation links
    const customerLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: FiHome },
        { name: 'Transactions', path: '/transactions', icon: FiDollarSign },
        { name: 'Loans', path: '/loans', icon: FiCreditCard },
        { name: 'Investments', path: '/investments', icon: FiTrendingUp },
    ];

    // Officer navigation links
    const officerLinks = [
        { name: 'My Queue', path: '/officer', icon: FiFileText },
    ];

    // Get role-specific icon
    const getRoleIcon = () => {
        switch (user?.role) {
            case 'APPLICATION_OFFICER': return FiUsers;
            case 'CREDIT_OFFICER': return FiShield;
            case 'LEGAL_OFFICER': return FiCheckSquare;
            case 'DISBURSEMENT_MANAGER': return FiDollarSign;
            default: return FiHome;
        }
    };

    const links = user?.is_officer ? officerLinks : customerLinks;

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/home');
    };

    const handleLinkClick = () => {
        // Close mobile sidebar when a link is clicked
        if (onClose) onClose();
    };

    const RoleIcon = getRoleIcon();

    return (
        <>
            {/* Mobile overlay backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <div
                className={`
                    h-screen w-64 glass-panel flex flex-col fixed left-0 top-0 z-50 border-r-0
                    transition-transform duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:flex md:m-4 md:h-[calc(100vh-2rem)]
                `}
            >
                {/* Logo + mobile close button */}
                <div className="p-8 flex items-center justify-between">
                    <Link
                        to="/"
                        onClick={handleLinkClick}
                        className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    >
                        Nexus
                    </Link>
                    {/* Close button — mobile only */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700/50"
                        aria-label="Close menu"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                {/* Role Badge for Officers */}
                {user?.is_officer && (
                    <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <RoleIcon className="text-white" />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">{user?.role_display}</p>
                                <p className="text-slate-500 text-xs">{user?.employee_id}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2">
                    {links.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            onClick={handleLinkClick}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${isActive(link.path)
                                ? 'bg-blue-600 shadow-lg shadow-blue-500/30 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <link.icon className="text-lg" />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    ))}

                    {/* Customer can view public site */}
                    {!user?.is_officer && (
                        <Link
                            to="/"
                            onClick={handleLinkClick}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <FiHome className="text-lg" />
                            <span className="font-medium">Visit Website</span>
                        </Link>
                    )}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-700/50">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {user?.first_name?.[0]}{user?.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-4 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                    >
                        <FiLogOut className="text-lg" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
