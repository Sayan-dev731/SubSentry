-- Sample seed data for development/testing

-- Insert sample users (passwords are hashed version of 'password123')
-- In production, use proper bcrypt hashing
INSERT INTO users (email, password, name) VALUES
  ('john.doe@example.com', '$2b$10$YourHashedPasswordHere', 'John Doe'),
  ('jane.smith@example.com', '$2b$10$YourHashedPasswordHere', 'Jane Smith')
ON CONFLICT (email) DO NOTHING;

-- Insert sample subscriptions
-- Replace 1 and 2 with actual user IDs if needed
INSERT INTO subscriptions (user_id, name, amount, billing_cycle, next_billing_date, category, notes) VALUES
  (1, 'Netflix', 15.99, 'monthly', '2025-11-15', 'Entertainment', 'Premium plan'),
  (1, 'Spotify', 9.99, 'monthly', '2025-11-20', 'Entertainment', 'Individual plan'),
  (1, 'Adobe Creative Cloud', 54.99, 'monthly', '2025-11-10', 'Software', 'All apps plan'),
  (1, 'Amazon Prime', 139.00, 'yearly', '2026-03-15', 'Shopping', 'Annual subscription'),
  (2, 'GitHub Pro', 4.00, 'monthly', '2025-11-18', 'Development', 'Pro plan'),
  (2, 'ChatGPT Plus', 20.00, 'monthly', '2025-11-22', 'AI Tools', 'Plus subscription'),
  (2, 'Google Workspace', 12.00, 'monthly', '2025-11-25', 'Productivity', 'Business Starter')
ON CONFLICT DO NOTHING;
