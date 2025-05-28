-- Create error_logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('Error', 'Warning')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create login_logs table
CREATE TABLE IF NOT EXISTS login_logs (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Success', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    job TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Success', 'Failed')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Allow admin to read error_logs" ON error_logs
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin to read login_logs" ON login_logs
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin to read system_logs" ON system_logs
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to log errors
CREATE OR REPLACE FUNCTION log_error(level TEXT, message TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO error_logs (level, message)
    VALUES (level, message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log logins
CREATE OR REPLACE FUNCTION log_login(email TEXT, status TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO login_logs (email, status)
    VALUES (email, status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log system events
CREATE OR REPLACE FUNCTION log_system_event(job TEXT, status TEXT, details TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    INSERT INTO system_logs (job, status, details)
    VALUES (job, status, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 