import React from 'react';
import o from 'ospec';
import render from './render';

import { stream } from 'flyd';
import { StreamingComponent } from '../src/';

export default (o.spec('Advanced Flyd Component', () => {
  o.spec('Add Streams Method', () => {
    var onClear, onTrack;

    class AddSpy extends StreamingComponent {
      constructor(props) {
        super(props);
      }

      render() {
        return (<div>{'hi'}</div>);
      }
    }

    o.beforeEach(() => {
      AddSpy.prototype.clearUpdater = onClear = o.spy();
      AddSpy.prototype.trackUpdates = onTrack = o.spy();
    });

    o('does not change anything when given invalid args', () => {
      const node = render(AddSpy);
      const instance = node.instance();

      let err = null;

      try {
        instance.addStreams(null);
      } catch (e) {
        err = e;
      }

      o(err).notEquals(null);
      o(onClear.callCount).equals(0);
      o(onTrack.callCount).equals(1); // run on mount
    });

    o('adds to stream pool', () => {
      const node = render(AddSpy, {
        one: stream(), two: stream(), three: stream()
      });
      const instance = node.instance();

      o(instance._streams.length).equals(3);

      instance.addStreams([stream()]);

      o(instance._streams.length).equals(4);

      o(onClear.callCount).equals(0);
      o(onTrack.callCount).equals(2);
    });
  });

  o.spec('Set Streams Method', () => {
    var onClear, onTrack;

    class SetSpy extends StreamingComponent {
      constructor(props) {
        super(props);
      }

      render() {
        return (<div>{'hi'}</div>);
      }
    }

    o.beforeEach(() => {
      SetSpy.prototype.clearUpdater = onClear = o.spy();
      SetSpy.prototype.trackUpdates = onTrack = o.spy();
    });

    o('does not change anything when given invalid args', () => {
      const node = render(SetSpy);
      const instance = node.instance();

      let err = null;

      try {
        instance.setStreams(null);
      } catch (e) {
        err = e;
      }

      o(err).notEquals(null);
      o(onClear.callCount).equals(0);
      o(onTrack.callCount).equals(1); // run on mount
    });

    o('replaces stream pool', () => {
      const node = render(SetSpy, {
        one: stream(), two: stream(), three: stream()
      });
      const instance = node.instance();

      o(instance._streams.length).equals(3);

      instance.setStreams([stream()]);

      o(instance._streams.length).equals(1);

      o(onClear.callCount).equals(0);
      o(onTrack.callCount).equals(2);
    });
  });

  o.spec('Clear Streams Method', () => {
    var onSet;

    class ClearSpy extends StreamingComponent {
      constructor(props) {
        super(props);
      }

      render() {
        return (<div>{'hi'}</div>);
      }
    }

    o.beforeEach(() => {
      ClearSpy.prototype.setStreams = onSet = o.spy();
    });

    o('empties stream pool', () => {
      const node = render(ClearSpy, {
        one: stream(), two: stream(), three: stream()
      });
      const instance = node.instance();

      o(instance._updater).notEquals(null);
      o(instance._streams.length).equals(3);
      instance.clearStreams();
      o(instance._streams.length).equals(0);
    });
  });

  o.spec('Track Updates Method', () => {
    var onClear, onUpdate;

    class TrackSpy extends StreamingComponent {
      constructor(props) {
        super(props);
      }

      render() {
        return (<div>{'hi'}</div>);
      }
    }

    o.beforeEach(() => {
      TrackSpy.prototype.clearUpdater = onClear = o.spy();
      TrackSpy.prototype.onStreamUpdate = onUpdate = o.spy();
    });

    o('actually mounts something that works', () => {
      const test = stream();

      const node = render(TrackSpy, { test });
      const instance = node.instance();

      o(onUpdate.callCount).equals(0);

      test(true);

      o(onUpdate.callCount).equals(1);
    });

    o('clears previous updaters on init', () => {
      const node = render(TrackSpy, { one: stream() });
      const instance = node.instance();

      o(instance._isMounted).equals(true);
      o(instance._updater).notEquals(null);
      o(onClear.callCount).equals(1);
      o(onUpdate.callCount).equals(0);
    });

    o('does not initialize with no streams', () => {
      const node = render(TrackSpy);
      const instance = node.instance();

      o(instance._updater).equals(null);
      o(onClear.callCount).equals(1);
      o(onUpdate.callCount).equals(0);
    });

    o('will not re-init if unmounted', () => {
      const node = render(TrackSpy, { one: stream() });
      const instance = node.instance();

      o(instance._isMounted).equals(true);
      o(instance._updater).notEquals(null);

      instance._isMounted = false;
      instance.setStreams([stream(), stream()]);

      o(instance._updater).equals(null);
    });
  });
}));
