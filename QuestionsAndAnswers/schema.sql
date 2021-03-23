DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS photos;

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  body VARCHAR NOT NULL,
  date_written DATE NOT NULL,
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported BOOLEAN NOT NULL,
  helpful INTEGER NOT NULL
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  body VARCHAR NOT NULL,
  date_written DATE NOT NULL,
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported BOOLEAN NOT NULL,
  helpful INTEGER NOT NULL
);

CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  photo_url VARCHAR NOT NULL
);

copy questions from '/home/mcvey/hackreactor/work/SDC/QuestionsAndAnswers/data/questions.csv' delimiter ',' csv header;

copy answers from '/home/mcvey/hackreactor/work/SDC/QuestionsAndAnswers/data/answers.csv' delimiter ',' csv header;

copy photos from '/home/mcvey/hackreactor/work/SDC/QuestionsAndAnswers/data/answers_photos.csv' delimiter ',' csv header;

create index questions_id_index on questions (id);

create index questions_product_id_index on questions (product_id);

create index answers_question_id_index on answers (question_id);

create index photos_answer_id_index on photos (answer_id);