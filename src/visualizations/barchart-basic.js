import '../shared-styles/plotly-styles.js';
import { PlotlyMixin } from '../mixins/plotly-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `barchart-basic`
 *
 * This is a basic component for plotly barcharts.
 *
 * For further information and deeper understanding visit the [Plotly bar chart documentation](https://plot.ly/javascript/bar-charts/).
 *
 * @polymer
 * @customElement
 * @appliesMixin PlotlyMixin
 * @demo demo/visualizations/barchart_basic_demo.html
 */
class BarchartBasic extends PlotlyMixin(PolymerElement) {
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
        return 'barchart-basic';
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
            /** Background color of chart */
            bgcolor: {
                type: String,
                value: 'rgba(255,255,255,1)',
                reflectToAttribute: true
            },
            /** Grid color of x axis */
            xGridcolor: {
                type: String,
                value: 'rgba(238,238,238,1)',
                reflectToAttribute: true
            },
            /** Grid color of y axis */
            yGridcolor: {
                type: String,
                value: 'rgba(238,238,238,1)',
                reflectToAttribute: true
            },
            /** Scroll and zoom activation */
            scrollzoom: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            },
            /** Scroll range provided in % 0 to 100 */
            scrollrange: {
                type: Number,
                value: 100,
                reflectToAttribute: true
            },
            /** Enables stacked bar if multiple xy objects are provided */
            stackedbar: {
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
            item.type = 'bar';
        });

        if (data[0].marker === undefined || data[0].marker.color === undefined) {
            data[0].marker = {
                color: this.primarycolor
            };
        }

        return data;
    }

    /**
     * Gets the layout options of the plot
     * @override
     * @param  {Object} data The data of the plot.
     * @return {Object}      The layout options.
     */
    getLayout(data) {
        let layout = {
            xaxis: {
                title: this.xTitle,
                type: 'category',
                tickmode: 'auto',
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                },
                gridcolor: this.xGridcolor
            },
            yaxis: {
                title: this.yTitle,
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                },
                gridcolor: this.yGridcolor
            },
            margin: { l: 50, r: 10, t: 10, b: 80 },
            // eslint-disable-next-line camelcase
            plot_bgcolor: this.bgcolor,
            // eslint-disable-next-line camelcase
            paper_bgcolor: this.bgcolor
        };

        if (this.stackedbar) {
            layout.barmode = 'stack';
        }

        if (this.scrollzoom) {
            let maxX = data[0].x[data[0].x.length - 1];
            let minX = data[0].x[Math.round(data[0].x.length * (1 - this.scrollrange / 100))];
            layout.xaxis.rangeslider = {};
            layout.xaxis.range = [minX, maxX];
        }

        return layout;
    }

    /**
     * Gets the config options of the plot
     * @override
     * @return {Object} The config options.
     */
    getConfig() {
        if (!this.scrollzoom) {
            return {};
        }

        return { scrollZoom: true };
    }
}

// Register custom element definition using standard platform API
customElements.define(BarchartBasic.is, BarchartBasic);
