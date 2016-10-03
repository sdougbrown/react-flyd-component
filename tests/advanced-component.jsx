import React from 'react';
import o from 'ospec';
import render from './render';

import { stream } from 'flyd';
import { StreamingComponent } from '../';

export default (o.spec('Advanced Flyd Component', () => {
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

    o('adds to stream pool', () => {
      const node = render(SetSpy, {
        one: stream(), two: stream(), three: stream()
      });
      const instance = node.instance();

      o(instance._streams.length).equals(3);

      instance.setStreams([stream()]);

      o(instance._streams.length).equals(4);

      o(onClear.callCount).equals(1);
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

    o('clear streams with no args', () => {
      const node = render(ClearSpy);
      const instance = node.instance();

      instance.clearStreams();

      o(onSet.callCount).equals(0);
    });

    o('clear streams with an argument', () => {
      const node = render(ClearSpy);
      const instance = node.instance();
      const arg = [1,2,3];

      instance.clearStreams(arg);

      o(onSet.callCount).equals(1);
      o(onSet.args[0]).equals(arg);
    });
  });
}));
