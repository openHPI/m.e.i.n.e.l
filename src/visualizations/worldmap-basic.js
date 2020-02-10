import '../shared-styles/plotly-styles.js';
import { PlotlyMixin } from '../mixins/plotly-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `worldmap-basic`
 *
 * This is a basic component for plotly worldmaps.
 *
 * For further information and deeper understanding visit the [Plotly maps chart documentations](https://plot.ly/javascript/#maps).
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/worldmap_basic_demo.html
 */
class WorldmapBasic extends PlotlyMixin(PolymerElement) {
    static get template() {
        return html`
        <style include="plotly-styles">
            :host {
                display: block;
            }

            #diagram {
                width: 100%;
                height: 100%;
            }
        </style>
        <div id="diagram"></div>
`;
    }

    static get is() {
        return 'worldmap-basic';
    }

    static get properties() {
        return {
            /** The type of map. */
            type: {
                type: String,
                value: 'choropleth'
            },
            /** Primary color of the control. */
            primarycolor: {
                type: String,
                value: 'rgb(237, 237, 237)'
            },
            /** Primary color of the control. */
            accentcolor: {
                type: String,
                value: 'rgba(164,14,24,1)'
            }
        };
    }

    static get observers() {
        return [];
    }

    /**
     * Gets the container element of the diagram that should be rendered
     * @override
     * @return {Object} The container element of the diagram.
     */
    getDiagram() {
        return this.$.diagram;
    }

    /**
     * Prepares the data for the plot
     * @override
     * @param  {Object} data The data to transform.
     * @return {Object}      The desired data.
     */
    getPlotData(data) {
        let that = this;
        return data.map((series) => {
            let plotSeries = {
                type: series.type || that.type,
                z: series.z,
                marker: {
                    color: that.accentcolor
                }
            };
            if (series.locations) {
                plotSeries.locations = series.locations;
            } else {
                plotSeries.lat = series.lat;
                plotSeries.lon = series.lon;
            }
            if (series.text) {
                plotSeries.hoverinfo = 'text';
                plotSeries.text = series.text;
            }

            return plotSeries;
        });
    }

    /**
     * Gets the layout options of the plot
     * @override
     * @return {Object} The layout options.
     */
    getLayout() {
        return {
            geo: {
                showframe: false,
                showland: true,
                landcolor: this.primarycolor,
                showcountries: true,
                projection: {
                    type: 'Mercator'
                }
            },
            margin: { l: 0, r: 0, t: 0, b: 0 }
        };
    }
}

// Register custom element definition using standard platform API
customElements.define(WorldmapBasic.is, WorldmapBasic);
