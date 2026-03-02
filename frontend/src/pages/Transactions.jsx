import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    FiDownload,
    FiSearch,
    FiFilter,
    FiArrowUpRight,
    FiArrowDownLeft,
    FiRepeat,
    FiCheckCircle,
    FiXCircle,
    FiClock,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────
   Helper: format date and time separately
──────────────────────────────────────────────*/
const fmtDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const fmtAmt = (a) => parseFloat(a).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─────────────────────────────────────────────
   PDF GENERATOR
──────────────────────────────────────────────*/
const downloadPDF = (transactions, user, accountNumber) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();

    const addPage = () => {
        /* ── dark background ── */
        doc.setFillColor(10, 14, 26);
        doc.rect(0, 0, W, H, 'F');

        /* ── subtle radial glow (centre ellipse) ── */
        for (let r = 60; r >= 1; r--) {
            const alpha = (61 - r) / 300;
            const grey = Math.round(30 + r * 0.4);
            doc.setFillColor(grey, grey, grey);
            doc.setGState(doc.GState({ opacity: alpha }));
            doc.ellipse(W / 2, H / 2, r * 1.5, r, 'F');
        }
        doc.setGState(doc.GState({ opacity: 1 }));

        /* ── watermark text "nexus" ── */
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(64);
        doc.setTextColor(50, 50, 50);
        doc.setGState(doc.GState({ opacity: 0.45 }));
        doc.text('nexus', W / 2, H / 2 + 10, { align: 'center' });
        doc.setGState(doc.GState({ opacity: 1 }));

        /* ── coloured "X" crosshair inside the watermark ── */
        const cx = W / 2 + 5.5; // offset to align with "x" in nexus
        const cy = H / 2 + 2;
        const r2 = 5;
        doc.setLineWidth(1.4);
        // top-left → bottom-right  (yellow)
        doc.setDrawColor(230, 200, 0);
        doc.setGState(doc.GState({ opacity: 0.7 }));
        doc.line(cx - r2, cy - r2, cx + r2, cy + r2);
        // top-right → bottom-left  (cyan)
        doc.setDrawColor(0, 210, 230);
        doc.line(cx + r2, cy - r2, cx - r2, cy + r2);
        doc.setGState(doc.GState({ opacity: 1 }));
        doc.setLineWidth(0.5);
    };

    addPage();

    /* ── Header gradient bar ── */
    // Blue gradient strip
    for (let i = 0; i < 22; i++) {
        const ratio = i / 22;
        const r = Math.round(37 + ratio * (109 - 37));
        const g = Math.round(99 + ratio * (40 - 99));
        const b = Math.round(235 + ratio * (217 - 235));
        doc.setFillColor(r, g, b);
        doc.rect(0, i, W, 1, 'F');
    }

    /* ── Bank name in header ── */
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('NEXUS BANK', 14, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    doc.text('Official Transaction Statement', 14, 19);

    /* ── Generated timestamp top-right ── */
    const now = new Date();
    doc.setFontSize(7);
    doc.setTextColor(200, 220, 255);
    doc.text(`Generated: ${fmtDate(now)} ${fmtTime(now)}`, W - 14, 14, { align: 'right' });
    doc.text(`Ref: NXS-${Date.now().toString(36).toUpperCase()}`, W - 14, 19, { align: 'right' });

    /* ── Account holder info block ── */
    const infoY = 28;
    doc.setFillColor(18, 24, 45);
    doc.roundedRect(14, infoY, W - 28, 28, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, infoY, W - 28, 28, 3, 3, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('ACCOUNT HOLDER', 20, infoY + 7);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`${user?.first_name || ''} ${user?.last_name || ''}`.trim(), 20, infoY + 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('ACCOUNT NUMBER', 20, infoY + 22);
    doc.setTextColor(255, 255, 255);
    doc.text(accountNumber || 'N/A', 65, infoY + 22);

    // right side
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('STATEMENT PERIOD', W / 2 + 10, infoY + 7);
    if (transactions.length > 0) {
        const sorted = [...transactions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(`${fmtDate(sorted[0].timestamp)} – ${fmtDate(sorted[sorted.length - 1].timestamp)}`, W / 2 + 10, infoY + 14);
    }
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(148, 163, 184);
    doc.text('TOTAL TRANSACTIONS', W / 2 + 10, infoY + 22);
    doc.setTextColor(255, 255, 255);
    doc.text(String(transactions.length), W - 20, infoY + 22, { align: 'right' });

    /* ── Section title ── */
    let curY = infoY + 36;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(99, 179, 237); // blue-300
    doc.text('TRANSACTION DETAILS', 14, curY);

    // divider
    curY += 3;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, curY, W - 14, curY);
    curY += 4;

    /* ── Table header ── */
    const cols = {
        no: { x: 14, w: 8, label: '#', align: 'left' },
        date: { x: 22, w: 22, label: 'DATE', align: 'left' },
        time: { x: 44, w: 20, label: 'TIME', align: 'left' },
        type: { x: 64, w: 22, label: 'TYPE', align: 'left' },
        sender: { x: 86, w: 36, label: 'SENDER / FROM', align: 'left' },
        recv: { x: 122, w: 36, label: 'RECEIVER / TO', align: 'left' },
        amt: { x: 158, w: 22, label: 'AMOUNT (₹)', align: 'right' },
        status: { x: 180, w: 17, label: 'STATUS', align: 'right' },
    };

    // draw header bg
    doc.setFillColor(25, 35, 65);
    doc.rect(14, curY, W - 28, 8, 'F');

    Object.values(cols).forEach(col => {
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        const tx = col.align === 'right' ? col.x + col.w : col.x;
        doc.text(col.label, tx, curY + 5.5, { align: col.align });
    });
    curY += 8;

    /* ── Rows ── */
    const rowH = 18;
    let pageNo = 1;

    transactions.forEach((txn, idx) => {
        // new page check
        if (curY + rowH > H - 20) {
            doc.addPage();
            addPage();
            pageNo++;

            // Repeat gradient header bar
            for (let i = 0; i < 10; i++) {
                const ratio = i / 10;
                const r = Math.round(37 + ratio * (109 - 37));
                const g = Math.round(99 + ratio * (40 - 99));
                const b = Math.round(235 + ratio * (217 - 235));
                doc.setFillColor(r, g, b);
                doc.rect(0, i, W, 1, 'F');
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(255, 255, 255);
            doc.text('NEXUS BANK — Transaction Statement (cont.)', 14, 8);

            curY = 16;
            // repeat table header
            doc.setFillColor(25, 35, 65);
            doc.rect(14, curY, W - 28, 8, 'F');
            Object.values(cols).forEach(col => {
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(148, 163, 184);
                const tx = col.align === 'right' ? col.x + col.w : col.x;
                doc.text(col.label, tx, curY + 5.5, { align: col.align });
            });
            curY += 8;
        }

        // alternating row bg
        doc.setFillColor(idx % 2 === 0 ? 12 : 16, idx % 2 === 0 ? 18 : 22, idx % 2 === 0 ? 35 : 42);
        doc.rect(14, curY, W - 28, rowH, 'F');

        // left accent stripe by type
        const typeColors = {
            DEPOSIT: [34, 197, 94],
            WITHDRAWAL: [239, 68, 68],
            TRANSFER: [59, 130, 246],
        };
        const [cr, cg, cb] = typeColors[txn.transaction_type] || [100, 100, 100];
        doc.setFillColor(cr, cg, cb);
        doc.rect(14, curY, 2, rowH, 'F');

        // ── Row text ──
        const mid = curY + rowH / 2 + 1.5;

        // #
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(String(idx + 1), cols.no.x + 2, mid);

        // Date
        doc.setTextColor(203, 213, 225);
        doc.text(fmtDate(txn.timestamp), cols.date.x + 1, mid);

        // Time
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(6.5);
        doc.text(fmtTime(txn.timestamp), cols.time.x + 1, mid);

        // Type badge text
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(cr, cg, cb);
        doc.text(txn.transaction_type, cols.type.x + 1, mid);

        // Sender (owner for deposits, or their own acc for withdrawals, peer for transfers)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        const senderName = txn.transaction_type === 'DEPOSIT'
            ? (txn.sender_name || 'External / Bank')
            : `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
        const senderAcc = txn.transaction_type === 'DEPOSIT'
            ? (txn.sender_account || '—')
            : (accountNumber || '—');

        doc.setTextColor(203, 213, 225);
        doc.text(senderName.substring(0, 20), cols.sender.x, mid - 2.5);
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Acc: ${senderAcc}`, cols.sender.x, mid + 3.5);

        // Receiver
        doc.setFontSize(6.5);
        const receiverName = txn.transaction_type === 'DEPOSIT'
            ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
            : (txn.receiver_name || txn.related_account_number || 'External');
        const receiverAcc = txn.transaction_type === 'DEPOSIT'
            ? (accountNumber || '—')
            : (txn.related_account || txn.related_account_number || '—');

        doc.setTextColor(203, 213, 225);
        doc.text(String(receiverName).substring(0, 20), cols.recv.x, mid - 2.5);
        doc.setFontSize(5.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Acc: ${receiverAcc}`, cols.recv.x, mid + 3.5);

        // Amount
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(cr, cg, cb);
        const sign = txn.transaction_type === 'DEPOSIT' ? '+' : '-';
        doc.text(`${sign}${fmtAmt(txn.amount)}`, cols.amt.x + cols.amt.w, mid, { align: 'right' });

        // Status
        const statusColors = { SUCCESS: [34, 197, 94], FAILED: [239, 68, 68], PENDING: [234, 179, 8] };
        const [sr, sg, sb] = statusColors[txn.status] || [100, 116, 139];
        doc.setFontSize(6);
        doc.setTextColor(sr, sg, sb);
        doc.setFont('helvetica', 'bold');
        doc.text(txn.status || '—', cols.status.x + cols.status.w, mid, { align: 'right' });

        // Description (small, below main row)
        if (txn.description) {
            doc.setFontSize(5.5);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(71, 85, 105);
            doc.text(`Note: ${String(txn.description).substring(0, 55)}`, cols.date.x + 1, curY + rowH - 2);
        }

        // Row bottom border
        doc.setDrawColor(30, 41, 70);
        doc.setLineWidth(0.2);
        doc.line(14, curY + rowH, W - 14, curY + rowH);

        curY += rowH;
    });

    /* ── Summary totals ── */
    curY += 6;
    const income = transactions.filter(t => t.transaction_type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expense = transactions.filter(t => t.transaction_type !== 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
    const net = income - expense;

    if (curY + 26 > H - 20) {
        doc.addPage();
        addPage();
        curY = 20;
    }

    doc.setFillColor(18, 24, 45);
    doc.roundedRect(14, curY, W - 28, 24, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, curY, W - 28, 24, 3, 3, 'S');

    const colW3 = (W - 28) / 3;
    const summaryItems = [
        { label: 'TOTAL CREDIT', value: `+₹${fmtAmt(income)}`, color: [34, 197, 94] },
        { label: 'TOTAL DEBIT', value: `-₹${fmtAmt(expense)}`, color: [239, 68, 68] },
        { label: 'NET BALANCE', value: `${net >= 0 ? '+' : ''}₹${fmtAmt(net)}`, color: net >= 0 ? [99, 179, 237] : [239, 68, 68] },
    ];
    summaryItems.forEach((item, i) => {
        const sx = 14 + i * colW3 + colW3 / 2;
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(148, 163, 184);
        doc.text(item.label, sx, curY + 9, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(...item.color);
        doc.text(item.value, sx, curY + 19, { align: 'center' });
    });

    /* ── Footer on last page ── */
    const lastH = doc.internal.pageSize.getHeight();
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text('This is a computer-generated statement. No signature required.  |  Nexus Bank © 2025  |  All Rights Reserved', W / 2, lastH - 8, { align: 'center' });
    doc.setDrawColor(30, 41, 70);
    doc.setLineWidth(0.3);
    doc.line(14, lastH - 12, W - 14, lastH - 12);

    // Page numbers on all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(`Page ${p} of ${totalPages}`, W - 14, H - 5, { align: 'right' });
    }

    doc.save(`Nexus_Statement_${user?.first_name}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/* ─────────────────────────────────────────────
   TYPE CONFIG
──────────────────────────────────────────────*/
const typeConfig = {
    DEPOSIT: { icon: FiArrowDownLeft, bg: 'bg-green-500/10', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400' },
    WITHDRAWAL: { icon: FiArrowUpRight, bg: 'bg-red-500/10', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400' },
    TRANSFER: { icon: FiRepeat, bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400' },
};

const statusConfig = {
    SUCCESS: { icon: FiCheckCircle, text: 'text-green-400' },
    FAILED: { icon: FiXCircle, text: 'text-red-400' },
    PENDING: { icon: FiClock, text: 'text-yellow-400' },
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
──────────────────────────────────────────────*/
const Transactions = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [accountNumber, setAccountNumber] = useState('');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        const fetchTxns = async () => {
            const res = await api.get('/accounts/balance/');
            setTransactions(res.data.transactions || []);
            setAccountNumber(res.data.account_number || '');
        };
        fetchTxns();
    }, []);

    /* filtered list */
    const filtered = transactions.filter(txn => {
        const matchType = filterType === 'ALL' || txn.transaction_type === filterType;
        const matchSearch = !search ||
            (txn.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (txn.transaction_type || '').toLowerCase().includes(search.toLowerCase()) ||
            String(txn.amount).includes(search);
        return matchType && matchSearch;
    });

    /* summary stats */
    const totalIncome = transactions.filter(t => t.transaction_type === 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = transactions.filter(t => t.transaction_type !== 'DEPOSIT').reduce((s, t) => s + parseFloat(t.amount), 0);

    const handleDownload = () => {
        setGenerating(true);
        setTimeout(() => {
            downloadPDF(filtered, user, accountNumber);
            setGenerating(false);
        }, 200);
    };

    return (
        <DashboardLayout>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Transaction History</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Account&nbsp;<span className="text-blue-400 font-mono">{accountNumber}</span>
                    </p>
                </div>

                {/* Download button */}
                <button
                    onClick={handleDownload}
                    disabled={generating || filtered.length === 0}
                    className={`
                        flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm
                        transition-all duration-200
                        ${generating || filtered.length === 0
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105'
                        }
                    `}
                >
                    {generating ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating PDF…
                        </>
                    ) : (
                        <>
                            <FiDownload className="text-lg" />
                            Download Statement (PDF)
                        </>
                    )}
                </button>
            </div>

            {/* ── Summary cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Transactions', value: transactions.length, sub: 'All time', color: 'blue' },
                    { label: 'Total Income', value: `₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: 'Deposits', color: 'green' },
                    { label: 'Total Expense', value: `₹${totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, sub: 'Withdrawals & Transfers', color: 'red' },
                ].map(card => (
                    <div key={card.label} className="glass-panel p-5 rounded-xl">
                        <p className="text-slate-400 text-xs uppercase font-semibold mb-1">{card.label}</p>
                        <p className={`text-2xl font-bold text-${card.color}-400`}>{card.value}</p>
                        <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Filters row ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search description, type, amount…"
                        className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    />
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-2">
                    <FiFilter className="text-slate-500" />
                    {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${filterType === t
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="glass-panel overflow-hidden rounded-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400 min-w-[700px]">
                        <thead className="bg-slate-800/60 text-xs uppercase font-semibold text-slate-400 border-b border-slate-700/50">
                            <tr>
                                <th className="px-5 py-4">Date & Time</th>
                                <th className="px-5 py-4">Type</th>
                                <th className="px-5 py-4">From / Sender</th>
                                <th className="px-5 py-4">To / Receiver</th>
                                <th className="px-5 py-4">Description</th>
                                <th className="px-5 py-4 text-right">Amount</th>
                                <th className="px-5 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/30">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-slate-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : filtered.map((txn) => {
                                const tc = typeConfig[txn.transaction_type] || typeConfig.TRANSFER;
                                const sc = statusConfig[txn.status] || statusConfig.PENDING;
                                const Icon = tc.icon;
                                const StatusIcon = sc.icon;

                                const senderName = txn.transaction_type === 'DEPOSIT'
                                    ? (txn.sender_name || 'External / Bank')
                                    : `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
                                const senderAcc = txn.transaction_type === 'DEPOSIT'
                                    ? (txn.sender_account || '—')
                                    : accountNumber || '—';

                                const receiverName = txn.transaction_type === 'DEPOSIT'
                                    ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                                    : (txn.receiver_name || '—');
                                const receiverAcc = txn.transaction_type === 'DEPOSIT'
                                    ? accountNumber || '—'
                                    : (txn.related_account || txn.related_account_number || '—');

                                return (
                                    <tr key={txn.id} className="hover:bg-white/[0.03] transition-colors group">
                                        {/* Date & Time */}
                                        <td className="px-5 py-4 whitespace-nowrap">
                                            <p className="text-slate-200 font-medium">{fmtDate(txn.timestamp)}</p>
                                            <p className="text-slate-500 text-xs">{fmtTime(txn.timestamp)}</p>
                                        </td>

                                        {/* Type */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 rounded-lg ${tc.bg} flex items-center justify-center`}>
                                                    <Icon className={`text-sm ${tc.text}`} />
                                                </div>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tc.badge}`}>
                                                    {txn.transaction_type}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Sender */}
                                        <td className="px-5 py-4">
                                            <p className="text-slate-200 text-sm font-medium truncate max-w-[120px]">{senderName}</p>
                                            <p className="text-slate-500 text-xs font-mono">{senderAcc}</p>
                                        </td>

                                        {/* Receiver */}
                                        <td className="px-5 py-4">
                                            <p className="text-slate-200 text-sm font-medium truncate max-w-[120px]">{receiverName}</p>
                                            <p className="text-slate-500 text-xs font-mono">{receiverAcc}</p>
                                        </td>

                                        {/* Description */}
                                        <td className="px-5 py-4 max-w-[160px]">
                                            <p className="text-slate-400 text-xs truncate">{txn.description || '—'}</p>
                                        </td>

                                        {/* Amount */}
                                        <td className={`px-5 py-4 text-right font-bold ${tc.text} whitespace-nowrap`}>
                                            {txn.transaction_type === 'DEPOSIT' ? '+' : '-'}
                                            ₹{fmtAmt(txn.amount)}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-4">
                                            <div className={`flex items-center gap-1.5 ${sc.text}`}>
                                                <StatusIcon className="text-sm" />
                                                <span className="text-xs font-semibold">{txn.status}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table footer count */}
                {filtered.length > 0 && (
                    <div className="px-5 py-3 border-t border-slate-700/30 flex justify-between items-center">
                        <p className="text-slate-500 text-xs">
                            Showing <span className="text-slate-300">{filtered.length}</span> of <span className="text-slate-300">{transactions.length}</span> transactions
                        </p>
                        <button
                            onClick={handleDownload}
                            disabled={generating}
                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <FiDownload />
                            Download filtered as PDF
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Transactions;
