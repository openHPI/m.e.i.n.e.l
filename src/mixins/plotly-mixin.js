import { DataReceiverMixin } from './data-receiver-mixin.js';

/**
 * Mixin that acts as base class for plotly-based chart components.
 *
 * @polymer
 * @mixinFunction
 * @appliesMixin DataReceiverMixin
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const PlotlyMixin = (BaseClass) => class extends DataReceiverMixin(BaseClass) {
    static get properties() {
        return {
            /** Width of the outer div */
            width: {
                type: Number,
                observer: 'update'
            },
            /** Height of the out div */
            height: {
                type: Number,
                observer: 'update'
            }
        };
    }

    /**
     * Add resize event listener
     * @callback connectedCallback
     * @return  {void}
     * @listens 'resize'
     */
    connectedCallback() {
        super.connectedCallback();
        // Makes plot responsive
        let that = this;
        window.addEventListener('resize', () => {
            let gd = that.getDiagram().children[0];
            if (gd) {
                Plotly.Plots.resize(gd);
            }
        });
    }

    /**
     * Plots the diagram
     * @override
     * @param  {Object} data The received data.
     * @return {void}
     */
    dataChanged(data) {
        let d3 = Plotly.d3;
        let diagram = d3.select(this.getDiagram());

        // Resets plot area in case we're redrawing
        diagram.selectAll('*').remove();

        // Defines the width and height of the outer div
        if (this.width) {
            diagram.style('width', this.width + 'px');
        }
        if (this.height) {
            diagram.style('height', this.height + 'px');
        }

        // Creates new div with specific attributes under outer div
        let WIDTH_IN_PERCENT_OF_PARENT = 100,
            HEIGHT_IN_PERCENT_OF_PARENT = 100;
        let gd3 = diagram
            .append('div')
            .style({
                width: WIDTH_IN_PERCENT_OF_PARENT + '%',
                'margin-left': ((100 - WIDTH_IN_PERCENT_OF_PARENT) / 2) + '%',

                height: HEIGHT_IN_PERCENT_OF_PARENT + '%',
                'margin-top': ((100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2) + '%'
            });
        let gd = gd3.node();

        // Applies default config options
        let config = this.getConfig();
        config.displayModeBar = false;

        // Creates plot
        Plotly.newPlot(gd, this.getPlotData(data), this.getLayout(data), config);
    }

    /**
     * Gets the container element of the diagram that should be rendered
     * @abstract
     * @return {Object} The container element of the diagram.
     */
    getDiagram() {
    }

    /**
     * Prepares the data for the plot
     * @param  {Object} data The data to transform.
     * @return {Object}      The desired data.
     */
    getPlotData(data) {
        return data;
    }

    /**
     * Gets the layout options of the plot
     * @param  {Object} data The data of the plot.
     * @return {Object}      The layout options.
     */
    getLayout(data) {
        return data;
    }

    /**
     * Gets the config options of the plot
     * @return {Object} The config options.
     */
    getConfig() {
        return {};
    }
};
