# Modern, Extensible and Interactive Number Exploration Library (m.e.i.n.e.l)

The **M**odern, **E**xtensible and **I**nteractive **N**umber **E**xploration **L**ibrary (or short: m.e.i.n.e.l) is a visualization library for various forms of data. It focuses on abstracting the interfaces in a way that one only needs to supply the data and few (optional) parameters to embed visually appealing charts into existing environments. These interfaces are implemented by utilizing Polymer components.

## Technology stack

[Plotly.js](https://plot.ly/javascript/) and [D3.js](https://d3js.org/) for visualization and [Polymer.js](https://www.polymer-project.org/1.0/) for leveraging the full power of Web Components build the base for the m.e.i.n.e.l. project.<br>
[Plotly.js](https://plot.ly/javascript/) is used for basic visualizations whereas [D3.js](https://d3js.org/) is used for more complex and custom visualizations.

## Cloning

1. clone the repo with `git clone https://github.com/openHPI/m.e.i.n.e.l.git`
2. change into the cloned directory with `cd m.e.i.n.e.l`
3. [install Polymer](https://www.polymer-project.org/1.0/docs/tools/polymer-cli)
4. perform `npm install` to install the dependencies
5. do `polymer serve`
6. head to [`localhost:8081/components/m.e.i.n.e.l/`](http://localhost:8081/components/m.e.i.n.e.l/) in your browser & you are done! :blush:

## Creating custom components

1. copy an existing diagram's main file (i.e. `barchart-basic.html` for the barchart)
2. copy the corresponding demo file in `demo/` (i.e. `demo/barchart_basic_demo.html`)
3. rename both to a name of choice (keep in mind that Polymer components need to have a dash in the name)
4. make the following changes to the main file you just copied from `src/`:

   - [ ] change the title in the first comment and also its description
   - [ ] change the `@demo` reference to the new file you copied in `demo/`
   - [ ] change the `<dom-module id=""`
   - [ ] change the Polymer ID in the JS part (functions `is()` and  `properties()`)
   - [ ] change the rest of the code to match your needs
   - [ ] document it correspondingly (see [Polymer doc](https://www.polymer-project.org/2.0/docs/tools/documentation))
  
5. edit the file you copied in `demo/`:

   - change the title
   - change the import tag to import your custom component
   - change the headline (`<h3>`)
   - embed your component accordingly inside the `<demo-snippet><template>HERE</template></demo-snippet>` part

6. append your diagram to the `to all-imports.html` file

7. Run `polymer analyze > analysis.json` from the projects root folder to regenerate the documentation file.

## Typical problems when combining Polymer with D3 and Plotly.js
- `d3.select(...)` typically scans the whole DOM, how can I limit it to the local DOM of the Polymer component?
  - in your `<template>` section, use a `<div>` which wraps all parts of your chart
  - every time when you would do `d3.select(...)`, make sure to do a preselection using that div's ID to limit traversal to the local DOM: `d3.select(this.$.divID).select(...)`
- When passing my function `f` to a D3 built-in function, I can't access my Polymer component's attributes using `this.attributeName` inside `f`
  - Make sure to pass `f.bind(this)` instead of `f` to the D3 built-in function
- It seems like the `data` attribute is `null` when my code attempts to plot the diagram
  - Make sure to read up on [Polymer Lifecycle Callbacks](https://polymer-library.polymer-project.org/3.0/docs/devguide/custom-elements#element-lifecycle). If you're using the `ready` function as a trigger to plot your diagram, it might be worth to see whether using `connectedCallback` can fix your issue. In that case, remember to call `super.connectedCallback` as well!
- The hover effect and some labels might be off for Plotly.js
  - This is a [known issue](https://community.plot.ly/t/layout-breaks-in-polymer/6376) when using Plotly.js with Polymer. In that case, you need to import the shared `plotly-styles.html`: with `<link rel="import" href="../shared-styles/plotly-styles.html">` and include these in you main style element with `<style include="plotly-styles">`.

## Deploy release

1. Create the documentation:
   ```
   npm run analyze
   ```

2. Bump version and build artefacts

   ```
   npm version 3.1.2
   npm run bundle
   ```

3. Push everything incl. the new tag

4. Zip the content from the build directory and name it `m.e.i.n.e.l-v3.1.2.zip`

5. Create a new GitHub release named `Version 3.1.2` for the tag pushed a few moments ago and shortly describe your changes.

## Use in production

It is recommended to use the bundled version of m.e.i.n.e.l in production. It is created and attached to each release on GitHub, but can also be manually created by executing `npm run build`. The bundle consists of the following files:
- `custom-elements-es5-adapter.js`: [ES5 only] Required to load the ES5 code to modern ES6-enabled browsers.
- `polyfills-ie.js`: [ES5 only] Load *before any other files of this bundle* to support Internet Explorer 11.
- `m.e.i.n.e.l.js`: Bundled version incl. required dependencies.
- `webcomponents-bundle.js`: Polyfill loader for browsers that do not support WebComponents natively.

To use m.e.i.n.e.l in your web application without differing between ES5 and ES6, use the following imports:
```html
<script src="build/es5/polyfills-ie.js"></script>
<script src="build/es5/custom-elements-es5-adapter.js"></script>
<script src="build/es5/webcomponents-bundle.js"></script>
<script src="build/es5/m.e.i.n.e.l.js"></script>
```

In modern browsers, the ES6 version should be used preferably.  
