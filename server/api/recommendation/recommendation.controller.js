/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/recommendations              ->  index
 * POST    /api/recommendations              ->  create
 * GET     /api/recommendations/:id          ->  show
 * PUT     /api/recommendations/:id          ->  update
 * DELETE  /api/recommendations/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Parkland = require('../parkland/parkland.model');
var Playground = require('../playground/playground.model');
var Recommendation = require('./recommendation.model');
var SprayPark = require('../spray_park/spray_park.model');
var Tree = require('../tree/tree.model');

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function responseWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    var updated = _.merge(entity, updates);
    return updated.saveAsync()
      .spread(function(updated) {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.removeAsync()
        .then(function() {
          res.status(204).end();
        });
    }
  };
}

// Handles location recommendations
exports.location = function(req, res) {
  var query_dict = req.query;
  
  // Lat & Long
  var latitude = Number(req.params.latitude);
  var longitude = Number(req.params.longitude);
  
  // Radius for recommendations
  if('radius' in query_dict) {
    // Use the user's
    var radius = Number(query_dict['radius']);
  } else {
    // Default to 1km
    var radius = 1.0;
  }
  var degrees_radius = radius * (1 / 110.574);
  
  // TODO: Change from a square to a circle to match the picture
  var search_square = [[
    [longitude - degrees_radius, latitude - degrees_radius],
    [longitude - degrees_radius, latitude + degrees_radius],
    [longitude + degrees_radius, latitude + degrees_radius],
    [longitude + degrees_radius, latitude - degrees_radius],
    [longitude - degrees_radius, latitude - degrees_radius]
  ]];
  var search_polygon = {type: 'Polygon', coordinates: search_square};
  
  // Parklands
  // TODO: figure out duplicate so i can exclude id...
  var parklands = Parkland.find().where('geometry').intersects()
   .geometry(search_polygon).lean().exec(function(parkland_err, parkland_ret) {
     if(parkland_err) return handleError(parkland_err);

  // Playgrounds
  var playgrounds = Playground.find().where('location').within()
   .geometry(search_polygon).lean().exec(function(playground_err, playground_ret) {
    if(playground_err) return handleError(playground_err);

  // Spray Parks
  var spray_parks = SprayPark.find().where('location').within()
   .geometry(search_polygon).lean().exec(function(spray_park_err, spray_park_ret) {
    if(spray_park_err) return handleError(spray_park_err);

  // Trees
  var trees = []
  var num_things = parkland_ret.length;
  for(var parkland of parkland_ret) {
    // Find trees within parkland
    var sub_trees = Tree.find()
     .where('location').within().geometry(parkland.geometry).lean().exec(function(tree_err, tree_ret) {
      if(tree_err) return handleError(tree_err);    
      trees = trees.concat(tree_ret);
      num_things -= 1;
      if(num_things == 0) {
        // Return the JSON with all of our recommendations
        res.json({
          parklands: parkland_ret,
          trees: trees,
          playgrounds: playground_ret,
          spray_parks: spray_park_ret
        });
      }
     }); // Trees
  }


   }); // Spray Parks
   }); // Playgrounds
   }); // Parklands
}

// Gets a list of Recommendations
exports.index = function(req, res) {
  Recommendation.findAsync()
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Gets a single Recommendation from the DB
exports.show = function(req, res) {
  Recommendation.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Creates a new Recommendation in the DB
exports.create = function(req, res) {
  Recommendation.createAsync(req.body)
    .then(responseWithResult(res, 201))
    .catch(handleError(res));
};

// Updates an existing Recommendation in the DB
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Recommendation.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(responseWithResult(res))
    .catch(handleError(res));
};

// Deletes a Recommendation from the DB
exports.destroy = function(req, res) {
  Recommendation.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
};
