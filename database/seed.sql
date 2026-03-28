-- ============================================
-- GolfDraw Platform — Seed Data
-- Run after schema.sql
-- ============================================

-- Insert sample charities
INSERT INTO charities (name, description, logo_url, website, is_active) VALUES
('Golf for Good Foundation', 'Supporting youth golf programs worldwide and making the sport accessible to underprivileged communities.', '/images/charities/golf-for-good.png', 'https://golfforgood.org', TRUE),
('The First Tee', 'Building game changers by empowering kids and teens through golf to build inner strength, self-confidence, and resilience.', '/images/charities/first-tee.png', 'https://firsttee.org', TRUE),
('Folds of Honor', 'Providing scholarships to spouses and children of America''s fallen and disabled service members.', '/images/charities/folds-of-honor.png', 'https://foldsofhonor.org', TRUE),
('PGA REACH', 'The charitable foundation of the PGA of America, supporting community enrichment, youth development, and military programs.', '/images/charities/pga-reach.png', 'https://pgareach.org', TRUE),
('Birdies for the Brave', 'Premier military charity initiative of the PGA TOUR, supporting military service members and their families.', '/images/charities/birdies-brave.png', 'https://birdiesforthebrave.org', TRUE);

-- Note: Users, subscriptions, and scores are created through the application.
-- Admin user should be created via Supabase Auth and then manually updated:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@golfdraw.com';
