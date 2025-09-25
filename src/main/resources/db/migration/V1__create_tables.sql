CREATE TABLE event_type (
   id SERIAL PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   description TEXT
);

CREATE TABLE venue_type (
   id SERIAL PRIMARY KEY,
   name VARCHAR(100) NOT NULL,
   category VARCHAR(100) NOT NULL,
   description TEXT
);

CREATE TABLE venue_event_eligibility (
   id SERIAL PRIMARY KEY,
   venue_type_id INT NOT NULL REFERENCES venue_type(id),
   event_type_id INT NOT NULL REFERENCES event_type(id)
);
