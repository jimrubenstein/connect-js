/**
 * @module FB
 * @provides fb.event
 * @requires fb.prelude
 */

/**
 * Event Provider.
 *
 * @class FB.EventProvider
 * @static
 * @access private
 */
FB.copy('EventProvider', {
  /**
   * Returns the internal subscriber array that can be directly manipulated by
   * adding/removing things.
   *
   * @access private
   * @returns {Object}
   */
  subscribers: function() {
    // this odd looking logic is to allow instances to lazily have a map of
    // their events. if subscribers were an object literal itself, we would
    // have issues with instances sharing the subscribers when its being used
    // in a mixin style.
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },

  /**
   * Bind an event handler to a given event name.
   *
   * For example, suppose you want to get notified whenever the session
   * changes::
   *
   *   FB.Event.subscribe('auth.sessionChange', function(response) {
   *     // do something with response.session
   *   });
   *
   * @access public
   * @param name    {String}   name of the event
   * @param cb      {Function} the handler function
   */
  subscribe: function(name, cb) {
    var S = this.subscribers();

    if (!S[name]) {
      S[name] = [cb];
    } else {
      S[name].push(cb);
    }
  },

  /**
   * Removes subscribers, inverse of FB.Event.subscribe().
   *
   * Removing a subscriber is basically the same as adding one. You need to
   * pass the same event name and function to unsubscribe that you passed into
   * subscribe. If we use a similar example to FB.Event.subscribe, we get::
   *
   *   var onSessionChange = function(response) {
   *     // do something with response.session
   *   };
   *   FB.Event.subscribe('auth.sessionChange', onSessionChange);
   *
   *   // sometime later in your code you dont want to get notified anymore
   *   FB.Event.unsubscribe('auth.sessionChange', onSessionChange);
   *
   * @access public
   * @param name    {String}   name of the event
   * @param cb      {Function} the handler function
   */
  unsubscribe: function(name, cb) {
    var S = this.subscribers();

    if (S[name]) {
      for (var i=0, l=S[name].length; i<l; i++) {
        if (S[name][i] == cb) {
          S[name][i] = null;
        }
      }
    }
  },

  /**
   * Fires a named event. The first argument is the name, the rest of the
   * arguments are passed to the subscribers.
   *
   * @access private
   * @param name {String}     the event name
   * @param ...  arguments    passed to the subscriber
   */
  fire: function() {
    var
      args        = Array.prototype.slice.call(arguments),
      name        = args.shift(),
      subscribers = this.subscribers()[name],
      sub;

    // no subscribers, boo
    if (!subscribers) {
      return;
    }

    for (var i=0, l=subscribers.length; i<l; i++) {
      sub = subscribers[i];
      // this is because we null out unsubscribed rather than jiggle the array
      if (sub) {
        sub.apply(window, args);
      }
    }
  }
});

/**
 * Event.
 *
 * @class FB.Event
 * @static
 * @access public
 */
FB.copy('Event', FB.EventProvider);