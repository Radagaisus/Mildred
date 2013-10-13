UNSYNCED = 'unsynced'
SYNCING = 'syncing'
SYNCED = 'synced'

STATE_CHANGE = 'syncStateChange'

Mildred.SyncMachine =
  _syncState: UNSYNCED
  _previousSyncState: null

# Get the current state
# ---------------------

  syncState: ->
    @_syncState

  isUnsynced: ->
    @_syncState is UNSYNCED

  isSynced: ->
    @_syncState is SYNCED

  isSyncing: ->
    @_syncState is SYNCING

# Transitions
# -----------

  unsync: ->
    if @_syncState in [SYNCING, SYNCED]
      @_previousSync = @_syncState
      @_syncState = UNSYNCED
      @trigger @_syncState, this, @_syncState
      @trigger STATE_CHANGE, this, @_syncState
    # when UNSYNCED do nothing
    return

  beginSync: ->
    if @_syncState in [UNSYNCED, SYNCED]
      @_previousSync = @_syncState
      @_syncState = SYNCING
      @trigger @_syncState, this, @_syncState
      @trigger STATE_CHANGE, this, @_syncState
    # when SYNCING do nothing
    return

  finishSync: ->
    if @_syncState is SYNCING
      @_previousSync = @_syncState
      @_syncState = SYNCED
      @trigger @_syncState, this, @_syncState
      @trigger STATE_CHANGE, this, @_syncState
    # when SYNCED, UNSYNCED do nothing
    return

  abortSync: ->
    if @_syncState is SYNCING
      @_syncState = @_previousSync
      @_previousSync = @_syncState
      @trigger @_syncState, this, @_syncState
      @trigger STATE_CHANGE, this, @_syncState
    # when UNSYNCED, SYNCED do nothing
    return

# Create shortcut methods to bind a handler to a state change
# -----------------------------------------------------------

for event in [UNSYNCED, SYNCING, SYNCED, STATE_CHANGE]
  do (event) ->
    Mildred.SyncMachine[event] = (callback, context = this) ->
      @on event, callback, context
      callback.call(context) if @_syncState is event


