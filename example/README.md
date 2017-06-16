> A very basic example of a project using Runup.

It only uses default flows, meaning no special processing is done for any assets.
A more real-world example is coming soon (TODO).

To start in development mode, cd into this directory and run:
```
$ node ../cli
```

Open the [URI at which the server is listening](http://localhost:3000/) in your browser (printed in the output).

Experiment with making changes to the [source files](src) and see how your browser reacts.

Make a release build by running:
```
$ node ../cli build
```