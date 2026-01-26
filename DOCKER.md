# 🐳 Docker Deployment Guide

This guide explains how to run the Nexus Bank System using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Quick Start

### 1. Clone and Navigate to the Project

```bash
git clone https://github.com/Harini007m/Nexus-Banksystem.git
cd Nexus-Banksystem
```

### 2. Create Environment File

Copy the example environment file and customize it:

```bash
cp .env.example .env
```

Edit `.env` with your preferred settings:

```env
# Database Configuration
POSTGRES_DB=nexus_bank
POSTGRES_USER=nexus_user
POSTGRES_PASSWORD=your_secure_password_here

# Django Configuration
DEBUG=False
SECRET_KEY=your-super-secret-key-make-it-long-and-random

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:80
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up --build -d
```

### 4. Initialize the Database

After the containers are running, seed the database with initial data:

```bash
docker-compose exec backend python manage.py seed_data
```

### 5. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:8000/api |
| **Django Admin** | http://localhost:8000/admin |

---

## Services Overview

The Docker setup includes the following services:

| Service | Description | Port |
|---------|-------------|------|
| `frontend` | React app served by Nginx | 80 |
| `backend` | Django REST API with Gunicorn | 8000 |
| `db` | PostgreSQL database | 5432 |
| `redis` | Redis for Celery (background tasks) | 6379 |
| `celery` | Celery worker for async tasks | - |

---

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Code Changes
```bash
docker-compose up --build -d
```

### Run Django Management Commands
```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Seed data
docker-compose exec backend python manage.py seed_data

# Django shell
docker-compose exec backend python manage.py shell
```

### Access Container Shell
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Reset Everything (⚠️ Deletes Data)
```bash
docker-compose down -v
docker-compose up --build -d
```

---

## Development vs Production

### Development Mode

For development with hot-reload:

```bash
# Use development compose file (if created)
docker-compose -f docker-compose.dev.yml up
```

Or run services individually:
- Backend: `cd backend && python manage.py runserver`
- Frontend: `cd frontend && npm run dev`

### Production Checklist

Before deploying to production:

1. ✅ Set `DEBUG=False` in `.env`
2. ✅ Generate a strong `SECRET_KEY`
3. ✅ Set proper `ALLOWED_HOSTS`
4. ✅ Configure `CORS_ALLOWED_ORIGINS` for your domain
5. ✅ Use strong database passwords
6. ✅ Set up HTTPS (nginx SSL config or reverse proxy)
7. ✅ Set up proper logging
8. ✅ Configure backup strategy for database

---

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Verify database is ready
docker-compose exec db pg_isready
```

### Database Connection Issues

```bash
# Ensure db container is healthy
docker-compose ps

# Connect to database manually
docker-compose exec db psql -U nexus_user -d nexus_bank
```

### Frontend Can't Connect to Backend

1. Check if backend is running: `curl http://localhost:8000/api/users/bank-info/`
2. Verify CORS settings in `.env`
3. Check nginx configuration

### Clear and Rebuild

```bash
# Remove all containers, volumes, and images
docker-compose down -v --rmi all

# Rebuild from scratch
docker-compose up --build
```

---

## File Structure

```
Nexus-Banksystem/
├── docker-compose.yml      # Main orchestration file
├── .env.example            # Environment template
├── .env                    # Your local config (git ignored)
├── backend/
│   ├── Dockerfile          # Backend container config
│   └── .dockerignore       # Files to exclude from build
└── frontend/
    ├── Dockerfile          # Frontend container config
    ├── nginx.conf          # Nginx configuration
    └── .dockerignore       # Files to exclude from build
```

---

## Login Credentials

After running `seed_data`, use these accounts:

### Customer
- **Email:** user@nexus.com
- **Password:** userpassword123

### Officers
| Role | Email | Password |
|------|-------|----------|
| Application Officer | application.officer@nexus.com | officer123 |
| Credit Officer | credit.officer@nexus.com | officer123 |
| Legal Officer | legal.officer@nexus.com | officer123 |
| Disbursement Manager | disbursement.manager@nexus.com | officer123 |

---

## Need Help?

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Ensure all environment variables are set correctly
3. Verify Docker and Docker Compose versions
4. Create an issue on GitHub
