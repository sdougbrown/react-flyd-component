# React Flyd Component

[![Build Status](https://travis-ci.org/sdougbrown/react-flyd-component.svg)](https://travis-ci.org/sdougbrown/react-flyd-component)
[![GitHub issues](https://img.shields.io/github/issues/sdougbrown/react-flyd-component.svg)](https://github.com/sdougbrown/react-flyd-component/issues)
[![Dependencies](https://img.shields.io/david/sdougbrown/react-flyd-component.svg?style=flat)](https://david-dm.org/sdougbrown/react-flyd-component)

Live-Updating, "Stateless" [React](http://facebook.github.io/react/) Components Using [flyd](https://github.com/paldepind/flyd)

#### 👏 TMTOWTDI

This allows you to easily utilize flyd streams in react components *without absorbing the streams*, and updates the component according to changes therein.

This is how I personally prefer to work with streams.  If you'd like to do things differently, there are other solutions out there such as [Lift](flyd-lift-react). 😀

#### Technically...

A streaming component that will automatically update and reconcile the DOM based on updates to streams passed to it via props, or added via `setStreams`.

This is better utilized at a lower level (i.e. with form inputs), so that higher level components with many streams don't refresh frivilously. (But hey - do what you want.)

This component *intentionally will not copy the data to state*, in order to avoid potentially stale data, memory bloat, and to give the render function full access to the raw stream (rather than just the data).  This makes it easier to 'react' :)

#### Hey wait a second...

If you dig in, you will see that this component uses `forceUpdate` **gasp**.  It's common practice to avoid this component method, and often the use of it is an immediate code-smell, but *this is precisely why is exists* - the streams know more about the underlying data than React does, so when they change then React should respond.

#### Examples

Basic Usage:
```jsx
// import
import Flyd from 'react-flyd-component';

// write some helpers
function bindValue(cb) {
  return e => cb(e.target.value);
}

// wrap an ordinary component
const EmailField = Flyd((props) => {
  // this is kind of a bad example because it's not really
  // possible to tell which prop is a stream just by reading
  // this render function, but that's always the challenge,
  // isn't it? 😬

  // I'll leave it to the reader to determine an appropriate
  // naming convention for the streams passed via props.
  return (
    {/* use streams for content */}
    <label htmlFor="props.name">{props.label()}</label>
    <input
      type="email"
      {/* mix streams and normal values freely */}
      name={props.name}
      {/* get your stream's value by calling it */}
      value={props.value()}
      {/* or access it by reference to pass it elsewhere */}
      onChange={bindValue(props.value)}
    />
});
// render/export or something down here
```

Advanced Usage:
```jsx
// import
import { stream } from 'flyd';
import { StreamingComponent } from 'react-flyd-component';

// create a massively complex multi-stream component
// (if that's what you're into)
class InsaneComponent extends StreamingComponent {
  constructor(props) {
    super(props);

    // you might not *want* to store streams on state,
    // but there's nothing stopping you from doing it!
    this.state = {
      message: stream(),
      input: stream(),
      something: stream(),
    }

    // state is not automatically evaluated.
    // add an array of streams to watch manually
    this.setStreams([
      this.state.message,
      this.state.input,
      this.state.something,
    ]);

    // that's it.  this component will now update
    // automatically with every stream change.
  }
  // needs a render function obvs
}
// render/export
```

Advanced Usage Note:

This HOC hooks into the `componentWillMount`, `componentDidMount`, and `componentWillUnmount` lifecycles, so if you choose to use those lifecycles as well you should call the `super` of those methods (e.g. `super.componentWillMount()`)  at runtime as well.
