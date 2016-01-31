'use strict';

var app = require('../..');
var request = require('supertest');

var newRecommendation;

describe('Recommendation API:', function() {

  describe('GET /api/recommendations', function() {
    var recommendations;

    beforeEach(function(done) {
      request(app)
        .get('/api/recommendations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          recommendations = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(recommendations).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/recommendations', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/recommendations')
        .send({
          name: 'New Recommendation',
          info: 'This is the brand new recommendation!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          newRecommendation = res.body;
          done();
        });
    });

    it('should respond with the newly created recommendation', function() {
      expect(newRecommendation.name).to.equal('New Recommendation');
      expect(newRecommendation.info).to.equal('This is the brand new recommendation!!!');
    });

  });

  describe('GET /api/recommendations/:id', function() {
    var recommendation;

    beforeEach(function(done) {
      request(app)
        .get('/api/recommendations/' + newRecommendation._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          recommendation = res.body;
          done();
        });
    });

    afterEach(function() {
      recommendation = {};
    });

    it('should respond with the requested recommendation', function() {
      expect(recommendation.name).to.equal('New Recommendation');
      expect(recommendation.info).to.equal('This is the brand new recommendation!!!');
    });

  });

  describe('PUT /api/recommendations/:id', function() {
    var updatedRecommendation

    beforeEach(function(done) {
      request(app)
        .put('/api/recommendations/' + newRecommendation._id)
        .send({
          name: 'Updated Recommendation',
          info: 'This is the updated recommendation!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRecommendation = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRecommendation = {};
    });

    it('should respond with the updated recommendation', function() {
      expect(updatedRecommendation.name).to.equal('Updated Recommendation');
      expect(updatedRecommendation.info).to.equal('This is the updated recommendation!!!');
    });

  });

  describe('DELETE /api/recommendations/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/recommendations/' + newRecommendation._id)
        .expect(204)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when recommendation does not exist', function(done) {
      request(app)
        .delete('/api/recommendations/' + newRecommendation._id)
        .expect(404)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
