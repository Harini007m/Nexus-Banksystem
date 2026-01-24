import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return;
        }

        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-lg p-8">
                <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nexus</h2>
                <p className="text-slate-400 text-center mb-8">Join the future of banking.</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FiUser className="absolute left-4 top-3.5 text-slate-400" />
                            <input
                                type="text"
                                name="first_name"
                                className="input-field pl-11"
                                placeholder="First Name"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                name="last_name"
                                className="input-field px-4"
                                placeholder="Last Name"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <FiMail className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            className="input-field pl-11"
                            placeholder="Email Address"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="relative">
                        <FiPhone className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            type="text"
                            name="phone_number"
                            className="input-field pl-11"
                            placeholder="Phone Number"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="relative">
                        <FiLock className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            type="password"
                            name="password"
                            className="input-field pl-11"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="relative">
                        <FiLock className="absolute left-4 top-3.5 text-slate-400" />
                        <input
                            type="password"
                            name="confirm_password"
                            className="input-field pl-11"
                            placeholder="Confirm Password"
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary mt-6">
                        Create Account
                    </button>

                    <p className="text-center text-slate-400 text-sm mt-4">
                        Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign In</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
