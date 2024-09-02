const express = require('express');
const bodyParser = require('body-parser');
const { generateQuestions } = require('./aiService'); // AI service integration
const { saveSession, getSession } = require('./database'); // Database functions

const app = express();
app.use(bodyParser.json());

app.post('/api/generate-questions', async (req, res) => {
  const { sectionType } = req.body;
  const questions = await generateQuestions(sectionType);
  res.json(questions);
});

app.post('/api/save-session', async (req, res) => {
  const sessionData = req.body;
  await saveSession(sessionData);
  res.sendStatus(200);
});

app.get('/api/get-session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const session = await getSession(sessionId);
  res.json(session);
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});