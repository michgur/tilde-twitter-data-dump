/* eslint-disable require-jsdoc */
const {Client} = require('twitter-api-sdk');
const {BigQuery} = require('@google-cloud/bigquery');
const {logger} = require('./utils/logging');

// require('dotenv').config();
const {LOCAL, BEARER_TOKEN, BQ_CREDENTIALS} = process.env;

const options = LOCAL === 'true' ?
    {keyFilename: BQ_CREDENTIALS} :
    {credentials: JSON.parse(BQ_CREDENTIALS)};
const bigquery = new BigQuery(options);

console.log(`using ${LOCAL === 'true' ? 'local' : 'cloud'} ${BEARER_TOKEN}`);
const twitter = new Client(BEARER_TOKEN);

function getUsername(users, id) {
  return users.find((user) => user.id === id)?.username;
}

exports.twitterBQ = async function main(query, res) {
  let stream = undefined;
  try {
    stream = twitter.tweets.tweetsRecentSearch({
      'query': `${query} lang:en -is:retweet -is:reply -is:quote is:verified`,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'expansions': ['author_id'],
      'user.fields': ['username'],
    });
  } catch (e) {
    logger.error(`failed to create tweet stream ${e.stack}`);
    res.status(500).send(`failed to create tweet stream ${e.stack}`);
    return;
  }

  try {
    for await (const tweets of stream) {
      console.log(`adding ${tweets['data'].length} tweets`);

      const users = tweets['includes']['users'];
      const bqRes = await bigquery
          .dataset('tilde_data')
          .table('tweets')
          .insert(tweets['data'].map(({id, created_at, public_metrics, author_id, text, au}) => ({
            id, public_metrics, author_id, text,
            created_at: created_at ? created_at.slice(0, -1) : undefined,
            query: query,
            author_handle: getUsername(users, author_id),
          })));
      console.log(JSON.stringify(bqRes, null, 4));
    }
  } catch (e) {
    logger.error(`an error occured while processing tweets ${JSON.stringify(e, null, 4)} ${e.stack}`);
    res.status(500).send(`an error occured while processing tweets ${JSON.stringify(e, null, 4)} ${e.stack}`);
    return;
  }
  logger.info(`successfuly added tweets`);
  res.status(200).send(`successfuly added tweets`);
};
