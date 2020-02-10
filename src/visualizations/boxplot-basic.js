import '../shared-styles/plotly-styles.js';
import { PlotlyMixin } from '../mixins/plotly-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `boxplot-basic`
 *
 * This is a basic component for plotly box plots.
 *
 * For further information and deeper understanding visit the [Plotly box plot documentation](https://plot.ly/javascript/box-plots/).
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/boxplot_basic_demo.html
 */
class BoxplotBasic extends PlotlyMixin(PolymerElement) {
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
        return 'boxplot-basic';
    }

    static get properties() {
        return {
            /** Primary color of chart */
            primarycolor: {
                type: String,
                value: 'rgba(0,0,0,1)',
                reflectToAttribute: true
            },
            /** Accent color of chart */
            accentcolor: {
                type: String,
                value: 'rgba(0,0,0,1)',
                reflectToAttribute: true
            },
            /** Show arithmetic mean */
            mean: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            xTitle: String,
            yTitle: String
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
        data.forEach((item) => {
            item.type = 'box';

            if (this.mean) {
                item.boxmean = true;
            }
        });
        data[0].marker = {
            color: this.primarycolor
        };

        return data;
    }

    /**
     * Gets the layout options of the plot
     * @override
     * @return {Object} The layout options.
     */
    getLayout() {
        let layout = {
            xaxis: {
                title: this.xTitle,
                zeroline: false,
                tickmode: 'auto',
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                }
            },
            yaxis: {
                title: this.yTitle,
                zeroline: false,
                tickmode: 'auto',
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                }
            },
            margin: { l: 50, r: 10, t: 10, b: 80 }
        };

        return layout;
    }
}

// Register custom element definition using standard platform API
customElements.define(BoxplotBasic.is, BoxplotBasic);
