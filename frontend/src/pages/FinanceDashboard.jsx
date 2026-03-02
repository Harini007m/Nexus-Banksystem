import { useState, useEffect, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    FiPlus, FiTrash2, FiEdit2, FiCheck, FiX,
    FiTrendingUp, FiTrendingDown, FiTarget,
    FiPieChart, FiBarChart2, FiAlertCircle,
    FiDollarSign, FiHome, FiCoffee, FiShoppingCart,
    FiZap, FiWifi, FiBook, FiHeart, FiMoreHorizontal,
    FiCreditCard, FiInfo,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────── */
const CATEGORY_ICONS = {
    Salary: { icon: FiDollarSign, color: '#22c55e' },
    Freelance: { icon: FiTrendingUp, color: '#34d399' },
    Business: { icon: FiBarChart2, color: '#10b981' },
    'Side Income': { icon: FiPieChart, color: '#6ee7b7' },
    Other: { icon: FiMoreHorizontal, color: '#94a3b8' },
    Rent: { icon: FiHome, color: '#f97316' },
    Food: { icon: FiCoffee, color: '#fb923c' },
    Groceries: { icon: FiShoppingCart, color: '#fbbf24' },
    Electricity: { icon: FiZap, color: '#facc15' },
    Internet: { icon: FiWifi, color: '#a78bfa' },
    Education: { icon: FiBook, color: '#60a5fa' },
    Health: { icon: FiHeart, color: '#f43f5e' },
    Travel: { icon: FiTrendingUp, color: '#38bdf8' },
    EMI: { icon: FiCreditCard, color: '#e879f9' },
    Subscriptions: { icon: FiWifi, color: '#818cf8' },
    Shopping: { icon: FiShoppingCart, color: '#fb7185' },
};

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Business', 'Side Income', 'Other'];
const EXPENSE_CATEGORIES = ['Rent', 'Food', 'Groceries', 'Electricity', 'Internet', 'Education', 'Health', 'Travel', 'EMI', 'Subscriptions', 'Shopping', 'Other'];

const STORAGE_KEY = 'nexus_finance_dashboard';

const defaultData = () => ({
    incomes: [
        { id: 1, category: 'Salary', label: 'Monthly Salary', amount: 0, type: 'fixed' },
        { id: 2, category: 'Freelance', label: 'Freelance / Part-time', amount: 0, type: 'variable' },
    ],
    expenses: [
        { id: 1, category: 'Rent', label: 'Rent / Mortgage', amount: 0, type: 'fixed' },
        { id: 2, category: 'Food', label: 'Food & Dining', amount: 0, type: 'variable' },
        { id: 3, category: 'Groceries', label: 'Groceries', amount: 0, type: 'variable' },
        { id: 4, category: 'EMI', label: 'EMI Payments', amount: 0, type: 'emi' },
        { id: 5, category: 'Electricity', label: 'Electricity', amount: 0, type: 'fixed' },
        { id: 6, category: 'Internet', label: 'Internet / Phone', amount: 0, type: 'fixed' },
    ],
});

/* ─────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────── */
const uid = () => Date.now() + Math.random();
const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct = (part, total) => total === 0 ? 0 : Math.round((part / total) * 100);

const FOIR_LABEL = (foir) => {
    if (foir < 30) return { text: 'Excellent', color: '#22c55e' };
    if (foir < 45) return { text: 'Good', color: '#84cc16' };
    if (foir < 55) return { text: 'Moderate', color: '#f59e0b' };
    return { text: 'High Risk', color: '#ef4444' };
};

/* ─────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────── */

/* ── Editable row ── */
const ItemRow = ({ item, categories, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState({ ...item });
    const cfg = CATEGORY_ICONS[item.category] || CATEGORY_ICONS['Other'];
    const Icon = cfg.icon;

    const save = () => {
        onUpdate({ ...draft, amount: parseFloat(draft.amount) || 0 });
        setEditing(false);
    };
    const cancel = () => { setDraft({ ...item }); setEditing(false); };

    if (editing) return (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/60 rounded-xl border border-blue-500/30">
            <select
                value={draft.category}
                onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
                type="text"
                value={draft.label}
                onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                placeholder="Label"
                className="flex-1 min-w-[120px] bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                    type="number"
                    min="0"
                    value={draft.amount}
                    onChange={e => setDraft(d => ({ ...d, amount: e.target.value }))}
                    className="w-32 bg-slate-900/80 border border-slate-700 rounded-lg pl-7 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
            </div>
            <select
                value={draft.type}
                onChange={e => setDraft(d => ({ ...d, type: e.target.value }))}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
                <option value="emi">EMI</option>
            </select>
            <button onClick={save} className="p-1.5 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"><FiCheck className="text-white text-sm" /></button>
            <button onClick={cancel} className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><FiX className="text-slate-300 text-sm" /></button>
        </div>
    );

    return (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.color + '22' }}>
                <Icon style={{ color: cfg.color }} className="text-sm" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium truncate">{item.label}</p>
                <p className="text-slate-500 text-xs capitalize">{item.category} · {item.type}</p>
            </div>
            <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">{fmt(item.amount)}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(true)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"><FiEdit2 className="text-xs" /></button>
                <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><FiTrash2 className="text-xs" /></button>
            </div>
        </div>
    );
};

/* ── Add item inline form ── */
const AddItemForm = ({ categories, onAdd, defaultType }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ category: categories[0], label: '', amount: '', type: defaultType });

    const submit = () => {
        if (!form.amount) return;
        onAdd({ id: uid(), ...form, amount: parseFloat(form.amount) || 0 });
        setForm({ category: categories[0], label: '', amount: '', type: defaultType });
        setOpen(false);
    };

    if (!open) return (
        <button
            onClick={() => setOpen(true)}
            className="w-full flex items-center gap-2 px-4 py-2.5 mt-1 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-sm"
        >
            <FiPlus /> Add item
        </button>
    );

    return (
        <div className="flex flex-wrap items-center gap-2 p-3 mt-2 bg-slate-800/60 rounded-xl border border-blue-500/30">
            <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
                type="text"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="Label (optional)"
                className="flex-1 min-w-[100px] bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                    type="number" min="0"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                    className="w-28 bg-slate-900/80 border border-slate-700 rounded-lg pl-7 pr-2 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
            </div>
            <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
                <option value="emi">EMI</option>
            </select>
            <button onClick={submit} className="px-3 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-semibold hover:bg-blue-500 transition-colors">Add</button>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 bg-slate-700 rounded-lg text-slate-300 text-xs hover:bg-slate-600 transition-colors">Cancel</button>
        </div>
    );
};

/* ─────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────── */
const FinanceDashboard = () => {
    const { user } = useAuth();

    /* ── load/save state ── */
    const [data, setData] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : defaultData();
        } catch { return defaultData(); }
    });

    /* auto-import real transactions for pre-fill suggestion */
    const [realTxns, setRealTxns] = useState({ income: 0, expense: 0 });

    useEffect(() => {
        api.get('/accounts/balance/')
            .then(res => {
                const txns = res.data.transactions || [];
                const income = txns.filter(t => t.transaction_type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
                const expense = txns.filter(t => t.transaction_type !== 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
                setRealTxns({ income, expense });
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    /* ── CRUD helpers ── */
    const addIncome = (item) => setData(d => ({ ...d, incomes: [...d.incomes, item] }));
    const addExpense = (item) => setData(d => ({ ...d, expenses: [...d.expenses, item] }));

    const updateIncome = (upd) => setData(d => ({ ...d, incomes: d.incomes.map(i => i.id === upd.id ? upd : i) }));
    const updateExpense = (upd) => setData(d => ({ ...d, expenses: d.expenses.map(e => e.id === upd.id ? upd : e) }));

    const deleteIncome = (id) => setData(d => ({ ...d, incomes: d.incomes.filter(i => i.id !== id) }));
    const deleteExpense = (id) => setData(d => ({ ...d, expenses: d.expenses.filter(e => e.id !== id) }));

    const resetAll = () => { if (confirm('Reset all data?')) setData(defaultData()); };

    /* ── Derived numbers ── */
    const totalIncome = useMemo(() => data.incomes.reduce((s, i) => s + (i.amount || 0), 0), [data.incomes]);
    const totalFixed = useMemo(() => data.expenses.filter(e => e.type === 'fixed').reduce((s, e) => s + (e.amount || 0), 0), [data.expenses]);
    const totalVariable = useMemo(() => data.expenses.filter(e => e.type === 'variable').reduce((s, e) => s + (e.amount || 0), 0), [data.expenses]);
    const totalEMI = useMemo(() => data.expenses.filter(e => e.type === 'emi').reduce((s, e) => s + (e.amount || 0), 0), [data.expenses]);
    const totalExpense = totalFixed + totalVariable + totalEMI;
    const savings = totalIncome - totalExpense;
    const savingsPct = pct(savings > 0 ? savings : 0, totalIncome);
    const foirValue = totalIncome > 0 ? Math.round((totalEMI / totalIncome) * 100) : 0;
    const foirInfo = FOIR_LABEL(foirValue);

    /* ── Pie chart data: expense by category ── */
    const expenseByCategory = useMemo(() => {
        const map = {};
        data.expenses.forEach(e => {
            if ((e.amount || 0) <= 0) return;
            map[e.category] = (map[e.category] || 0) + e.amount;
        });
        return Object.entries(map);
    }, [data.expenses]);

    const pieColors = expenseByCategory.map(([cat]) => (CATEGORY_ICONS[cat]?.color || '#94a3b8'));

    /* ── Bar chart config ── */
    const barOptions = {
        chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        plotOptions: { bar: { columnWidth: '45%', borderRadius: 6, borderRadiusApplication: 'end' } },
        colors: ['#3b82f6', '#f97316', '#22c55e'],
        xaxis: { categories: ['Fixed Expenses', 'Variable Expenses', 'EMI', 'Savings'], labels: { style: { colors: '#94a3b8', fontSize: '12px' } } },
        yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: v => '₹' + Number(v).toLocaleString('en-IN') } },
        grid: { borderColor: '#1e293b', strokeDashArray: 4 },
        tooltip: { theme: 'dark', y: { formatter: v => '₹' + Number(v).toLocaleString('en-IN') } },
        legend: { show: false },
        dataLabels: { enabled: false },
    };

    const barSeries = [{
        name: 'Amount',
        data: [totalFixed, totalVariable, totalEMI, savings > 0 ? savings : 0],
        color: undefined,
    }];

    // Override colors per bar
    const barSeriesColored = [{
        name: 'Amount',
        data: [
            { x: 'Fixed', y: totalFixed, fillColor: '#f97316' },
            { x: 'Variable', y: totalVariable, fillColor: '#fbbf24' },
            { x: 'EMI', y: totalEMI, fillColor: '#e879f9' },
            { x: 'Savings', y: savings > 0 ? savings : 0, fillColor: '#22c55e' },
        ],
    }];

    /* ── Income vs Expenses monthly bar ── */
    const incExpOptions = {
        chart: { type: 'bar', background: 'transparent', toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        plotOptions: { bar: { columnWidth: '55%', borderRadius: 6, borderRadiusApplication: 'end', grouped: true } },
        colors: ['#3b82f6', '#ef4444'],
        xaxis: { categories: ['This Month'], labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { style: { colors: '#94a3b8' }, formatter: v => '₹' + Number(v).toLocaleString('en-IN') } },
        grid: { borderColor: '#1e293b', strokeDashArray: 4 },
        tooltip: { theme: 'dark', y: { formatter: v => '₹' + Number(v).toLocaleString('en-IN') } },
        legend: { labels: { colors: '#94a3b8' } },
        dataLabels: { enabled: false },
    };
    const incExpSeries = [
        { name: 'Income', data: [totalIncome] },
        { name: 'Expenses', data: [totalExpense] },
    ];

    /* ── Pie chart options ── */
    const pieOptions = {
        chart: { type: 'donut', background: 'transparent', fontFamily: 'Inter, sans-serif' },
        labels: expenseByCategory.map(([cat]) => cat),
        colors: pieColors,
        legend: { position: 'bottom', labels: { colors: '#94a3b8' } },
        dataLabels: { style: { fontSize: '11px', colors: ['#fff'] }, dropShadow: { enabled: false } },
        plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, label: 'Total Expense', color: '#94a3b8', formatter: () => fmt(totalExpense) } } } } },
        tooltip: { theme: 'dark', y: { formatter: v => fmt(v) } },
        stroke: { colors: ['#0f172a'], width: 2 },
    };
    const pieSeries = expenseByCategory.map(([, v]) => v);

    /* ── FOIR Radial ── */
    const foirOptions = {
        chart: { type: 'radialBar', background: 'transparent', fontFamily: 'Inter, sans-serif' },
        plotOptions: {
            radialBar: {
                startAngle: -135, endAngle: 135,
                hollow: { size: '65%', background: 'transparent' },
                dataLabels: {
                    name: { show: true, fontSize: '13px', color: '#94a3b8', offsetY: 24 },
                    value: { show: true, fontSize: '28px', color: foirInfo.color, fontWeight: 700, offsetY: -10, formatter: v => v + '%' },
                },
                track: { background: '#1e293b', strokeWidth: '100%' },
            }
        },
        colors: [foirInfo.color],
        labels: [foirInfo.text],
        stroke: { lineCap: 'round' },
    };

    /* ─────────────────────────────────────────── */
    return (
        <DashboardLayout>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Income & Expenses</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Hi <span className="text-blue-400">{user?.first_name}</span>, here's your monthly financial snapshot
                    </p>
                </div>
                <button
                    onClick={resetAll}
                    className="text-xs text-slate-500 hover:text-slate-300 border border-slate-700 hover:border-slate-600 px-3 py-2 rounded-lg transition-all"
                >
                    Reset to Defaults
                </button>
            </div>

            {/* ── Banner: real txn data suggestion ── */}
            {(realTxns.income > 0 || realTxns.expense > 0) && (
                <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <FiInfo className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-400 text-sm">
                        Your bank shows&nbsp;
                        <span className="text-green-400 font-semibold">{fmt(realTxns.income)}</span> income and&nbsp;
                        <span className="text-red-400 font-semibold">{fmt(realTxns.expense)}</span> expenses from actual transactions.
                        Use this as a reference while filling your budget below.
                    </p>
                </div>
            )}

            {/* ── KPI CARDS ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Monthly Income', value: fmt(totalIncome), icon: FiTrendingUp, color: 'green', sub: `${data.incomes.length} sources` },
                    { label: 'Total Expenses', value: fmt(totalExpense), icon: FiTrendingDown, color: 'red', sub: `${data.expenses.length} items` },
                    { label: 'Savings', value: fmt(savings > 0 ? savings : 0), icon: FiTarget, color: savings >= 0 ? 'blue' : 'red', sub: `${savingsPct}% of income` },
                    { label: 'EMI Obligations', value: fmt(totalEMI), icon: FiCreditCard, color: 'purple', sub: `FOIR: ${foirValue}%` },
                ].map(card => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="glass-panel p-5 rounded-xl">
                            <div className={`w-9 h-9 rounded-xl bg-${card.color}-500/10 flex items-center justify-center mb-3`}>
                                <Icon className={`text-${card.color}-400`} />
                            </div>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{card.label}</p>
                            <p className={`text-xl font-bold text-${card.color}-400`}>{card.value}</p>
                            <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── MAIN GRID: inputs + charts ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                {/* ──────── INCOME panel ──────── */}
                <div className="glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <FiTrendingUp className="text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Income</h2>
                                <p className="text-xs text-slate-400">Total: <span className="text-green-400 font-semibold">{fmt(totalIncome)}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 mb-3">
                        {data.incomes.map(item => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                categories={INCOME_CATEGORIES}
                                onUpdate={updateIncome}
                                onDelete={deleteIncome}
                            />
                        ))}
                    </div>
                    <AddItemForm categories={INCOME_CATEGORIES} onAdd={addIncome} defaultType="fixed" />
                </div>

                {/* ──────── EXPENSE panel ──────── */}
                <div className="glass-panel rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                <FiTrendingDown className="text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-white font-semibold text-lg">Expenses</h2>
                                <p className="text-xs text-slate-400">
                                    Fixed <span className="text-orange-400">{fmt(totalFixed)}</span>
                                    &nbsp;·&nbsp;Variable <span className="text-yellow-400">{fmt(totalVariable)}</span>
                                    &nbsp;·&nbsp;EMI <span className="text-purple-400">{fmt(totalEMI)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1 mb-3 max-h-72 overflow-y-auto pr-1 custom-scroll">
                        {data.expenses.map(item => (
                            <ItemRow
                                key={item.id}
                                item={item}
                                categories={EXPENSE_CATEGORIES}
                                onUpdate={updateExpense}
                                onDelete={deleteExpense}
                            />
                        ))}
                    </div>
                    <AddItemForm categories={EXPENSE_CATEGORIES} onAdd={addExpense} defaultType="variable" />
                </div>
            </div>

            {/* ── CHARTS ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">

                {/* Pie: expense breakdown */}
                <div className="glass-panel rounded-2xl p-6 xl:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <FiPieChart className="text-purple-400" />
                        <h3 className="text-white font-semibold">Expense Breakdown</h3>
                    </div>
                    {pieSeries.length > 0 ? (
                        <ReactApexChart options={pieOptions} series={pieSeries} type="donut" height={280} />
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 gap-2">
                            <FiPieChart className="text-3xl" />
                            <p className="text-sm">Add expenses to see breakdown</p>
                        </div>
                    )}
                </div>

                {/* Bar: income vs expenses */}
                <div className="glass-panel rounded-2xl p-6 xl:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <FiBarChart2 className="text-blue-400" />
                        <h3 className="text-white font-semibold">Income vs Expenses</h3>
                    </div>
                    <ReactApexChart options={incExpOptions} series={incExpSeries} type="bar" height={280} />
                </div>

                {/* FOIR gauge */}
                <div className="glass-panel rounded-2xl p-6 xl:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <FiTarget className="text-yellow-400" />
                        <h3 className="text-white font-semibold">FOIR Gauge</h3>
                        <div className="group relative ml-1">
                            <FiAlertCircle className="text-slate-500 text-sm cursor-help" />
                            <div className="absolute left-0 top-5 z-50 w-56 p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-xl pointer-events-none">
                                <strong className="text-white">Fixed Obligation to Income Ratio (FOIR)</strong>
                                <br /><br />
                                FOIR = (Total EMI) ÷ (Monthly Income) × 100
                                <br /><br />
                                Banks typically approve loans only when FOIR is below&nbsp;<span className="text-green-400">50%</span>.
                            </div>
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs mb-2">Loan eligibility indicator</p>
                    <ReactApexChart options={foirOptions} series={[foirValue]} type="radialBar" height={260} />
                    <div className="mt-2 p-3 rounded-xl text-center" style={{ backgroundColor: foirInfo.color + '15', borderColor: foirInfo.color + '40', borderWidth: 1 }}>
                        <p className="text-xs font-semibold" style={{ color: foirInfo.color }}>
                            {foirValue < 50
                                ? `✓ You likely qualify for additional loans (FOIR ${foirValue}%)`
                                : `⚠ High FOIR may affect loan eligibility`}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Expense bar: fixed / variable / EMI / savings ── */}
            <div className="glass-panel rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <FiBarChart2 className="text-orange-400" />
                    <h3 className="text-white font-semibold">Expense Structure</h3>
                </div>
                <ReactApexChart options={barOptions} series={barSeriesColored} type="bar" height={240} />
            </div>

            {/* ── Savings Health bar ── */}
            <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <FiTarget className="text-blue-400" />
                        <h3 className="text-white font-semibold">Monthly Savings Health</h3>
                    </div>
                    <span className={`text-sm font-bold ${savings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {savings >= 0 ? '+' : ''}{fmt(savings)}
                    </span>
                </div>

                {/* Progress bars */}
                <div className="space-y-4">
                    {[
                        { label: 'Fixed Expenses', value: totalFixed, total: totalIncome, color: '#f97316' },
                        { label: 'Variable Expenses', value: totalVariable, total: totalIncome, color: '#fbbf24' },
                        { label: 'EMI Obligations', value: totalEMI, total: totalIncome, color: '#e879f9' },
                        { label: 'Net Savings', value: savings > 0 ? savings : 0, total: totalIncome, color: '#22c55e' },
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-slate-400 text-sm">{item.label}</span>
                                <span className="text-slate-300 text-sm font-medium">
                                    {fmt(item.value)} <span className="text-slate-500">({pct(item.value, item.total)}%)</span>
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${Math.min(pct(item.value, item.total), 100)}%`,
                                        backgroundColor: item.color,
                                        boxShadow: `0 0 8px ${item.color}66`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Viva affordability message */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 border border-blue-500/15">
                    <p className="text-xs text-slate-400 leading-relaxed">
                        <span className="text-blue-400 font-semibold">💡 Nexus Insight:</span>&nbsp;
                        This dashboard helps you understand your monthly affordability before and after loan approval.
                        With a FOIR of <span style={{ color: foirInfo.color }} className="font-semibold">{foirValue}%</span>,
                        your estimated loan eligibility is&nbsp;
                        <span className="text-white font-semibold">
                            {totalIncome > 0
                                ? fmt(Math.max(0, (totalIncome * 0.5 - totalEMI) * 60))
                                : 'N/A'}
                        </span> (assuming 60-month tenure at 50% FOIR cap).
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinanceDashboard;
