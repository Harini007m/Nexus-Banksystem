import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiHome, FiDollarSign, FiTruck, FiBriefcase, FiBook, FiUser,
    FiCheckCircle, FiPhone, FiMail, FiMapPin, FiArrowRight,
    FiShield, FiClock, FiPercent, FiUsers, FiAward
} from 'react-icons/fi';
import api from '../api/axios';

const LandingPage = () => {
    const [bankInfo, setBankInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBankInfo = async () => {
            try {
                const response = await api.get('/users/bank-info/');
                setBankInfo(response.data);
            } catch (error) {
                console.error('Failed to fetch bank info', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBankInfo();
    }, []);

    const getLoanIcon = (type) => {
        const icons = {
            PERSONAL: <FiUser className="text-2xl" />,
            HOME: <FiHome className="text-2xl" />,
            VEHICLE: <FiTruck className="text-2xl" />,
            BUSINESS: <FiBriefcase className="text-2xl" />,
            EDUCATION: <FiBook className="text-2xl" />,
        };
        return icons[type] || <FiDollarSign className="text-2xl" />;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <FiDollarSign className="text-white text-xl" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Nexus Bank
                            </span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#loans" className="text-slate-300 hover:text-white transition-colors">Loans</a>
                            <a href="#process" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
                            <a href="#contact" className="text-slate-300 hover:text-white transition-colors">Contact</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-slate-300 hover:text-white px-4 py-2 transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Your Trusted <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Financial Partner</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Experience seamless banking with Nexus. Apply for loans, track your applications, and manage your finances all in one place.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                            Apply for Loan <FiArrowRight />
                        </Link>
                        <a href="#loans" className="bg-slate-700/50 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-600/50 transition-all border border-slate-600">
                            Explore Products
                        </a>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                        <div className="glass-panel p-6">
                            <FiUsers className="text-3xl text-blue-400 mx-auto mb-3" />
                            <p className="text-3xl font-bold text-white">{bankInfo?.customers || '1M+'}</p>
                            <p className="text-slate-400">Customers</p>
                        </div>
                        <div className="glass-panel p-6">
                            <FiMapPin className="text-3xl text-purple-400 mx-auto mb-3" />
                            <p className="text-3xl font-bold text-white">{bankInfo?.branches || '150+'}</p>
                            <p className="text-slate-400">Branches</p>
                        </div>
                        <div className="glass-panel p-6">
                            <FiAward className="text-3xl text-green-400 mx-auto mb-3" />
                            <p className="text-3xl font-bold text-white">4.8★</p>
                            <p className="text-slate-400">Customer Rating</p>
                        </div>
                        <div className="glass-panel p-6">
                            <FiClock className="text-3xl text-yellow-400 mx-auto mb-3" />
                            <p className="text-3xl font-bold text-white">24hrs</p>
                            <p className="text-slate-400">Quick Approval</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Loan Types Section */}
            <section id="loans" className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Loan Products</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Choose from our wide range of loan products designed to meet your every need</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bankInfo?.loan_types?.map((loan, index) => (
                            <div key={index} className="glass-panel p-6 hover:border-blue-500/50 border border-transparent transition-all group">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                                    {getLoanIcon(loan.type)}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">{loan.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">{loan.description}</p>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Interest Rate</span>
                                        <span className="text-green-400">{loan.interest_rate}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Max Amount</span>
                                        <span className="text-white">{loan.max_amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Tenure</span>
                                        <span className="text-slate-300">{loan.tenure}</span>
                                    </div>
                                </div>
                                <Link to="/register" className="mt-4 w-full block text-center py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                    Apply Now →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Loan Process Section */}
            <section id="process" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Our streamlined 4-step process ensures quick and transparent loan approval</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bankInfo?.loan_process?.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="glass-panel p-6 h-full">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                                        {step.step}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                                    <p className="text-slate-400 text-sm mb-3">{step.description}</p>
                                    <p className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded inline-block">
                                        {step.officer}
                                    </p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-slate-600">
                                        <FiArrowRight className="text-2xl" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Eligibility Section */}
            <section className="py-20 px-4 bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Eligibility Criteria</h2>
                            <p className="text-slate-400 mb-8">Check if you meet our basic eligibility requirements to apply for a loan</p>

                            <div className="space-y-4">
                                {[
                                    { label: 'Age', value: `${bankInfo?.eligibility?.min_age} - ${bankInfo?.eligibility?.max_age} years` },
                                    { label: 'Minimum Income', value: bankInfo?.eligibility?.min_income },
                                    { label: 'Credit Score', value: `${bankInfo?.eligibility?.min_cibil}+` },
                                    { label: 'Employment', value: bankInfo?.eligibility?.employment },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 glass-panel p-4">
                                        <FiCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                                        <div className="flex-1 flex justify-between">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className="text-white font-medium">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Required Documents</h3>
                            <div className="glass-panel p-6 space-y-4">
                                {bankInfo?.required_documents?.map((doc, index) => (
                                    <div key={index} className="flex items-center gap-3 pb-3 border-b border-slate-700/50 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                            {index + 1}
                                        </div>
                                        <span className="text-slate-300">{doc}</span>
                                    </div>
                                ))}
                            </div>

                            <Link to="/register" className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                                <FiShield /> Check Your Eligibility
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Us</h2>
                        <p className="text-slate-400">Have questions? We're here to help</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 text-center">
                            <FiPhone className="text-3xl text-blue-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
                            <p className="text-slate-400">{bankInfo?.contact?.phone}</p>
                        </div>
                        <div className="glass-panel p-6 text-center">
                            <FiMail className="text-3xl text-purple-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
                            <p className="text-slate-400">{bankInfo?.contact?.email}</p>
                        </div>
                        <div className="glass-panel p-6 text-center">
                            <FiMapPin className="text-3xl text-green-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
                            <p className="text-slate-400">{bankInfo?.contact?.address}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-4 border-t border-slate-700/50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <FiDollarSign className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">Nexus Bank</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Nexus Bank. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
