const express = require("express");
const router = express.Router();
const axios = require("axios");

const NodeCache = require("node-cache");
// set cache to expire in 1 hour
const cache = new NodeCache({ stdTTL: 3600*12 });

function getNewsFromCache(topic) {
  return cache.get(topic);
}

function setNewsToCache(topic, newsData) {
  cache.set(topic, newsData);
}

router.get("/:topic", async (req, res) => {
  const topic = req.params.topic;
  const apikey = process.env.apikey;
  const url = `https://gnews.io/api/v4/search?q=${topic}&lang=en&country=au&max=10&apikey=${apikey}`;

  let newsData = getNewsFromCache(topic);

  if (!newsData) {
    const response = await axios.get(url);
    newsData = response.data;

    setNewsToCache(topic, newsData);
  }

  res.json(newsData);
});

module.exports = router;