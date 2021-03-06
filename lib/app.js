(function() {
  var APP_PORT, Bot, FB_TOKEN, FB_VERIFY, _, _s, http, request;

  http = require("http");

  Bot = require("messenger-bot");

  _ = require("underscore");

  _s = require("underscore.string");

  request = require("request");

  FB_TOKEN = process.env.FB_TOKEN;

  FB_VERIFY = process.env.FB_VERIFY;

  APP_PORT = process.env.PORT || 5000;

  (function() {
    var bot;
    bot = new Bot({
      "token": FB_TOKEN,
      "verify": FB_VERIFY
    });
    bot.on("error", function(err) {
      return console.log("boterr:", err);
    });
    bot.on("message", function(payload, reply) {
      var apiQuery, apiRequest, messageText;
      messageText = payload.message.text;
      if (_s(messageText).startsWith("rowell search for ")) {
        reply({
          "text": "Hi there! Hmmm.. Wait a moment.."
        });
        apiQuery = messageText.split("rowell search for ")[1];
        apiRequest = "http://partner.become.co.jp/json?partner=become&filter=All&image_size=200&num=5&start=1&q=" + apiQuery;
        return request.get(apiRequest, function(err, resp, body) {
          var apiResponse, i, len, offer, offers, replyBody, respBody, result, results;
          if (err || resp.statusCode !== 200) {
            throw "devlog: Encountered an error during become partner api call.";
          }
          respBody = body.substr(10);
          respBody = respBody.substr(0, respBody.length - 1);
          apiResponse = JSON.parse(respBody);
          results = apiResponse.service_response.service_response.results.result;
          if (results.length > 0) {
            offers = [];
            for (i = 0, len = results.length; i < len; i++) {
              result = results[i];
              offer = {
                "title": "" + result.title,
                "subtitle": "¥" + result.max_price,
                "image_url": "" + result.image_url,
                "buttons": [
                  {
                    "type": 'web_url',
                    "title": 'View Offer',
                    "url": "" + result.merchant.url
                  }, {
                    "type": 'web_url',
                    "title": 'Search More',
                    "url": "www.become.co.jp/" + apiQuery + ".html"
                  }
                ]
              };
              offers.push(offer);
              if (offers.length > 5) {
                break;
              }
            }
            replyBody = {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": offers
                }
              }
            };
            console.log("devlog: Sending Search Result reply");
            return reply(replyBody);
          } else {
            console.log("devlog: Sending No Result reply");
            return reply({
              "text": "Sorry but I can't find any offer for " + apiQuery
            });
          }
        });
      } else {
        return reply({
          "text": "Sorry but I can't understand what you're saying. Let me think for a while then I'll get back to you."
        });
      }
    });
    return http.createServer(bot.middleware()).listen(APP_PORT, function() {
      return console.log("devlog: Server running on PORT " + APP_PORT);
    });
  })();

}).call(this);

//# sourceMappingURL=app.js.map
