# 🏦 Nexus Bank System

<div align="center">

![Nexus Bank](https://img.shields.io/badge/Nexus-Bank%20System-blue?style=for-the-badge&logo=bank&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern, full-stack banking application with multi-stage loan approval workflow, role-based access control, and beautiful glassmorphism UI.

[Features](#-features) • [Workflow](#-loan-approval-workflow) • [Installation](#-installation) • [Usage](#-usage) • [API](#-api-endpoints)

</div>

---

## ✨ Features

### 🌐 Public Website (No Login Required)
- **Landing Page** - Bank information, services overview
- **Loan Products** - View all loan types with interest rates and eligibility
- **How It Works** - 4-step loan approval process explanation
- **Contact Information** - Bank contact details

### � Customer Features (Login Required)
- **Apply for Loans** - Personal, Home, Vehicle, Business, Education loans
- **Track Applications** - Real-time workflow stage tracking
- **EMI Management** - Pay monthly installments
- **View Transactions** - Complete transaction history
- **Investments** - Browse and invest in plans

### � Officer Features (4 Specialized Roles)
Each officer has a dedicated dashboard showing only loans relevant to their stage:

| Role | Responsibilities |
|------|-----------------|
| **Application Officer** | KYC verification, document check, initial screening |
| **Credit Officer** | CIBIL score check, income verification, FOIR/EMI calculation |
| **Legal Officer** | Title verification, encumbrance check, legal compliance |
| **Disbursement Manager** | Final approval, sanction letter, loan disbursement |

---

## 🔄 Loan Approval Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Customer      │     │  Application    │     │    Credit       │     │    Legal        │
│   Applies       │ ──▶ │    Officer      │ ──▶ │    Officer      │ ──▶ │    Officer      │
│                 │     │   (KYC Check)   │     │ (Credit Check)  │     │ (Legal Check)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                                  │
                                                                                  ▼
                        ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
                        │   Customer      │     │   Disbursement  │     │   Disbursement  │
                        │   Receives      │ ◀── │    Manager      │ ◀── │    Manager      │
                        │   Funds         │     │  (Disburse)     │     │ (Final Review)  │
                        └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Workflow Stages:
1. **SUBMITTED** → Customer submits loan application
2. **APPLICATION_REVIEW** → Application Officer reviews KYC & documents
3. **CREDIT_REVIEW** → Credit Officer analyzes creditworthiness
4. **LEGAL_REVIEW** → Legal Officer verifies documents & compliance
5. **FINAL_REVIEW** → Disbursement Manager reviews all reports
6. **APPROVED** → Loan is sanctioned
7. **DISBURSED** → Funds credited to customer account
8. **PAID** → All EMIs paid, loan closed

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Django 5.x | Web Framework |
| Django REST Framework | API Development |
| SimpleJWT | Authentication |
| SQLite/PostgreSQL | Database |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Tailwind CSS 4 | Styling |
| Axios | HTTP Client |
| React Router | Navigation |
| Framer Motion | Animations |

---

## 📦 Installation

### Prerequisites
- **Python 3.10+** - [Download](https://python.org/downloads)
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)

### Step 1: Clone Repository
```bash
git clone https://github.com/Harini007m/Nexus-Banksystem.git
cd Nexus-Banksystem
```

### Step 2: Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations
cd backend
python manage.py migrate

# Create users (customer + 4 officers)
python manage.py seed_data
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚀 Usage

### Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```
Backend runs at: **http://127.0.0.1:8000**

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: **http://localhost:5173**

### Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:5173/home` | Public landing page (no login) |
| `http://localhost:5173/login` | Login page |
| `http://localhost:5173/dashboard` | Customer dashboard |
| `http://localhost:5173/officer` | Officer dashboard |

---

## 🔑 Login Credentials

### Customer Account
| Field | Value |
|-------|-------|
| Email | `user@nexus.com` |
| Password | `userpassword123` |

### Officer Accounts

| Role | Email | Password |
|------|-------|----------|
| **Application Officer** | `application.officer@nexus.com` | `officer123` |
| **Credit Officer** | `credit.officer@nexus.com` | `officer123` |
| **Legal Officer** | `legal.officer@nexus.com` | `officer123` |
| **Disbursement Manager** | `disbursement.manager@nexus.com` | `officer123` |

---

## 📁 Project Structure

```
Nexus-Banksystem/
├── backend/
│   ├── accounts/          # Account & Transaction management
│   ├── investments/       # Investment plans & portfolios
│   ├── loans/             # Multi-stage loan workflow
│   ├── users/             # Authentication & roles
│   └── nexus_bank/        # Django settings
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx    # Public page
│       │   ├── Dashboard.jsx      # Customer dashboard
│       │   ├── OfficerDashboard.jsx # Officer dashboard
│       │   ├── Loans.jsx          # Customer loans
│       │   └── ...
│       ├── components/
│       └── context/
```

---

## 🔗 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/bank-info/` | Bank info for public page |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register new customer |
| POST | `/api/users/login/` | Login (email + password) |
| GET | `/api/users/profile/` | Get user profile |

### Customer - Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/` | List my loans |
| POST | `/api/loans/` | Apply for loan |
| POST | `/api/loans/{id}/pay-emi/` | Pay EMI |

### Officer Endpoints

**Application Officer:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/officer/application/` | Pending applications |
| POST | `/api/loans/officer/application/{id}/review/` | Review & approve/reject |

**Credit Officer:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/officer/credit/` | Pending credit review |
| POST | `/api/loans/officer/credit/{id}/review/` | Submit credit analysis |

**Legal Officer:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/officer/legal/` | Pending legal review |
| POST | `/api/loans/officer/legal/{id}/review/` | Submit legal verification |

**Disbursement Manager:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/officer/disbursement/` | Pending final review |
| POST | `/api/loans/officer/disbursement/{id}/review/` | Approve/Disburse/Reject |

---

## � Testing the Complete Workflow

1. **As Customer** (`user@nexus.com`):
   - Visit `/home` to see public page
   - Login and go to `/loans`
   - Apply for a new loan

2. **As Application Officer** (`application.officer@nexus.com`):
   - Login and view queue at `/officer`
   - Review application, verify KYC, approve

3. **As Credit Officer** (`credit.officer@nexus.com`):
   - Login and view queue
   - Enter CIBIL score, verify income, calculate FOIR, approve

4. **As Legal Officer** (`legal.officer@nexus.com`):
   - Login and view queue
   - Verify title, check encumbrance, confirm compliance, approve

5. **As Disbursement Manager** (`disbursement.manager@nexus.com`):
   - Login and view queue
   - Review all reports, approve, then disburse

6. **As Customer** again:
   - See loan status as "Disbursed"
   - Check account balance (increased by loan amount)
   - Pay monthly EMIs

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ by the Nexus Team**

⭐ Star this repository if you find it helpful!

</div>
