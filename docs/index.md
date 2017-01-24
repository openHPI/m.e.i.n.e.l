# Modern, Extensible and Interactive Number Exploration Library
This is the landing page of the m.e.i.n.e.l. project and will include the documentation of the project in the future.

## Cloning
1. clone the repo with `git clone https://github.com/openHPI/m.e.i.n.e.l..git`
2. change into the cloned directory with `cd m.e.i.n.e.l.`
3. [install Bower & Polymer](https://www.polymer-project.org/1.0/docs/tools/polymer-cli)
4. perform `bower install` to install the dependencies
5. do `polymer serve`
6. head to `localhost:8080/components/m.e.i.n.e.l.-viz/` in your browser & you are done! :blush:

## Creating custom components
1. copy an existing diagram's main file (i.e. `barchart-basic.html` for the barchart)
2. copy the corresponding demo file in `demo/` (i.e. `demo/barchart_basic_demo.html`)
3. rename both to a name of choice (keep in mind that Polymer components need to have a dash in the name)
4. make the following changes to the main file you just copied from `src/`:
  - [ ] change the title in the first comment and also its description
  - [ ] change the `@demo` reference to the new file you copied in `demo/`
  - [ ] change the `<dom-module id=""`
  - [ ] change the Polymer id in the JS part `Polymer({is: ""})...`
  - [ ] change the rest of the code to match your needs
  - [ ] document it correspondingly (see [Polymer doc](https://www.polymer-project.org/1.0/docs/tools/documentation))
5. edit the file you copied in `demo/`:
  - [ ] change the title
  - [ ] change the import tag to import your custom component
  - [ ] change the headline (`<h3>`)
  - [ ] embed your component accordingly inside the `<demo-snippet><template>HERE</template></demo-snippet>` part
6. append your diagram to the `to all-imports.html` file

## Optimize for production
To optimize the polymer components for production, you can use Vulcanize.
More information can be found [in the Polymer docs.](https://www.polymer-project.org/1.0/docs/tools/optimize-for-production)

1. install [Polymer Bundler](https://github.com/Polymer/polymer-bundler): `npm install -g polymer-bundler`
2. figure out which chart you want from `src/`
3. do `polymer-bundler --inline-scripts --inline-css src/YOUR-CHART.html > CHART.html`
4. include the `CHART.html` as `<link rel="import" href="../path/CHART.html">`
5. include `<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.23/webcomponents-lite.min.js"></script>` in your header to make polyfills work with firefox etc.
6. use the `<CHART></CHART>` tag you just created
