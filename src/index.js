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

    this.__isMounting = false;
    this.__isMounted = false;
    this.__updater = null;
    this.__streams = getStreamsFromProps(props);
    this.__onUpdate = combine(this.onStreamUpdate.bind(this));
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
    this.__isMounting = true;
    this.trackUpdates();
  }

  componentDidMount() {
    this.__isMounted = true;
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
    this.__isMounting = false;
    this.__isMounted = false;
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

    this.__updater = (this.__isMounting && this.__streams.length)
      ? this.__onUpdate(this.__streams)
      : null;
  }

  /**
   * addStreams
   *
   * Adds new streams to the updater
   *
   * @param {Array} streams - streams to add
   * @returns {void}
   */
  addStreams(streams) {
    if (!Array.isArray(streams)) {
      throw new Error('Must call addStreams with an Array of streams');
    }

    streams.filter(isStream).forEach((stream) => {
      this.__streams.push(stream);
    });

    this.trackUpdates();
  }

  /**
   * setStreams
   *
   * Replaces the streams watched by the updater
   *
   * @param {Array} streams - streams to set
   * @returns {void}
   */
  setStreams(streams) {
    if (!Array.isArray(streams)) {
      throw new Error('Must call setStreams with an Array of streams');
    }

    // clear streams array before setting
    this.__streams = [];
    // add streams
    this.addStreams(streams);
  }

  /**
   * clearStreams
   *
   * Stops all live updates and empties the stream pool.
   *
   * @returns {void}
   */
  clearStreams() {
    this.clearUpdater();
    this.__streams = [];
  }

  /**
   * clearUpdater
   *
   * Ends the updater stream
   *
   * @returns {void}
   */
  clearUpdater() {
    if (this.__updater) {
      this.__updater.end(true);
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
    // refresh when mounted
    // (using internal boolean for compat with preact/inferno)
    if (this.__isMounted) {
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

