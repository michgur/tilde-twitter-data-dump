// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const axios = require('axios');
const express = require('express');
const {pinoHttp, logger} = require('./utils/logging');
const {twitterBQ} = require('./twitter_bq');

const app = express();

const queries = [
  'NLP',
  'AI',
  'Natural Language Processing',
  'Artificial Intelligence',
  'GPT3',
  'ChatGPT',
  'Midjouney',
  'DALLE',
  '@elonmusk',
  'Elon Musk',
  'Iphone',
  'Apple',
  'Tesla',
  'Trump',
  'Biden',
  'Meta',
  'Metaverse',
  'NYC',
  'New York',
  'NFT',
  'Amazon',
  'AWS',
  'Alexa',
  'Microsoft',
  'Google',
  'Twitter',
  'Jeff Bezos',
  'Bill Gates',
  'Machine Learning',
  'Deep Learning',
];

// Use request-based logger for log correlation
app.use(pinoHttp);

// Example endpoint
app.get('/', async (req, res) => {
  // Use basic logger without HTTP request info
  logger.info({
    logField: 'custom-entry',
    arbitraryField: 'custom-entry',
  }); // Example of structured logging
  // Use request-based logger with log correlation

  req.log.info('Child logger with trace Id.'); // https://cloud.google.com/run/docs/logging#correlate-logs
  const query = queries[Math.floor(Math.random() * queries.length)];
  res.log.info(`making request, picked ${query}`);
  twitterBQ(query, res); // res handled in twitter_bq.js
});

module.exports = app;
