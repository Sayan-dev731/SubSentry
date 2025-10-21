# MongoDB Setup Guide

This guide explains how to set up MongoDB for the SubSentry application.

## Table of Contents
- [Installation](#installation)
- [Database Configuration](#database-configuration)
- [Schema Overview](#schema-overview)
- [Indexes](#indexes)
- [Connection Details](#connection-details)
- [Troubleshooting](#troubleshooting)

## Installation

### Local Development

#### Windows
1. Download MongoDB Community Edition from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer (MSI file)
3. Choose "Complete" installation
4. Install MongoDB as a Windows Service (recommended)
5. Install MongoDB Compass (optional GUI tool)

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -sc)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Docker (Cross-platform)

```bash
# Run MongoDB in Docker container
docker run -d \
  --name subsentry-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=subsentry \
  -v subsentry-data:/data/db \
  mongo:latest

# Or use Docker Compose
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: subsentry-mongodb
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: subsentry
    volumes:
      - subsentry-data:/data/db
    restart: unless-stopped

volumes:
  subsentry-data:
```

## Database Configuration

### Environment Variables

Create a `.env` file in the project root with the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/subsentry

# Alternative for MongoDB Atlas (cloud)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/subsentry?retryWrites=true&w=majority
```

### MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Update `MONGODB_URI` in `.env` file

## Schema Overview

The application uses two main collections managed by Mongoose:

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password_hash: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions Collection
```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: 'User', required),
  name: String (required),
  renewal_date: Date (required),
  cost: Number (required, min: 0),
  reminder_offset_days: Number (default: 7, min: 0),
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

Mongoose automatically creates the following indexes for optimal performance:

### Users Collection
- `email` (unique index) - Fast email lookups for authentication
- `_id` (default primary key)

### Subscriptions Collection
- `user_id` - Fast user subscription queries
- `renewal_date` - Fast date range queries for reminders
- `_id` (default primary key)

Indexes are created automatically when the application starts.

## Connection Details

### Verifying MongoDB is Running

```bash
# Check if MongoDB service is running (Linux/macOS)
sudo systemctl status mongod

# Check if MongoDB is listening
netstat -an | grep 27017

# Connect using MongoDB Shell
mongosh
```

### Using MongoDB Shell

```bash
# Connect to local MongoDB
mongosh

# Switch to subsentry database
use subsentry

# View collections
show collections

# Query users
db.users.find()

# Query subscriptions
db.subscriptions.find()

# Create indexes manually (if needed)
db.users.createIndex({ email: 1 }, { unique: true })
db.subscriptions.createIndex({ user_id: 1 })
db.subscriptions.createIndex({ renewal_date: 1 })
```

### Using MongoDB Compass (GUI)

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Navigate to `subsentry` database
4. Browse collections and documents visually

## Connection String Formats

### Local MongoDB
```
mongodb://localhost:27017/subsentry
```

### MongoDB with Authentication
```
mongodb://username:password@localhost:27017/subsentry?authSource=admin
```

### MongoDB Replica Set
```
mongodb://host1:27017,host2:27017,host3:27017/subsentry?replicaSet=myReplicaSet
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/subsentry?retryWrites=true&w=majority
```

## Troubleshooting

### Connection Refused
- **Issue**: `Error: connect ECONNREFUSED 127.0.0.1:27017`
- **Solution**: Ensure MongoDB service is running:
  ```bash
  # Linux/macOS
  sudo systemctl start mongod
  
  # Windows
  net start MongoDB
  
  # Docker
  docker start subsentry-mongodb
  ```

### Authentication Failed
- **Issue**: `MongoServerError: Authentication failed`
- **Solution**: 
  1. Check username/password in `MONGODB_URI`
  2. Verify user has correct permissions
  3. Check `authSource` parameter in connection string

### Database Not Found
- **Issue**: Collections not appearing in MongoDB Compass
- **Solution**: 
  1. Database is created automatically when first document is inserted
  2. Start the application to trigger automatic database creation
  3. Register a user or create a subscription to populate collections

### Slow Queries
- **Issue**: API responses are slow
- **Solution**:
  1. Verify indexes are created: `db.subscriptions.getIndexes()`
  2. Use MongoDB Compass to analyze query performance
  3. Check network latency if using MongoDB Atlas

### Out of Memory
- **Issue**: `JavaScript heap out of memory`
- **Solution**:
  1. Limit query result sizes using pagination
  2. Use projection to fetch only needed fields
  3. Increase Node.js memory: `node --max-old-space-size=4096 src/index.js`

## Data Migration from PostgreSQL

If migrating from PostgreSQL to MongoDB:

### Export Data from PostgreSQL
```bash
# Export users
psql -d subsentry -c "COPY users TO STDOUT WITH CSV HEADER" > users.csv

# Export subscriptions
psql -d subsentry -c "COPY subscriptions TO STDOUT WITH CSV HEADER" > subscriptions.csv
```

### Import Data to MongoDB
```javascript
// migration-script.js
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Subscription = require('./src/models/Subscription');
const fs = require('fs');
const csv = require('csv-parser');

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/subsentry');
  
  // Import users
  const users = [];
  fs.createReadStream('users.csv')
    .pipe(csv())
    .on('data', (row) => users.push(row))
    .on('end', async () => {
      await User.Model.insertMany(users);
      console.log('Users migrated');
    });
    
  // Similar for subscriptions...
}

migrate();
```

## Performance Tips

1. **Use Indexes**: Always index fields used in queries
2. **Pagination**: Use `.limit()` and `.skip()` for large result sets
3. **Projection**: Fetch only needed fields using `.select()`
4. **Connection Pooling**: Mongoose handles this automatically
5. **Avoid Large Documents**: Keep documents under 16MB

## Security Best Practices

1. **Enable Authentication**: Always use username/password in production
2. **Use SSL/TLS**: Enable encrypted connections for MongoDB Atlas
3. **Whitelist IPs**: Restrict database access to known IP addresses
4. **Regular Backups**: Use `mongodump` or MongoDB Atlas backups
5. **Environment Variables**: Never commit database credentials

## Useful Commands

```bash
# Backup database
mongodump --db subsentry --out ./backup

# Restore database
mongorestore --db subsentry ./backup/subsentry

# Export collection as JSON
mongoexport --db subsentry --collection users --out users.json

# Import collection from JSON
mongoimport --db subsentry --collection users --file users.json
```

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
