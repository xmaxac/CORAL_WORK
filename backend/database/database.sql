CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	email VARCHAR(255) UNIQUE,
	name VARCHAR(255),
	username VARCHAR(255) UNIQUE,
	profile_image VARCHAR(255),
  cover_image VARCHAR(255),
	bio TEXT,
	link VARCHAR(255),
	password VARCHAR(255),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE followers (
    follower_id UUID NOT NULL,
    followed_id UUID NOT NULL,
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (followed_id) REFERENCES users(id),
    PRIMARY KEY (follower_id, followed_id)
);

CREATE TABLE reports (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID REFERENCES users(id),
	latitude DECIMAL(10, 8) NOT NULL,
	longitude DECIMAL (10, 8) NOT NULL,
	country_code CHAR(3) NOT NULL,
	description TEXT NOT NULL,
	report_date DATE NOT NULL DEFAULT CURRENT_DATE,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE report_photos (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
	photo_url TEXT NOT NULL,
	photo_description TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_country ON reports(country_code);
CREATE INDEX idx_reports_photos_report ON report_photos(report_id);

CREATE OR REPLACE FUNCTION generate_guest_identifier()
RETURNS VARCHAR(10) AS $$
DECLARE
	new_identifier VARCHAR(10);
BEGIN
	new_identifier := 'Guest_' || floor(random() * 9999 + 1)::TEXT;
	RETURN new_identifier;
END;
$$ LANGUAGE plpgsql;