import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiDollarSign, FiTruck, FiBriefcase, FiBook, FiUser,
    FiCheckCircle, FiPhone, FiMail, FiMapPin, FiArrowRight,
    FiShield, FiClock, FiPercent, FiUsers, FiAward, FiChevronRight
} from 'react-icons/fi';
import api from '../api/axios';

const LandingPage = () => {
    const [bankInfo, setBankInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);

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

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getLoanIcon = (type) => {
        const icons = {
            PERSONAL: <FiUser className="text-3xl" />,
            HOME: <FiHome className="text-3xl" />,
            VEHICLE: <FiTruck className="text-3xl" />,
            BUSINESS: <FiBriefcase className="text-3xl" />,
            EDUCATION: <FiBook className="text-3xl" />,
        };
        return icons[type] || <FiDollarSign className="text-3xl" />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-b-4 border-purple-500 border-solid rounded-full animate-spin-reverse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-slate-300 selection:bg-blue-500/30 selection:text-blue-200">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel m-4 mt-2 py-3 px-6' : 'bg-transparent py-6 px-8'}`}>
                <div className={`max-w-7xl mx-auto flex justify-between items-center ${scrolled ? '' : 'border-b border-white/5 pb-6'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <FiDollarSign className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">
                            Nexus<span className="text-blue-400">Bank</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {['Loans', 'Process', 'Contact'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-white transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium hover:text-white transition-colors">Sign In</Link>
                        <Link to="/register" className="btn-primary py-2 px-5 text-sm rounded-lg">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-4 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="text-left"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                            Next Gen Banking is Here
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                            Banking for the <br />
                            <span className="text-gradient">Modern Era</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                            Experience the future of finance with Nexus Bank. Instant loans, secure transactions, and 24/7 support—all at your fingertips.
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            <Link to="/register" className="btn-primary flex items-center justify-center gap-2 group">
                                Apply for Loan <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#loans" className="btn-secondary flex items-center justify-center gap-2">
                                Explore Products
                            </a>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-12 flex items-center gap-8">
                            <div>
                                <h4 className="text-3xl font-bold text-white">{bankInfo?.customers || '1M+'}</h4>
                                <p className="text-sm text-slate-400">Trusted Users</p>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div>
                                <h4 className="text-3xl font-bold text-white">{bankInfo?.branches || '150+'}</h4>
                                <p className="text-sm text-slate-400">Global Branches</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 glass-card p-8 rounded-3xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-slate-400 text-sm">Total Balance</p>
                                    <h3 className="text-3xl font-bold text-white mt-1">$42,593.00</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                                    <FiDollarSign className="text-2xl text-white" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${i === 1 ? 'bg-green-500/20 text-green-400' : i === 2 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                                            {i === 1 ? <FiArrowRight /> : i === 2 ? <FiHome /> : <FiUser />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Transaction #{i}42</p>
                                            <p className="text-xs text-slate-400">Just now</p>
                                        </div>
                                        <p className={`font-semibold ${i === 1 ? 'text-green-400' : 'text-white'}`}>
                                            {i === 1 ? '+' : '-'}${(Math.random() * 1000).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Decorative floating cards */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -top-10 -right-10 glass-panel p-4 rounded-2xl z-20 w-48"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                    <FiCheckCircle className="text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Loan Status</p>
                                    <p className="text-sm font-bold text-white">Approved</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Loan Types Section */}
            <section id="loans" className="py-24 px-4 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-blue-400 font-medium tracking-wide uppercase text-sm">Our Products</span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4">Tailored Financial Solutions</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">Choose from our wide range of loan products designed to meet your personal and business needs with competitive rates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {bankInfo?.loan_types?.map((loan, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-8 rounded-3xl group"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {getLoanIcon(loan.type)}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{loan.name}</h3>
                                <p className="text-slate-400 mb-6 line-clamp-2">{loan.description}</p>

                                <div className="space-y-3 mb-8">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-500 text-sm">Interest Rate</span>
                                        <span className="text-green-400 font-semibold">{loan.interest_rate}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-slate-500 text-sm">Max Amount</span>
                                        <span className="text-white font-semibold">{loan.max_amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-slate-500 text-sm">Tenure</span>
                                        <span className="text-slate-300">{loan.tenure}</span>
                                    </div>
                                </div>

                                <Link to="/register" className="w-full py-3 rounded-xl bg-white/5 text-center text-white font-medium block hover:bg-blue-600 hover:text-white transition-all">
                                    Apply Now
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section id="process" className="py-24 px-4 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-blue-400 font-medium tracking-wide uppercase text-sm">How It Works</span>
                            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-6">Simple, Fast & <br />Transparent Process</h2>
                            <p className="text-slate-400 mb-8">
                                extensive documentation and long waiting periods are a thing of the past.
                                Get your loan approved in 4 simple steps.
                            </p>

                            <div className="space-y-6">
                                {bankInfo?.loan_process?.map((step, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold bg-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                {step.step}
                                            </div>
                                            {index !== bankInfo.loan_process.length - 1 && (
                                                <div className="w-px h-full bg-blue-500/20 my-2 group-hover:bg-blue-500/50 transition-colors"></div>
                                            )}
                                        </div>
                                        <div className="pb-8">
                                            <h4 className="text-xl font-bold text-white mb-2">{step.title}</h4>
                                            <p className="text-slate-400 text-sm mb-2">{step.description}</p>
                                            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                                                By: {step.officer}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-[100px] -z-10"></div>
                            <div className="grid gap-6">
                                {['Quick Application', 'Document Upload', 'Verification', 'Disbursement'].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.2 }}
                                        className="glass-panel p-6 flex items-center gap-4 border-l-4 border-l-blue-500"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <FiCheckCircle className="text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white">{item}</h3>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Eligibility & Documents */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/10 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>

                        <div className="grid lg:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8">Eligibility Criteria</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Age Requirement', value: `${bankInfo?.eligibility?.min_age} - ${bankInfo?.eligibility?.max_age} years` },
                                        { label: 'Minimum Income', value: bankInfo?.eligibility?.min_income },
                                        { label: 'CIBIL Score', value: `${bankInfo?.eligibility?.min_cibil}+` },
                                        { label: 'Employment Status', value: bankInfo?.eligibility?.employment },
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className="text-white font-medium">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-bold text-white mb-8">Required Documents</h2>
                                <div className="space-y-3">
                                    {bankInfo?.required_documents?.map((doc, index) => (
                                        <div key={index} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                                                <FiCheckCircle />
                                            </div>
                                            <span className="text-slate-300">{doc}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link to="/register" className="mt-10 btn-primary w-full flex items-center justify-center gap-2">
                                    <FiShield /> Check Your Eligibility Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-4">
                <div className="max-w-7xl mx-auto text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
                </div>
                <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
                    {[
                        { icon: <FiPhone />, title: 'Phone', value: bankInfo?.contact?.phone },
                        { icon: <FiMail />, title: 'Email', value: bankInfo?.contact?.email },
                        { icon: <FiMapPin />, title: 'Visit Us', value: bankInfo?.contact?.address }
                    ].map((item, index) => (
                        <div key={index} className="glass-panel p-8 text-center hover:-translate-y-2 transition-transform duration-300">
                            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-2xl mx-auto mb-4">
                                {item.icon}
                            </div>
                            <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-sm">{item.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-white/5 bg-slate-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                            <FiDollarSign />
                        </div>
                        <span className="text-xl font-bold text-white">Nexus Bank</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Nexus Bank. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        {['Privacy', 'Terms', 'Security'].map(item => (
                            <a key={item} href="#" className="text-slate-500 hover:text-white transition-colors text-sm">{item}</a>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
