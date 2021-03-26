require('dotenv').config();
require('newrelic');
const express = require('express');
const bodyParser = require('body-parser');

const db = require('../database/postgres.js');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log('Serving GET request to "/"')
  db.test((err, data) => {
    console.log(data);
    res.status(200).send(data)
  });
})

app.get('/qa/questions', (req, res) => {
  console.log('Serving GET request for questions');
  const product_id = req.query.product_id;
  const whichPage = req.query.page || 1;
  const count = Number(req.query.count) || 5;

  const returnObject = {
    product_id: product_id,
    results: []
  }

  const memoizedQ = {};
  const memoizedA = {};
  let countCheck = new Set();

  db.getQuestions(product_id, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      data.forEach((datum) => {
        const {
          question_id,
          question_body,
          question_date,
          asker_name,
          question_helpfulness,
          reported,
          id,
          body,
          date,
          answerer_name,
          helpfulness,
          answer_reported,
          photo_url
        } = datum;
        if (!countCheck.has(question_id)) {
          if (countCheck.size === count) {
            return;
          }
          countCheck.add(question_id)
        }
        if (!memoizedQ.hasOwnProperty(question_id)) {
          if (reported) {
            return;
          }
          const questionObject = {
            question_id,
            question_body,
            question_date,
            asker_name,
            question_helpfulness,
            reported,
            answers: {}
          }
          if (id) {
            const answerObject = {
              id,
              body,
              date,
              answerer_name,
              helpfulness,
              photos: []
            }
            questionObject.answers[id] = answerObject;
            memoizedA[id] = true;
          }
          if (photo_url) {
            questionObject.answers[id].photos.push(photo_url);
          }
          returnObject.results.push(questionObject);
          memoizedQ[question_id] = returnObject.results.length - 1;
        } else if (!memoizedA.hasOwnProperty(id)) {
          if (answer_reported) {
            return;
          }
          const answerObject = {
            id,
            body,
            date,
            answerer_name,
            helpfulness,
            photos: []
          }
          if (photo_url) {
            answerObject.photos.push(photo_url);
          }

          returnObject.results[memoizedQ[question_id]].answers[id] = answerObject;
          memoizedA[id] = true;
        } else if (photo_url) {
          returnObject.results[memoizedQ[question_id]].answers[id].photos.push(photo_url);
        }

      })
      res.status(200).send(returnObject);
    }
  })


})



app.get('/qa/questions/:question_id/answers', (req, res) => {
  console.log('Serving GET request for answers to a question');
  const question_id = req.params.question_id;
  const whichPage = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  const returnObject = {
    question: question_id,
    page: whichPage,
    count,
    results: []
  };

  const memoizedA = {};

  let countCheck = new Set;


  db.getAnswers(question_id, (err, data) => {
    if (err) {
      console.log(err)
      res.status(200).send(err);
    } else {
      data.forEach((datum) => {
        const {
          id,
          body,
          date,
          answerer_name,
          helpfulness,
          answer_reported,
          photo_url,
          photo_id
        } = datum;
        if (!countCheck.has(id)) {
          if (countCheck.size === count) {
            return;
          }
          countCheck.add(id)
        }

        if (!memoizedA.hasOwnProperty(id)) {
          if (answer_reported) {
            return;
          }
          const answerObject = {
            answer_id: id,
            body,
            date,
            answerer_name,
            helpfulness,
            photos: []
          }
          if (photo_url) {
            const photoObject = {
              id: photo_id,
              url: photo_url
            }
            answerObject.photos.push(photoObject);
          }

          returnObject.results.push(answerObject);
          memoizedA[id] = returnObject.results.length - 1;
        } else if (photo_url) {
          const photoObject = {
            id: photo_id,
            url: photo_url
          }
          returnObject.results[memoizedA[id]].photos.push(photoObject);
        }
      })
      res.status(200).send(returnObject);
    }


  })

})

app.post('/qa/questions', (req, res) => {
  console.log('Serving POST request to add a question');
  const body = req.body.body;
  const name = req.body.name;
  const email = req.body.email;
  const product_id = req.body.product_id;

  db.postQuestion(product_id, body, name, email, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      res.status(201).send('Created');
    }
  })
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  console.log('Serving POST request to add an answer');
  const question_id = req.params.question_id;
  const body = req.body.body;
  const name = req.body.name;
  const email = req.body.email;
  const photos = req.body.photos;

  db.postAnswer(question_id, body, name, email, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      if (photos.length > 0) {
        photos.forEach((photo) => {
          db.postPhotos(data[0].id, photo, (err, data) => {
            if (err) {
              console.log(err);
              res.status(200).send(err);
            } else {
              console.log('Photo stored in database')
            }
          })
        })
        res.status(201).send('Created');
      } else {
        res.status(201).send('Created');
      }

    }
  })
})

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  console.log('Serving PUT request to mark a question helpful');
  const question_id = req.params.question_id;

  db.putQuestionHelpful(question_id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      res.status(204).end();
    }
  })
})

app.put('/qa/questions/:question_id/report', (req, res) => {
  console.log('Serving PUT request to report a question');
  const question_id = req.params.question_id;

  db.putQuestionReport(question_id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      res.status(204).end();
    }
  })
})

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  console.log('Serving PUT request to mark an answer helpful');
  const answer_id = req.params.answer_id;

  db.putAnswerHelpful(answer_id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      res.status(204).end();
    }
  })
})

app.put('/qa/answers/:answer_id/report', (req, res) => {
  console.log('Serving PUT request to report an answer');
  const answer_id = req.params.answer_id;

  db.putAnswerReport(answer_id, (err, data) => {
    if (err) {
      console.log(err);
      res.status(200).send(err);
    } else {
      res.status(204).end();
    }
  })
})







app.listen(port, () => {
  console.log(`Server is up and running on port ${port}!`)
})