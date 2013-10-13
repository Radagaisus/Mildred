# Utilities
# ---------

utils =
# Object Helpers
# --------------

# Prototypal delegation. Create an object which delegates
# to another object.
  beget: do ->
    if typeof Object.create is 'function'
      Object.create
    else
      ctor = ->
      (obj) ->
        ctor.prototype = obj
        new ctor

# Simple duck-typing serializer for models and collections.
  serialize: (data) ->
    if typeof data.serialize is 'function'
      data.serialize()
    else if typeof data.toJSON is 'function'
      data.toJSON()
    else
      throw new TypeError 'utils.serialize: Unknown data was passed'

# Make properties readonly and not configurable
# using ECMAScript 5 property descriptors.
  readonly: do ->
    if support.propertyDescriptors
      readonlyDescriptor =
        writable: false
        enumerable: true
        configurable: false
      (obj, properties...) ->
        for prop in properties
          readonlyDescriptor.value = obj[prop]
          Object.defineProperty obj, prop, readonlyDescriptor
        true
    else
      ->
        false

# Get the whole chain of object prototypes.
  getPrototypeChain: (object) ->
    chain = [object.constructor.prototype]
    while object = object.constructor?.__super__ ? object.constructor?.superclass
      chain.push object
    chain.reverse()

# Get all property versions from object’s prototype chain.
# E.g. if object1 & object2 have `prop` and object2 inherits from
# object1, it will get [object1prop, object2prop].
  getAllPropertyVersions: (object, property) ->
    result = []
    for proto in utils.getPrototypeChain object
      value = proto[property]
      if value and value not in result
        result.push value
    result

# String Helpers
# --------------

# Upcase the first character.
  upcase: (str) ->
    str.charAt(0).toUpperCase() + str.substring(1)

# Escapes a string to use in a regex.
  escapeRegExp: (str) ->
    return String(str or '').replace /([.*+?^=!:${}()|[\]\/\\])/g, '\\$1'


# Event handling helpers
# ----------------------

# Returns whether a modifier key is pressed during a keypress or mouse click.
  modifierKeyPressed: (event) ->
    event.shiftKey or event.altKey or event.ctrlKey or event.metaKey

# Query parameters Helpers
# --------------

  queryParams:

  # Returns a query string from a hash
    stringify: (queryParams) ->
      query = ''
      for own key, value of queryParams
        encodedKey = encodeURIComponent key
        if _.isArray value
          for arrParam in value
            query += '&' + encodedKey + '=' + encodeURIComponent arrParam
        else
          query += '&' + encodedKey + '=' + encodeURIComponent value
      query and query.substring 1

  # Returns a hash with query parameters from a query string
    parse: (queryString) ->
      params = {}
      return params unless queryString
      pairs = queryString.split '&'
      for pair in pairs
        continue unless pair.length
        [field, value] = pair.split '='
        continue unless field.length
        field = decodeURIComponent field
        value = decodeURIComponent value
        current = params[field]
        if current
          # Handle multiple params with same name:
          # Aggregate them in an array.
          if current.push
            # Add the existing array.
            current.push value
          else
            # Create a new array.
            params[field] = [current, value]
        else
          params[field] = value

      params

  # Private helper function for serializing attributes recursively,
  # creating objects which delegate to the original attributes
  # in order to protect them from changes.
  serializeAttributes: (model, attributes, modelStack) ->
    # Create a delegator object.
    delegator = @beget attributes

    # Add model to stack.
    modelStack ?= {}
    modelStack[model.cid] = true

    # Map model/collection to their attributes. Create a property
    # on the delegator that shadows the original attribute.
    for key, value of attributes

      # Handle models.
      if value instanceof Backbone.Model
        delegator[key] = utils.serializeModelAttributes value, model, modelStack

        # Handle collections.
      else if value instanceof Backbone.Collection
        serializedModels = []
        for otherModel in value.models
          serializedModels.push(
            utils.serializeModelAttributes(otherModel, model, modelStack)
          )
        delegator[key] = serializedModels

    # Remove model from stack.
    delete modelStack[model.cid]

    # Return the delegator.
    delegator

  # Serialize the attributes of a given model
  # in the context of a given tree.
  serializeModelAttributes: (model, currentModel, modelStack) ->
    # Nullify circular references.
    return null if model is currentModel or _.has modelStack, model.cid
    # Serialize recursively.
    attributes = if typeof model.getAttributes is 'function'
      # Chaplin models.
      model.getAttributes()
    else
      # Backbone models.
      model.attributes
    @serializeAttributes model, attributes, modelStack


# Finish
# ------

# Seal the utils object.
Object.seal? utils
