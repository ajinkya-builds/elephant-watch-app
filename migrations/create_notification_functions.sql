-- Function to create notifications for users in the same division/range
CREATE OR REPLACE FUNCTION public.create_activity_notification()
RETURNS TRIGGER AS $$
DECLARE
    division_id VARCHAR(50);
    range_id VARCHAR(50);
    user_record RECORD;
BEGIN
    -- Get division and range IDs for the activity
    SELECT 
        d.division_id,
        r.range_id
    INTO division_id, range_id
    FROM public.coordinates c
    JOIN public.divisions_new d ON c."Division_Name" = d.name
    JOIN public.ranges_new r ON c."Range_Name" = r.name
    WHERE ST_DWithin(
        ST_SetSRID(ST_MakePoint(c.beat_lon, c.beat_lat), 4326),
        ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326),
        0.1  -- Approximately 11km radius
    )
    LIMIT 1;

    -- If we found a division and range, create notifications for users in that area
    IF division_id IS NOT NULL AND range_id IS NOT NULL THEN
        -- Create notifications for users in the same division/range
        FOR user_record IN 
            SELECT DISTINCT u.id
            FROM public.users u
            JOIN public.user_divisions ud ON u.id = ud.user_id
            JOIN public.user_ranges ur ON u.id = ur.user_id
            WHERE ud.division_id = division_id
            AND ur.range_id = range_id
            AND u.id != NEW.user_id  -- Don't notify the user who created the activity
        LOOP
            INSERT INTO public.notifications (
                user_id,
                activity_observation_id,
                title,
                message,
                type,
                division_id,
                range_id
            ) VALUES (
                user_record.id,
                NEW.id,
                'New Activity Reported',
                CASE 
                    WHEN NEW.observation_type = 'direct' THEN
                        'New direct elephant sighting reported in your area'
                    WHEN NEW.observation_type = 'indirect' THEN
                        'New indirect elephant activity reported in your area'
                    ELSE
                        'New elephant-related incident reported in your area'
                END,
                'activity',
                division_id,
                range_id
            );
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create notifications on new activity observations
CREATE TRIGGER create_activity_notification_trigger
    AFTER INSERT ON public.activity_observation
    FOR EACH ROW
    EXECUTE FUNCTION public.create_activity_notification();

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notification_as_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notifications
    SET is_read = TRUE,
        updated_at = NOW()
    WHERE id = notification_id
    AND EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = notifications.user_id
        AND users.auth_id = auth.uid()
    );
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notifications count for a user
CREATE OR REPLACE FUNCTION public.get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM public.notifications
    WHERE user_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
    AND is_read = FALSE;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent notifications for a user
CREATE OR REPLACE FUNCTION public.get_recent_notifications(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    title TEXT,
    message TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN,
    activity_observation_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.message,
        n.type,
        n.created_at,
        n.is_read,
        n.activity_observation_id
    FROM public.notifications n
    WHERE n.user_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
    ORDER BY n.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 