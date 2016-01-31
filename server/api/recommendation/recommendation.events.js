/**
 * Recommendation model events
 */

'use strict';

var EventEmitter = require('events').EventEmitter;
var Recommendation = require('./recommendation.model');
var RecommendationEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RecommendationEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Recommendation.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    RecommendationEvents.emit(event + ':' + doc._id, doc);
    RecommendationEvents.emit(event, doc);
  }
}

module.exports = RecommendationEvents;
