# 🐳 Nexus Bank System - Docker Setup

Complete guide for running the Nexus Bank System in Docker containers.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

## Quick Start (3 Steps)

### 1. Navigate to Project Directory

```bash
cd Nexus-Banksystem
```

### 2. Build and Run

```bash
docker-compose up --build
```

This command will:
- Build Docker images for both frontend and backend
- Start all containers
- Run database migrations automatically
- Make the app available at http://localhost

### 3. Seed the Database (Optional)

In a new terminal, run:

```bash
docker-compose exec backend python manage.py seed_data
```

## Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost | Main application UI |
| **Backend API** | http://localhost:8000/api | REST API endpoints |
| **Django Admin** | http://localhost:8000/admin | Admin panel |

## Services Overview

| Service | Description | Port | Technology |
|---------|-------------|------|------------|
| `frontend` | React application | 80 | Vite + React + Nginx |
| `backend` | Django REST API | 8000 | Django + DRF |

Database: SQLite (bundled with backend)

## Common Docker Commands

### Start Services (Detached Mode)
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
docker-compose up --build
```

### Check Container Status
```bash
docker-compose ps
```

## Django Management Commands

### Run Migrations
```bash
docker-compose exec backend python manage.py migrate
```

### Create Superuser
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Seed Database
```bash
docker-compose exec backend python manage.py seed_data
```

### Open Django Shell
```bash
docker-compose exec backend python manage.py shell
```

### Collect Static Files
```bash
docker-compose exec backend python manage.py collectstatic --noinput
```

## Container Shell Access

### Backend Container
```bash
docker-compose exec backend sh
```

### Frontend Container
```bash
docker-compose exec frontend sh
```

## Environment Configuration

### Optional: Custom Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Django Configuration
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,backend

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:80
```

## Project Structure

```
Nexus-Banksystem/
├── docker-compose.yml          # Container orchestration
├── .env.example                # Environment template
├── .env                        # Your config (git ignored)
│
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── .dockerignore          # Excluded files
│   ├── requirements.txt        # Python dependencies
│   └── manage.py               # Django management
│
└── frontend/
    ├── Dockerfile              # Frontend container config
    ├── nginx.conf              # Web server config
    ├── .dockerignore          # Excluded files
    └── package.json            # Node dependencies
```

## Architecture Diagram

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│ Nginx (Port 80) │  ← Serves React build
│   Frontend      │
└────────┬────────┘
         │ API calls
         ▼
┌─────────────────┐
│ Django (8000)   │  ← REST API
│   Backend       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite DB      │  ← Data storage
└─────────────────┘
```

## Default Login Credentials

After running `seed_data`, use these test accounts:

### Customer Account
- **Email:** `user@nexus.com`
- **Password:** `userpassword123`

### Officer Accounts

| Role | Email | Password |
|------|-------|----------|
| Application Officer | application.officer@nexus.com | officer123 |
| Credit Officer | credit.officer@nexus.com | officer123 |
| Legal Officer | legal.officer@nexus.com | officer123 |
| Disbursement Manager | disbursement.manager@nexus.com | officer123 |

## Troubleshooting

### Port Already in Use

**Error:** `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution:**
```bash
# Windows - Find process using port
netstat -ano | findstr :80
netstat -ano | findstr :8000

# Stop the process or change ports in docker-compose.yml
```

### Backend Won't Start

```bash
# Check logs
docker-compose logs backend

# Check if migrations are needed
docker-compose exec backend python manage.py showmigrations
```

### Frontend Can't Connect to Backend

1. Check backend is running:
   ```bash
   curl http://localhost:8000/api/
   ```

2. Verify CORS settings in `backend/nexus_bank/settings.py`

3. Check both containers are on same network:
   ```bash
   docker network inspect nexus-banksystem_nexus-network
   ```

### Complete Reset (⚠️ Deletes All Data)

```bash
# Stop and remove containers, volumes, images
docker-compose down -v --rmi all

# Rebuild from scratch
docker-compose up --build
```

### Container Healthcheck Failed

```bash
# Check container health
docker-compose ps

# View detailed logs
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 frontend
```

## Development Tips

### Hot Reload for Development

For local development with hot-reload (outside Docker):

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Update Dependencies

**Python (Backend):**
```bash
# Add package to requirements.txt
docker-compose up --build backend
```

**Node (Frontend):**
```bash
# Update package.json
docker-compose up --build frontend
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Set `DEBUG=False` in environment
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS` with your domain
- [ ] Set `CORS_ALLOWED_ORIGINS` to your frontend URL
- [ ] Consider migrating to PostgreSQL
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure proper logging
- [ ] Set up database backups
- [ ] Use production-grade web server (Gunicorn)
- [ ] Implement monitoring and alerting

## Advanced: Adding PostgreSQL

To upgrade from SQLite to PostgreSQL:

1. Add to `docker-compose.yml`:

```yaml
  db:
    image: postgres:15-alpine
    container_name: nexus-db
    environment:
      POSTGRES_DB: nexus_bank
      POSTGRES_USER: nexus_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - nexus-network

volumes:
  postgres_data:
  backend_media:
```

2. Update `backend/nexus_bank/settings.py` database configuration

3. Rebuild and migrate:
```bash
docker-compose up --build -d
docker-compose exec backend python manage.py migrate
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)

## Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Review this troubleshooting guide
3. Ensure Docker and Docker Compose are up to date
4. Create an issue on the GitHub repository

---

**Happy Banking! 🏦**
