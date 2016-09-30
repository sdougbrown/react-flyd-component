import { Component, createElement } from 'react';
import { combine, isStream } from 'flyd';

/**
 * StreamingComponent
 *
 * A streaming component that will automatically update
 * and reconcile the DOM based on updates to streams passed
 * to it via props, or added via `setStreams`.
 *
 * This is better utilized at a lower level (i.e. with form inputs),
 * so that higher level components with many streams
 * don't refresh frivilously.
 *
 * This component *intentionally will not copy the data to state*,
 * in order to avoid potentially stale data, memory bloat, and to
 * give the render function full access to the raw stream (rather
 * than just the data).  This makes it easier to 'react' :)
 */
export class StreamingComponent extends Component {
  constructor(props) {
    super(props);

    this._updater = null;
    this._streams = getStreamsFromProps(props);
    this._onUpdate = combine(this.onStreamUpdate.bind(this));
  }

  /**
   * componentWillReceiveProps
   *
   * Handles changes to props for this component
   * (but only where streams are added or removed).
   *
   * Built-in React lifecylce.
   *
   * @param {Object} nextProps
   * @returns {void}
   */
  componentWillReceiveProps(nextProps) {
    const newStreams = getStreamsFromProps(nextProps);

    // it doesn't make much sense that streams would
    // be conditionally present, but hey who am I to judge.
    // this will clearly not automatically update if two streams
    // are swapped-out (length is equal but streams are different).
    // that's what `clearStreams` is for, so it should be
    // invoked manually if you try that junk. *wontfix*
    if (newStreams.length !== this._streams.length) {
      this.clearStreams(newStreams);
    }
  }

  /**
   * componentWillMount
   *
   * Begins watching the streams attached streams for updates.
   *
   * Built-in React lifecyle.
   *
   * @returns {void}
   */
  componentWillMount() {
    this.trackUpdates();
  }

  /**
   * componentWillUnmount
   *
   * Ends the watching stream to prevent bad calls to `forceUpdate`
   *
   * Built-in React lifecyle.
   *
   * @returns {void}
   */
  componentWillUnmount() {
    this.clearUpdater();
  }

  /**
   * trackUpdates
   *
   * Initializes the update stream
   *
   * @returns {void}
   */
  trackUpdates() {
    this.clearUpdater();

    this._updater = (this._streams.length)
      ? this._onUpdate(this._streams)
      : null;
  }

  /**
   * setStreams
   *
   * Adds new streams to the updater
   *
   * @param {Array} streams - streams to add
   * @returns {void}
   */
  setStreams(streams) {
    if (!Array.isArray(streams)) {
      throw new Error('Must call setStreams with an Array of streams');
    }
    this.clearUpdater();
    streams.filter(isStream).forEach(this._streams.push);
    this.trackUpdates();
  }

  /**
   * clearStreams
   *
   * Stops all live updates and empties the stream pool.
   * Optionally, accepts a new array of streams and restarts
   * the update tracker (via setStreams).
   *
   * @param {Array} [newStreams]
   * @returns {void}
   */
  clearStreams(newStreams) {
    this.clearUpdater();
    this._streams = [];

    if (newStreams) {
      this.setStreams(newStreams);
    }
  }

  /**
   * clearUpdater
   *
   * Ends the updater stream
   *
   * @returns {void}
   */
  clearUpdater() {
    if (this._updater) {
      this._updater.end(true);
    }
  }

  /**
   * onStreamUpdate
   *
   * Called whenever the dependent streams change.
   *
   * @returns {void}
   */
  onStreamUpdate() {
    // refresh when the updater is available
    // (i.e. the component is mounted)
    if (this.updater) {
      this.forceUpdate();
    }
  }
}

/**
 * Flyd
 *
 * Factory to create a higher-order component without
 * the yucky class syntax.
 *
 * @param {Function} Child
 * @returns {Class} - React Component Class
 */
export default function Flyd(Child) {
  return class extends StreamingComponent {
    constructor(props) {
      super(props);
    }

    render() {
      return createElement(Child, this.props);
    }
  };
}

/**
 * getStreamsFromProps
 *
 * Returns an array of streams from the `props` object.
 * Does *not* perform a deep search.
 *
 * @param {Object} props
 * @returns {Array}
 */
export function getStreamsFromProps(props) {
  return Object.keys(props).map((key) => {
    return props[key];
  }).filter(isStream);
}

