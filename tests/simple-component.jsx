import React from 'react';
import o from 'ospec';
import render from './render';

import { stream, on } from 'flyd';
import Flyd from '../src/';

const SimpleComponent = Flyd((props) => {
  return (<div>{props.stream && props.stream()},{props.text}</div>);
});

export default (o.spec('Simple Flyd Component', () => {
  o('passes streams without transforming', () => {
    const node = render(SimpleComponent, {
      stream: stream(1), text: null
    });

    o(node.html()).equals('<div>1,</div>');
  });

  o('updates when streams change', () => {
    const testStream = stream(2);
    const node = render(SimpleComponent, {
      stream: testStream, text: null
    });

    o(node.html()).equals('<div>2,</div>');

    testStream(3);

    o(node.html()).equals('<div>3,</div>');
  });

  o('will not impact other values', () => {
    const node = render(SimpleComponent, {
      stream: null, text: 'foo'
    });

    o(node.html()).equals('<div>,foo</div>');
  });

  o('will update with changes to props not used in the view', () => {
    let val = 'foo';

    const extra = stream();
    const mock = () => val;

    on((value) => { val = value }, extra);

    const node = render(SimpleComponent, {
      stream: mock,
      extra,
    });

    o(node.html()).equals('<div>foo,</div>');

    extra('hi');

    o(node.html()).equals('<div>hi,</div>');
  });
}));
