-- Refresh all dashboard views to update the dashboard data
-- Using DO blocks to handle potential errors if views don't exist

-- Refresh v_elephant_population_trends
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_population_trends;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_population_trends does not exist';
END $$;

-- Refresh v_elephant_activity_by_time
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_time;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_time does not exist';
END $$;

-- Refresh v_elephant_activity_by_season
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_season;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_season does not exist';
END $$;

-- Refresh v_elephant_activity_by_land_type
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_land_type;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_land_type does not exist';
END $$;

-- Refresh v_elephant_activity_by_division
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_division;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_division does not exist';
END $$;

-- Refresh v_elephant_activity_by_range
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_range;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_range does not exist';
END $$;

-- Refresh v_elephant_activity_by_beat
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_by_beat;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_by_beat does not exist';
END $$;

-- Refresh v_elephant_activity_timeline
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_timeline;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_timeline does not exist';
END $$;

-- Refresh v_elephant_activity_heatmap
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_heatmap;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_heatmap does not exist';
END $$;

-- Refresh v_elephant_activity_summary
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_summary;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_summary does not exist';
END $$;

-- Refresh v_elephant_activity_observations_by_type
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_observations_by_type;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_observations_by_type does not exist';
END $$;

-- Refresh v_elephant_activity_loss_reports
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_elephant_activity_loss_reports;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_elephant_activity_loss_reports does not exist';
END $$;

-- Refresh v_total_observations
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_total_observations;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_total_observations does not exist';
END $$;

-- Refresh v_total_loss
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_total_loss;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_total_loss does not exist';
END $$;

-- Refresh v_total_elephants
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_total_elephants;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_total_elephants does not exist';
END $$;

-- Refresh v_male_elephant_counts
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_male_elephant_counts;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_male_elephant_counts does not exist';
END $$;

-- Refresh v_female_elephant_counts
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_female_elephant_counts;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_female_elephant_counts does not exist';
END $$;

-- Refresh v_calve_count
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_calve_count;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_calve_count does not exist';
END $$;

-- Refresh v_division_statistics
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_division_statistics;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_division_statistics does not exist';
END $$;

-- Refresh v_activity_heatmap
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_activity_heatmap;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_activity_heatmap does not exist';
END $$;

-- Refresh v_recent_observations
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW v_recent_observations;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View v_recent_observations does not exist';
END $$;

-- Refresh dashboard_total_elephants
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_total_elephants;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View dashboard_total_elephants does not exist';
END $$;

-- Refresh dashboard_elephant_demographics
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_elephant_demographics;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View dashboard_elephant_demographics does not exist';
END $$;

-- Refresh dashboard_observation_types
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_observation_types;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View dashboard_observation_types does not exist';
END $$;

-- Refresh dashboard_recent_activities
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_recent_activities;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View dashboard_recent_activities does not exist';
END $$;

-- Refresh dashboard_monthly_trends
DO $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_monthly_trends;
EXCEPTION WHEN undefined_table THEN
    RAISE NOTICE 'View dashboard_monthly_trends does not exist';
END $$; 