# Database Setup & Usage

## Prerequisites
- Docker
- Docker Compose

## Quick Start

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Start the MongoDB service:
   ```bash
   docker-compose up -d
   ```
   This runs MongoDB in the background on port `27017`.

3. Verify it's running:
   ```bash
   docker ps
   ```
   You should see `educheck_mongo` in the list.

## Connection Details

- **URI**: `mongodb://root:password@localhost:27017/educheck?authSource=admin`
- **Username**: `root`
- **Password**: `password`

## Environment Variables

Update your `backend/.env` file to match this configuration:

```env
MONGO_URI=mongodb://root:password@localhost:27017/educheck?authSource=admin
```

## Management

- **Stop database**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Reset data**: `docker-compose down -v` (Warning: Deletes all data!)
