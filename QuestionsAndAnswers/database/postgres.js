const Db = require('pg').Pool;
const { DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE, DB_PORT } = process.env;
const db = new Db({
  user: DB_USER,
  password: DB_PASSWORD,
  host: DB_HOST,
  database: DB_DATABASE,
  port: DB_PORT,
});

const test = (callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return console.error(`Can't get client`, err);
    } else {
      client.query('select * from questions where id = 1', (err, result) => {
        release()
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const getQuestions = (productId, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `select q.id AS question_id, q.body AS question_body, q.date_written AS question_date, q.asker_name, q.helpful AS question_helpfulness, q.reported, a.id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, a.reported AS answer_reported, p.photo_url from questions q left join answers a on (q.id = a.question_id) left join photos p on (a.id = p.answer_id) where q.product_id = ${productId} order by q.id ASC`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const getAnswers = (questionId, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `select a.id, a.body, a.date_written AS date, a.answerer_name, a.helpful AS helpfulness, a.reported AS answer_reported, p.photo_url, p.id AS photo_id from answers a left join photos p on (a.id = p.answer_id) where a.question_id = ${questionId} order by a.id ASC`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const postQuestion = (product_id, body, name, email, callback) => {
  const date = new Date().toISOString();
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `INSERT INTO questions (product_id, body, date_written, asker_name, asker_email, reported, helpful) values (${product_id}, '${body}', '${date}', '${name}', '${email}', FALSE, 0)`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const postAnswer = (question_id, body, name, email, callback) => {
  const date = new Date().toISOString();
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `INSERT INTO answers (question_id, body, date_written, answerer_name, answerer_email, reported, helpful) values (${question_id}, '${body}', '${date}', '${name}', '${email}', FALSE, 0) RETURNING id`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const postPhotos = (answer_id, photo_url, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `INSERT INTO photos (answer_id, photo_url) values (${answer_id}, '${photo_url}')`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const putQuestionHelpful = (question_id, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `UPDATE questions SET helpful = helpful+1 WHERE id = ${question_id}`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const putQuestionReport = (question_id, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `UPDATE questions SET reported = TRUE WHERE id = ${question_id}`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const putAnswerHelpful = (answer_id, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `UPDATE answers SET helpful = helpful+1 WHERE id = ${answer_id}`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}

const putAnswerReport = (answer_id, callback) => {
  db.connect((err, client, release) => {
    if (err) {
      return callback(err, null);
    } else {
      const sql = `UPDATE answers SET reported = TRUE WHERE id = ${answer_id}`;
      client.query(sql, (err, result) => {
        release();
        if (err) {
          return callback(err, null);
        } else {
          return callback(null, result.rows);
        }
      })
    }
  })
}




module.exports = {
  test,
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  postPhotos,
  putQuestionHelpful,
  putQuestionReport,
  putAnswerHelpful,
  putAnswerReport
}
