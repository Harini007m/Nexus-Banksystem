# 🏦 Nexus Bank System

<div align="center">

![Nexus Bank](https://img.shields.io/badge/Nexus-Bank%20System-blue?style=for-the-badge&logo=bank&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.x-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A modern, full-stack banking application with a beautiful glassmorphism UI design.

[Features](#-features) • [Installation](#-installation) • [Running](#-running-the-application) • [API](#-api-endpoints) • [Screenshots](#-screenshots)

</div>

---

## ✨ Features

### 👤 User Management
- **JWT Authentication** - Secure login and registration with token refresh
- **Role-based Access** - Admin and User roles with different permissions
- **Profile Display** - User information shown in the dashboard

### 💰 Account Management
- **Balance Tracking** - Real-time account balance display
- **Deposit & Withdraw** - Direct deposit and withdrawal functionality
- **Quick Transfer** - Transfer funds to other accounts instantly
- **Transaction History** - Complete record of all transactions

### 📋 Loan Management
- **Loan Applications** - Apply for loans with custom amounts and purposes
- **EMI System** - Monthly installment payments with interest calculation
- **Progress Tracking** - Visual progress bar showing repayment status
- **Admin Approval** - Admins can approve or reject loan requests
- **Full Repayment** - Option to pay off entire loan early

### 📈 Investment Management
- **Investment Plans** - Browse available investment options
- **Portfolio View** - Track your active investments
- **Maturity Processing** - Admins can process matured investments
- **Interest Calculation** - Automatic interest computation on returns

### 🔔 Notifications
- **Real-time Updates** - Recent transaction notifications
- **Activity Feed** - Track deposits, withdrawals, and transfers

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Django 5.x | Web Framework |
| Django REST Framework | API Development |
| SimpleJWT | Authentication |
| SQLite/PostgreSQL | Database |
| Django CORS Headers | Cross-Origin Support |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite 7 | Build Tool |
| Tailwind CSS 4 | Styling |
| Axios | HTTP Client |
| React Router | Navigation |
| ApexCharts | Data Visualization |
| Framer Motion | Animations |
| React Icons | Icon Library |

---

## 📦 Installation

### Prerequisites

Make sure you have the following installed on your system:
- **Python 3.10+** - [Download Python](https://python.org/downloads)
- **Node.js 18+** - [Download Node.js](https://nodejs.org)
- **Git** - [Download Git](https://git-scm.com)

### Step 1: Clone the Repository

```bash
git clone https://github.com/Harini007m/Nexus-Banksystem.git
cd Nexus-Banksystem
```

### Step 2: Backend Setup

1. **Create a virtual environment:**

   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies:**

   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run database migrations:**

   ```bash
   cd backend
   python manage.py migrate
   ```

4. **Create initial data (admin user & sample data):**

   ```bash
   python manage.py seed_data
   ```

   This creates:
   - Admin account: `admin@nexus.com` / `adminpassword123`
   - User account: `user@nexus.com` / `userpassword123`
   - Sample investment plans

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to the frontend:**

   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**

   ```bash
   npm install
   ```

---

## 🚀 Running the Application

You need **two terminal windows** - one for the backend and one for the frontend.

### Terminal 1: Start the Backend Server

```bash
# Make sure you're in the project root with venv activated
cd backend
python manage.py runserver
```

The backend will start at: **http://127.0.0.1:8000**

### Terminal 2: Start the Frontend Server

```bash
cd frontend
npm run dev
```

The frontend will start at: **http://localhost:5173**

### 🎉 Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@nexus.com | adminpassword123 |
| **User** | user@nexus.com | userpassword123 |

> **Note:** Admin users can approve/reject loans and mature investments. Regular users can apply for loans, make investments, and manage their accounts.

---

## 📁 Project Structure

```
Nexus-Banksystem/
├── backend/                    # Django Backend
│   ├── accounts/              # Account & Transaction management
│   ├── investments/           # Investment plans & portfolios
│   ├── loans/                 # Loan applications & EMI system
│   ├── users/                 # User authentication & management
│   ├── nexus_bank/            # Django project settings
│   └── manage.py
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── api/               # Axios configuration
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React Context (Auth)
│   │   ├── layouts/           # Page layouts
│   │   ├── pages/             # Application pages
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── venv/                       # Python virtual environment
├── requirements.txt            # Python dependencies
└── README.md                   # You are here!
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register/` | Register new user |
| POST | `/api/users/login/` | Login & get JWT tokens |
| POST | `/api/users/token/refresh/` | Refresh access token |

### Accounts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accounts/balance/` | Get account balance & transactions |
| POST | `/api/accounts/deposit/` | Deposit funds |
| POST | `/api/accounts/withdraw/` | Withdraw funds |
| POST | `/api/accounts/transfer/` | Transfer to another account |

### Loans
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans/` | List all loans (user's or all for admin) |
| POST | `/api/loans/` | Apply for a new loan |
| POST | `/api/loans/{id}/respond/` | Admin: Approve/Reject loan |
| POST | `/api/loans/{id}/pay-emi/` | Pay monthly EMI |
| POST | `/api/loans/{id}/repay/` | Full loan repayment |

### Investments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investments/plans/` | List investment plans |
| GET | `/api/investments/my-investments/` | User's investments |
| POST | `/api/investments/invest/` | Make new investment |
| POST | `/api/investments/{id}/mature/` | Admin: Process maturity |

---

## 🖼️ Screenshots

### Dashboard
The main dashboard displays your account balance, recent transactions, and financial analytics.

### Loans Page
Apply for loans, track EMI payments, and view loan status with progress indicators.

### Investments Page
Browse investment plans and manage your investment portfolio.

---

## 🔧 Troubleshooting

### Common Issues

**1. Backend won't start - Module not found**
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall dependencies
pip install -r backend/requirements.txt
```

**2. Frontend shows blank page**
```bash
# Clear node modules and reinstall
cd frontend
rm -rf node_modules
npm install
npm run dev
```

**3. CORS errors in browser console**
- Make sure the backend is running on port 8000
- Check that `django-cors-headers` is installed and configured

**4. Login fails with "Invalid credentials"**
```bash
# Re-run the seed data command
cd backend
python manage.py seed_data
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ by the Nexus Team**

⭐ Star this repository if you find it helpful!

</div>
