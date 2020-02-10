import '../shared-styles/plotly-styles.js';
import { PlotlyMixin } from '../mixins/plotly-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `linechart-basic`
 *
 * This is a basic component for plotly linecharts.
 *
 * For further information and deeper understanding visit the [Plotly line chart documentation](https://plot.ly/javascript/line-charts/).
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/linechart_basic_demo.html
 */
class LinechartBasic extends PlotlyMixin(PolymerElement) {
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
        return 'linechart-basic';
    }

    static get properties() {
        return {
            /** Accent color of chart */
            accentcolor: {
                type: String,
                value: 'rgba(0,0,0,1)',
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
            /** Mode of the line chart. Must be either `markers`, `lines` or `lines+markers`. */
            mode: {
                type: String,
                value: 'lines'
            },
            /** Determines whether to show the latest value at the end of the graph */
            highlightLatest: {
                type: Boolean,
                value: false
            },
            /** Draw vertical dotted lines at specified x-axis points */
            vLines: {
                type: Array,
                value: []
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
        data.forEach((series) => {
            series.mode = series.mode || that.mode;
            if (that.highlightLatest) {
                series.mode = series.mode + '+text';
                series.textposition = 'middle right';
                series.textfont = { size: 16 };
                series.text = series.y.map((value, i) => i === series.y.length - 1 ? value : '');
            }
        });

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
                tickmode: 'auto',
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                }
            },
            yaxis: {
                fixedrange: true,
                tickfont: {
                    size: 14,
                    color: this.accentcolor
                }
            },
            margin: { l: 40, r: 10, t: 10, b: 40 },
            shapes: []
        };

        if (this.scrollzoom) {
            let maxX = data[0].x[data[0].x.length - 1];
            let minX = data[0].x[Math.round(data[0].x.length * (1 - this.scrollrange / 100))];
            layout.xaxis.rangeslider = {};
            layout.xaxis.range = [minX, maxX];
        }

        this.vLines.forEach((item) => {
            layout.shapes.push(
                {
                    type: 'line',
                    x0: item,
                    y0: 0,
                    x1: item,
                    yref: 'paper',
                    y1: 1,
                    line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                    }
                }
            );
        });

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
customElements.define(LinechartBasic.is, LinechartBasic);
