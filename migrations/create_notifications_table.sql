-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_observation_id UUID REFERENCES public.activity_observation(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('activity', 'system', 'alert')),
    division_id VARCHAR(50),
    range_id VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_activity_observation_id ON public.notifications(activity_observation_id);
CREATE INDEX idx_notifications_division_id ON public.notifications(division_id);
CREATE INDEX idx_notifications_range_id ON public.notifications(range_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = notifications.user_id
        AND users.auth_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = notifications.user_id
        AND users.auth_id = auth.uid()
    )
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add comments
COMMENT ON TABLE public.notifications IS 'Stores user notifications for activities and system alerts';
COMMENT ON COLUMN public.notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN public.notifications.user_id IS 'User who will receive the notification';
COMMENT ON COLUMN public.notifications.activity_observation_id IS 'Reference to the related activity observation';
COMMENT ON COLUMN public.notifications.title IS 'Notification title';
COMMENT ON COLUMN public.notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.notifications.type IS 'Type of notification (activity, system, or alert)';
COMMENT ON COLUMN public.notifications.division_id IS 'Division ID for activity-based notifications';
COMMENT ON COLUMN public.notifications.range_id IS 'Range ID for activity-based notifications';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the notification has been read by the user'; 