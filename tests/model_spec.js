// Generated by CoffeeScript 1.4.0
(function() {

  describe('Model', function() {
    var model;
    model = null;
    beforeEach(function() {
      return model = new Mildred.Model({
        id: 1
      });
    });
    afterEach(function() {
      return model.dispose();
    });
    it('should return the attributes per default', function() {
      return expect(model.getAttributes()).to.be(model.attributes);
    });
    it('should serialize the attributes', function() {
      var actual, actualCollection, collection, expected, expectedCollection, model1, model2, model3, model4, model5;
      model1 = model.set({
        number: 'one'
      });
      model2 = new Mildred.Model({
        id: 2,
        number: 'two'
      });
      model3 = new Mildred.Model({
        id: 3,
        number: 'three'
      });
      model4 = new Mildred.Model({
        id: 4,
        number: 'four'
      });
      model5 = new Mildred.Model({
        id: 5,
        number: 'five'
      });
      collection = new Backbone.Collection([model4, model5]);
      model1.set({
        model2: model2
      });
      model2.set({
        model3: model3
      });
      model2.set({
        collection: collection
      });
      model2.set({
        model2: model2
      });
      model3.set({
        model2: model2
      });
      model4.set({
        model2: model2
      });
      actual = model.serialize();
      expected = {
        id: 1,
        number: 'one',
        model2: {
          id: 2,
          number: 'two',
          model2: null,
          model3: {
            id: 3,
            number: 'three',
            model2: null
          },
          collection: [
            {
              id: 4,
              number: 'four',
              model2: null
            }, {
              id: 5,
              number: 'five'
            }
          ]
        }
      };
      expect(actual).to.be.an('object');
      expect(actual.number).to.be(expected.number);
      expect(actual.model2).to.be.an('object');
      expect(actual.model2.number).to.be(expected.model2.number);
      expect(actual.model2.model2).to.be(expected.model2.model2);
      actualCollection = actual.model2.collection;
      expectedCollection = expected.model2.collection;
      expect(actualCollection).to.be.an('array');
      expect(actualCollection[0].number).to.be(expectedCollection[0].number);
      expect(actualCollection[0].model2).to.be(expectedCollection[0].model2);
      expect(actualCollection[1].number).to.be(expectedCollection[1].number);
      expect(actual.model2.model3).to.be.an('object');
      expect(actual.model2.model3.number).to.be(expected.model2.model3.number);
      return expect(actual.model2.model3.model2).to.be(expected.model2.model3.model2);
    });
    it('should protect the original attributes when serializing', function() {
      var model1, model2, model3, serialized;
      model1 = model.set({
        number: 'one'
      });
      model2 = new Mildred.Model({
        id: 2,
        number: 'two'
      });
      model3 = new Backbone.Model({
        id: 3,
        number: 'three'
      });
      model1.set({
        model2: model2
      });
      model1.set({
        model3: model3
      });
      serialized = model1.serialize();
      serialized.number = 'new';
      serialized.model2.number = 'new';
      serialized.model3.number = 'new';
      expect(model1.get('number')).to.be('one');
      expect(model2.get('number')).to.be('two');
      return expect(model3.get('number')).to.be('three');
    });
    it('should serialize nested Backbone models and collections', function() {
      var actual, collection, model1, model2, model3;
      model1 = model.set({
        number: 'one'
      });
      model2 = new Mildred.Model({
        id: 2,
        number: 'two'
      });
      model3 = new Backbone.Model({
        id: 3,
        number: 'three'
      });
      collection = new Backbone.Collection([
        new Mildred.Model({
          id: 4,
          number: 'four'
        }), new Backbone.Model({
          id: 5,
          number: 'five'
        })
      ]);
      model1.set({
        model2: model2
      });
      model1.set({
        model3: model3
      });
      model1.set({
        collection: collection
      });
      actual = model1.serialize();
      expect(actual.number).to.be('one');
      expect(actual.model2).to.be.an('object');
      expect(actual.model2.number).to.be('two');
      expect(actual.model3).to.be.an('object');
      expect(actual.model3.number).to.be('three');
      expect(actual.collection).to.be.an('array');
      expect(actual.collection.length).to.be(2);
      expect(actual.collection[0].number).to.be('four');
      return expect(actual.collection[1].number).to.be('five');
    });
    return describe('Disposal', function() {
      it('should dispose itself correctly', function() {
        expect(model.dispose).to.be.a('function');
        model.dispose();
        expect(model.disposed).to.be(true);
        if (Object.isFrozen) {
          return expect(Object.isFrozen(model)).to.be(true);
        }
      });
      it('should fire a dispose event', function() {
        var disposeSpy;
        disposeSpy = sinon.spy();
        model.on('dispose', disposeSpy);
        model.dispose();
        return expect(disposeSpy).was.called();
      });
      it('should remove all event handlers from itself', function() {
        var modelBindSpy;
        modelBindSpy = sinon.spy();
        model.on('foo', modelBindSpy);
        model.dispose();
        model.trigger('foo');
        return expect(modelBindSpy).was.notCalled();
      });
      it('should unsubscribe from other events', function() {
        var model2, spy;
        spy = sinon.spy();
        model2 = new Mildred.Model;
        model.listenTo(model2, 'foo', spy);
        model.dispose();
        model2.trigger('foo');
        return expect(spy).was.notCalled();
      });
      return it('should remove instance properties', function() {
        var prop, properties, _i, _len, _results;
        model.dispose();
        properties = ['collection', 'attributes', 'changed', '_escapedAttributes', '_previousAttributes', '_silent', '_pending', '_callbacks'];
        _results = [];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
          prop = properties[_i];
          _results.push(expect(model).not.to.have.own.property(prop));
        }
        return _results;
      });
    });
  });

}).call(this);
