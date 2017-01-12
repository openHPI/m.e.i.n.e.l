# Modern Extensible, and Interactive Number Exploration Library
This is the landing page of the m.e.i.n.e.l. project and will include the documentation of the project in the future.

## Cloning
1. clone the repo with `git clone https://github.com/openHPI/m.e.i.n.e.l..git`
2. change into the cloned directory with `cd m.e.i.n.e.l.`
3. [install Bower & Polymer](https://www.polymer-project.org/1.0/docs/tools/polymer-cli)
4. perform `bower install` to install the dependencies
5. do `polymer serve`
6. head to `localhost:8080/components/barchart-basic/` in your browser & you are done! :blush:

## Creating custom components

1. copy an existing diagrams main file (i.e. `barchart-basic.html` for the barchart)
2. copy the corresponding demo file in `demo/` (i.e. `demo/barchart_basic_demo.html`)
3. rename both to a name of choice
4. make the following changes to the main file you just copied:
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
