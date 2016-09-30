# React Flyd Component

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

... forthcoming. 😬

