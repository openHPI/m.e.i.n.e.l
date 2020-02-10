import '../shared-styles/plotly-styles.js';
import { PlotlyMixin } from '../mixins/plotly-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `piechart-basic`
 *
 * This is a basic component for plotly piecharts.
 *
 * For further information and deeper understanding visit the [Plotly pie chart documentation](https://plot.ly/javascript/pie-charts/).
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/piechart_basic_demo.html
 */
class PiechartBasic extends PlotlyMixin(PolymerElement) {
    static get template() {
        return html`
        <style include="plotly-styles">
            :host {
                display: block;
            }
        </style>
        <div id="diagram"></div>
`;
    }

    static get is() {
        return 'piechart-basic';
    }

    static get properties() {
        return {
            /** Colors for the dataset (must be same size as dataset)*/
            colors: Array,
            /** Determines whether the legend should be hidden */
            hideLegend: Boolean
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
        if (Array.isArray(data)) {
            data = data[0];
        }

        return [{
            type: 'pie',
            values: data.values,
            labels: data.labels,
            showlegend: !this.hideLegend,
            marker: {
                colors: this.colors
            }
        }];
    }

    /**
     * Gets the layout options of the plot
     * @override
     * @return {Object} The layout options.
     */
    getLayout() {
        return {
            margin: { l: 0, r: 0, t: 0, b: 0 }
        };
    }
}

// Register custom element definition using standard platform API
customElements.define(PiechartBasic.is, PiechartBasic);
