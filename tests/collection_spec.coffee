describe 'Collection', ->
  collection = null

  beforeEach ->
    collection = new Mildred.Collection

  afterEach ->
    collection.dispose()

  expectOrder = (order) ->
    for id, index in order
      expect(collection.at(index).id).to.be id

  it 'should serialize the models', ->
    model1 = new Mildred.Model id: 1, foo: 'foo'
    model2 = new Backbone.Model id: 2, bar: 'bar'
    collection = new Mildred.Collection [model1, model2]
    expect(collection.serialize).to.be.a 'function'

    actual = collection.serialize()
    expected = [
      {id: 1, foo: 'foo'}
      {id: 2, bar: 'bar'}
    ]

    expect(actual.length).to.be expected.length

    expect(actual[0]).to.be.an 'object'
    expect(actual[0].id).to.be expected[0].id
    expect(actual[0].foo).to.be expected[0].foo

    expect(actual[1]).to.be.an 'object'
    expect(actual[1].id).to.be expected[1].id
    expect(actual[1].foo).to.be expected[1].foo

  describe 'Disposal', ->
    it 'should dispose itself correctly', ->
      expect(collection.dispose).to.be.a 'function'
      collection.dispose()

      expect(collection.length).to.be 0

      expect(collection.disposed).to.be true

    it 'should fire a dispose event', ->
      disposeSpy = sinon.spy()
      collection.on 'dispose', disposeSpy

      collection.dispose()

      expect(disposeSpy).was.called()

    it 'should unsubscribe from Pub/Sub events', ->
      pubSubSpy = sinon.spy()
      collection.on 'foo', pubSubSpy

      collection.dispose()

      collection.trigger 'foo'
      expect(pubSubSpy).was.notCalled()

    it 'should remove all event handlers from itself', ->
      collectionBindSpy = sinon.spy()
      collection.on 'foo', collectionBindSpy

      collection.dispose()

      collection.trigger 'foo'
      expect(collectionBindSpy).was.notCalled()

    it 'should unsubscribe from other events', ->
      spy = sinon.spy()
      model = new Mildred.Model
      collection.listenTo model, 'foo', spy

      collection.dispose()

      model.trigger 'foo'
      expect(spy).was.notCalled()

    it 'should remove instance properties', ->
      collection.dispose()

      for prop in ['model', 'models', '_byId', '_byCid']
        expect(collection).not.to.have.own.property prop
