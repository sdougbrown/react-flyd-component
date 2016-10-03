import { createElement } from 'react';
import { shallow } from 'enzyme';

export default function render(Component, ctx = {}) {
  return shallow(createElement(Component, ctx));
}
