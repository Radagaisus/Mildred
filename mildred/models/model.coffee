class Mildred.Model extends Backbone.Model
  # This method is used to get the attributes for the view template
  # and might be overwritten by decorators which cannot create a
  # proper `attributes` getter due to ECMAScript 3 limits.
  getAttributes: ->
    @attributes

  # Return an object which delegates to the attributes
  # (i.e. an object which has the attributes as prototype)
  # so primitive values might be added and altered safely.
  # Map models to their attributes, recursively.
  serialize: ->
    utils.serializeAttributes this, @getAttributes()

  # Disposal
  # --------

  disposed: false

  dispose: ->
    return if @disposed

    # Fire an event to notify associated collections and views.
    @trigger 'dispose', this

    # Unbind all referenced handlers.
    @stopListening()

    # Remove all event handlers on this module.
    @off()

    # Remove the collection reference, internal attribute hashes
    # and event handlers.
    properties = [
      'collection',
      'attributes', 'changed'
      '_escapedAttributes', '_previousAttributes',
      '_silent', '_pending',
      '_callbacks'
    ]
    delete this[prop] for prop in properties

    # Finished.
    @disposed = true

    # You’re frozen when your heart’s not open.
    Object.freeze? this