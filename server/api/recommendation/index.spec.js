'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var recommendationCtrlStub = {
  index: 'recommendationCtrl.index',
  show: 'recommendationCtrl.show',
  create: 'recommendationCtrl.create',
  update: 'recommendationCtrl.update',
  destroy: 'recommendationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var recommendationIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './recommendation.controller': recommendationCtrlStub
});

describe('Recommendation API Router:', function() {

  it('should return an express router instance', function() {
    expect(recommendationIndex).to.equal(routerStub);
  });

  describe('GET /api/recommendations', function() {

    it('should route to recommendation.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'recommendationCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/recommendations/:id', function() {

    it('should route to recommendation.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'recommendationCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/recommendations', function() {

    it('should route to recommendation.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'recommendationCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/recommendations/:id', function() {

    it('should route to recommendation.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'recommendationCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/recommendations/:id', function() {

    it('should route to recommendation.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'recommendationCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/recommendations/:id', function() {

    it('should route to recommendation.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'recommendationCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
