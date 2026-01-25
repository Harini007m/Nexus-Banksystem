import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            // Redirect based on role
            if (user.is_officer) {
                navigate('/officer');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

                {/* Back to Home */}
                <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
                    <FiArrowLeft /> Back to Home
                </Link>

                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nexus</h2>
                <p className="text-slate-400 text-center mb-8">Welcome back, please login.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 flex items-center gap-2">
                        <FiAlertCircle /> <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email Address</label>
                        <div className="relative">
                            <FiMail className="absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="email"
                                className="input-field pl-11"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="password"
                                className="input-field pl-11"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <p className="text-center text-slate-400 text-sm">
                        Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Create Account</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
