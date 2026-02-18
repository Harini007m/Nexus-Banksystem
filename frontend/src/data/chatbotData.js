export const FAQS = [
    // SIMPLE DEFAULT QUESTIONS
    {
        question: "Why do banks check details before giving a loan?",
        answer: "Banks check details to make sure the customer can repay the loan and to reduce risk.",
        keywords: ["check details", "why check", "before giving", "reason", "purpose"],
        level: "basic"
    },
    {
        question: "What is KYC?",
        answer: "KYC (Know Your Customer) is the process of verifying a customer's identity using official documents.",
        keywords: ["what is kyc", "know your customer", "identity verification", "documents"],
        level: "basic"
    },
    {
        question: "Who gives final approval for a loan?",
        answer: "The bank's approval authority or manager gives the final approval for a loan.",
        keywords: ["final approval", "who approves", "decision maker", "manager"],
        level: "basic"
    },

    // BASIC-LEVEL QUESTIONS
    {
        question: "What is a bank loan approval system?",
        answer: "A bank loan approval system is a structured process used by banks to evaluate, approve, and disburse loans after assessing the applicant's eligibility, risk, and legal compliance.",
        keywords: ["approval system", "loan approval", "what is", "definition", "meaning"],
        level: "basic"
    },
    {
        question: "Why is a structured loan approval process required?",
        answer: "It ensures consistency, reduces financial risk, prevents fraud, and ensures compliance with banking and regulatory norms.",
        keywords: ["structured", "process required", "why", "necessity", "benefits"],
        level: "basic"
    },
    {
        question: "What is meant by role consolidation in banking operations?",
        answer: "Role consolidation means combining similar or related tasks under fewer roles to improve efficiency and reduce operational complexity.",
        keywords: ["role consolidation", "consolidation", "combined roles", "merging"],
        level: "basic"
    },
    {
        question: "How many roles are used in the proposed loan approval system?",
        answer: "The proposed system uses four combined roles.",
        keywords: ["how many roles", "number of roles", "count", "roles used"],
        level: "basic"
    },
    {
        question: "What is the primary function of the Customer Acquisition & Application Officer?",
        answer: "This role handles customer interaction, loan application collection, basic KYC checks, and system data entry.",
        keywords: ["customer acquisition", "application officer", "primary function", "duties", "tasks"],
        level: "basic"
    },
    {
        question: "Why is KYC verification important in loan processing?",
        answer: "KYC helps verify the identity of the applicant, prevents fraud, and ensures regulatory compliance.",
        keywords: ["kyc", "verification", "important", "significance", "why kyc"],
        level: "basic"
    },
    {
        question: "What is a credit score and why is it checked?",
        answer: "A credit score reflects the applicant's creditworthiness and repayment history. It is checked to assess default risk.",
        keywords: ["credit score", "checked", "why check", "rating", "cibil"],
        level: "basic"
    },
    {
        question: "What is meant by risk assessment in loan approval?",
        answer: "Risk assessment evaluates the borrower's ability and willingness to repay the loan without default.",
        keywords: ["risk assessment", "meant by", "analysis", "evaluation"],
        level: "basic"
    },

    // INTERMEDIATE-LEVEL QUESTIONS
    {
        question: "How does combining similar operations reduce loan processing time?",
        answer: "It minimizes handoffs between departments, reduces delays, and improves coordination.",
        keywords: ["combining", "processing time", "reduce", "efficiency", "speed"],
        level: "intermediate"
    },
    {
        question: "What tasks are handled by the Credit, Risk & Verification Officer?",
        answer: "This role verifies income and employment, checks credit scores, calculates EMI and risk ratios, and conducts field verification.",
        keywords: ["credit risk", "verification officer", "tasks", "duties", "responsibilities"],
        level: "intermediate"
    },
    {
        question: "Why are field verification and credit analysis handled by the same role?",
        answer: "Both tasks assess borrower reliability, and combining them ensures faster and more accurate risk evaluation.",
        keywords: ["field verification", "same role", "credit analysis", "rationale"],
        level: "intermediate"
    },
    {
        question: "What is the purpose of technical and legal evaluation in secured loans?",
        answer: "It ensures the collateral is legally valid, technically sound, and sufficient to cover loan risk.",
        keywords: ["technical", "legal evaluation", "secured loans", "purpose", "assets"],
        level: "intermediate"
    },
    {
        question: "How does the Technical & Legal Evaluation Officer ensure loan safety?",
        answer: "By verifying ownership documents, checking encumbrances, and valuing the asset correctly.",
        keywords: ["ensure loan safety", "legal officer", "documents", "ownership"],
        level: "intermediate"
    },
    {
        question: "What factors influence the final loan approval decision?",
        answer: "Credit score, income stability, risk level, collateral value, and legal clearance influence the decision.",
        keywords: ["factors", "approval decision", "final", "criteria", "requirements"],
        level: "intermediate"
    },
    {
        question: "How does documentation ensure compliance with bank policies?",
        answer: "Proper documentation provides legal proof, enforces terms, and protects both the bank and borrower.",
        keywords: ["documentation", "compliance", "policies", "legal proof", "protection"],
        level: "intermediate"
    },

    // HIGH-LEVEL QUESTIONS
    {
        question: "How does this four-role model improve operational efficiency?",
        answer: "It reduces manpower, speeds up decision-making, lowers costs, and improves accountability.",
        keywords: ["four-role", "efficiency", "operational", "manpower", "cost reduction"],
        level: "high"
    },
    {
        question: "What risks arise from assigning multiple responsibilities to a single role?",
        answer: "Increased workload, potential errors, and reduced checks and balances.",
        keywords: ["risks", "multiple responsibilities", "single role", "workload", "drawbacks"],
        level: "high"
    },
    {
        question: "How can technology mitigate risks in a role-consolidated system?",
        answer: "Automation, AI credit scoring, digital verification, and audit logs reduce human error and bias.",
        keywords: ["technology", "mitigate risks", "automation", "ai"],
        level: "high"
    },
    {
        question: "Is this system suitable for large-scale banks? Justify your answer.",
        answer: "It is more suitable for NBFCs and fintechs. Large banks may require more role separation due to higher volume and risk.",
        keywords: ["large-scale banks", "suitable", "justification"],
        level: "high"
    },
    {
        question: "How can this model be enhanced for digital banking platforms?",
        answer: "By integrating AI-based credit assessment, e-KYC, digital documentation, and real-time monitoring systems.",
        keywords: ["digital banking", "enhanced", "future", "improvements", "online banking"],
        level: "high"
    },
    {
        question: "When will I receive my disbursed loan amount?",
        answer: "Once the 'Disbursement Manager' completes the final documentation and fund transfer process, the loan amount is typically credited to your account within 24-48 business hours.",
        keywords: ["disbursement", "disburse", "receive amount", "payout", "fund transfer", "when", "dibursed", "recive", "time", "get money", "credited", "disburst"],
        level: "intermediate"
    },
    {
        question: "How can I check my loan application status?",
        answer: "You can check your current status by navigating to the 'Loans' section in your dashboard. It will show whether your application is in 'Verification', 'Legal Review', or 'Final Approval' stage.",
        keywords: ["status", "track", "check loan", "my application", "where is my loan", "stutus", "progres"],
        level: "basic"
    },
    {
        question: "What are the repayment terms and how do I pay?",
        answer: "Repayment is typically done via Equated Monthly Installments (EMIs). You can view your schedule, EMI amount, and payment options under the 'Repayments' or 'Accounts' section of your profile.",
        keywords: ["repayment", "pay back", "emi", "monthly payment", "how to pay", "installment", "payback"],
        level: "basic"
    },
    {
        question: "What is the maximum loan amount I can borrow?",
        answer: "Your maximum loan eligibility is determined based on your credit score, monthly income, and existing liabilities. You can find your pre-approved limit or eligibility calculator in the 'Apply for Loan' section.",
        keywords: ["limit", "maximum", "how much", "eligibility", "borrow", "amount", "max"],
        level: "basic"
    },
    {
        question: "What is the minimum age requirement to apply for a loan?",
        answer: "To apply for a loan at Nexus Bank, you must be at least 18 years old. However, for certain high-value loans, the requirement might be 21 years. Please check the specific loan terms for details.",
        keywords: ["age", "18", "21", "minimum age", "old enough", "requirement", "apply age"],
        level: "basic"
    },
    {
        question: "What are the interest rates for different types of loans?",
        answer: "Nexus Bank offer competitive interest rates starting from 7.5% per annum. The exact rate depends on the loan type (Personal, Home, Car, or Education), your credit score, and the loan tenure.",
        keywords: ["interest rate", "rate of interest", "percentage", "how much interest", "charges", "annum"],
        level: "intermediate"
    },
    {
        question: "What documents are required for a loan application?",
        answer: "Commonly required documents include Proof of Identity (Aadhar, PAN card), Proof of Address, last 3-6 months' bank statements, and salary slips or income tax returns.",
        keywords: ["documents", "paperwork", "require", "needed", "id proof", "address proof", "statements"],
        level: "basic"
    },
    {
        question: "How secure is my data at Nexus Bank?",
        answer: "We use banking-grade encryption and secure servers to protect your sensitive information. Our system is fully compliant with modern data protection standards and regular security audits.",
        keywords: ["secure", "safety", "data protection", "privacy", "hacked", "safe", "encryption"],
        level: "high"
    },
    {
        question: "Can I apply for multiple loans simultaneously?",
        answer: "Yes, you can apply for different types of loans at the same time. However, each application will be evaluated based on your total debt-to-income ratio to ensure repayment capability.",
        keywords: ["multiple loans", "two loans", "more than one", "simultaneously", "another loan"],
        level: "intermediate"
    },
    {
        question: "What happens if I miss a loan EMI payment?",
        answer: "Missing an EMI may result in late payment fees and can negatively impact your credit score. We recommend using the 'Auto-pay' feature to ensure timely repayments.",
        keywords: ["missed payment", "late payment", "forget emi", "penalty", "late fee", "don't pay"],
        level: "intermediate"
    },
    {
        question: "Do you offer education loans for international studies?",
        answer: "Yes, Nexus Bank provides specialized education loans for both domestic and international studies, covering tuition fees, travel, and living expenses.",
        keywords: ["education", "study", "student", "abroad", "international", "university", "college"],
        level: "basic"
    },
    {
        question: "How do I update my personal information or address?",
        answer: "You can update your profile details by going to the 'Settings' or 'Profile' section in your dashboard. Some changes might require a supporting document for verification.",
        keywords: ["update", "profile", "change address", "edit info", "modify", "my details"],
        level: "basic"
    },
    {
        question: "What is a collateral-free loan?",
        answer: "A collateral-free (unsecured) loan is a loan that doesn't require any assets like a house or car as security. Personal loans and small business loans are often collateral-free.",
        keywords: ["collateral", "security", "unsecured", "no asset", "without security", "guarantee"],
        level: "intermediate"
    },
    // WEBSITE NAVIGATION & USAGE
    {
        question: "How do I use this website?",
        answer: "Our portal is designed for ease of use. You can use the Sidebar to navigate between your Dashboard, Transactions, Loans, and Investments. The Navbar at the top provides quick access to notifications and your profile.",
        keywords: ["how to use", "website guide", "navigation", "how it works", "portal features", "tutorial"],
        level: "basic"
    },
    {
        question: "How can I apply for a loan on this website?",
        answer: "To apply for a loan: 1. Click on 'Loans' in the sidebar. 2. Click the 'Apply for New Loan' button. 3. Select the loan type and amount. 4. Upload the required documents and submit your application.",
        keywords: ["apply loan", "how to apply", "application process", "steps to apply", "start application", "apply now"],
        level: "basic"
    },
    {
        question: "Where can I see my transaction history?",
        answer: "You can view all your recent and past transactions by clicking on the 'Transactions' link in the left-hand sidebar. This page provides a detailed list of all debits and credits.",
        keywords: ["transactions", "history", "view payments", "statement", "where are my transactions", "money transfer list"],
        level: "basic"
    },
    {
        question: "How do I check my investment portfolio?",
        answer: "To view your investments, click on the 'Investments' section in the sidebar. You can see your total invested amount, growth charts, and detailed analysis of your assets.",
        keywords: ["investments", "portfolio", "growth", "my assets", "investment status", "view investments"],
        level: "basic"
    },
    {
        question: "Where can I find my account settings and profile?",
        answer: "Click on your profile name or icon at the top right corner of the Navbar to access your profile settings. You can also find account-specific details in the 'Settings' section if available.",
        keywords: ["settings", "profile", "my account", "personal info", "edit profile", "account details"],
        level: "basic"
    },
    {
        question: "How do I log out of the portal securely?",
        answer: "You can securely log out by clicking the 'Logout' button located at the bottom of the sidebar. We recommend logging out after every session for your account's safety.",
        keywords: ["log out", "sign out", "exit", "secure exit", "logging off"],
        level: "basic"
    },
    {
        question: "What is the Dashboard Overview?",
        answer: "The Dashboard provides a summary of your financial health at a glance, showing your total balance, recent transactions, income analysis, and quick links to other features.",
        keywords: ["dashboard", "overview", "summary", "main page", "home screen", "financial summary"],
        level: "basic"
    }
];
