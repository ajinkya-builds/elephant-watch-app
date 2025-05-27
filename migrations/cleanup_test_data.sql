-- Clean up test data in reverse order of dependencies
DELETE FROM beat_polygons WHERE beat_id = 'BEAT001';
DELETE FROM beats WHERE beat_id = 'BEAT001';
DELETE FROM ranges WHERE range_id = 'RNG001';
DELETE FROM divisions WHERE division_id = 'DIV001'; 