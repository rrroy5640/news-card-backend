import OpenAI from "openai";

const express = require("express");
const router = express.Router();
const axios = require("axios");
const openai = new OpenAI();

const NodeCache = require("node-cache");
// set cache to expire in 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

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
    newsData.data.articles.map(async (article) => {
      const prompt = `Generate a summary for the following article: ${article.title}.\n\nArticle: ${article.description}`;
      const gptResponse = await openai.complete({
        engine: "davinci",
        prompt: prompt,
        max_tokens: 100,
        temperature: 0.5,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      article.summary = gptResponse.data.choices[0].text;
    });

    setNewsToCache(topic, newsData);
  }

  res.json(newsData);
});

module.exports = router;
