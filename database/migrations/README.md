# Database Migrations

This folder contains SQL migration files for the SubSentry database.

## Running Migrations

Migrations should be run in numerical order. Run them manually using psql:

```bash
# Run all migrations in order
psql -U your_username -d subsentry -f database/migrations/001_create_users_table.sql
psql -U your_username -d subsentry -f database/migrations/002_create_subscriptions_table.sql
```

Or run them all at once:

```bash
for file in database/migrations/*.sql; do
  psql -U your_username -d subsentry -f "$file"
done
```

## Migration Files

- `001_create_users_table.sql` - Creates the users table with email and password_hash
- `002_create_subscriptions_table.sql` - Creates the subscriptions table with foreign key to users

## Schema Overview

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password_hash` (VARCHAR(255) NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Subscriptions Table
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER FOREIGN KEY → users.id)
- `name` (VARCHAR(255) NOT NULL)
- `renewal_date` (DATE NOT NULL)
- `cost` (DECIMAL(10,2) NOT NULL)
- `reminder_offset_days` (INTEGER DEFAULT 7)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Rollback

To rollback migrations, you'll need to manually drop tables or create rollback scripts:

```sql
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
