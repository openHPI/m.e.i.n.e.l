import * as d3Scale from 'd3-scale';
import * as d3Selection from 'd3-selection';
const d3 = Object.assign({}, d3Scale, d3Selection);
import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `activitychart-basic`
 *
 * This component shows an activity history, similar to the colored github chart.
 *
 * **Data format:** X (timestamp) and Y (measure) values to be plotted (in JSON format)
 *
 * @polymer
 * @customElement
 * @appliesMixin DataReceiverMixin
 * @demo demo/visualizations/activitychart_basic_demo.html
 */
class ActivitychartBasic extends DataReceiverMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #diagram {
                display: flex;
                overflow: hidden;
            }

            #left-part, #right-part-wrapper {
                float: left;
            }

            #right-part-wrapper {
                overflow-y: auto;
            }
        </style>

        <div id="diagram">
            <svg id="left-part">
                <!-- draw y axis here -->
            </svg>
            <div id="right-part-wrapper">
                <svg id="right-part">
                    <!-- draw y axis and cells here -->
                </svg>
            </div>
        </div>
`;
    }

    static get is() {
        return 'activitychart-basic';
    }

    static get properties() {
        return {
            /** Primary color of chart; formats supported are Hex, Short Hex, RGB (absolute), RGB (percentual), RGBA (absolute), RGBA (percentual), keyword (e.g. 'white'), HSL and HSLA */
            primarycolor: {
                type: String,
                value: '#930517',
                observer: 'update'
            },
            /** Accent color of chart; formats supported are Hex, Short Hex, RGB (absolute), RGB (percentual), RGBA (absolute), RGBA (percentual), keyword (e.g. 'white'), HSL and HSLA  */
            accentcolor: {
                type: String,
                value: '#F5E8BB',
                observer: 'update'
            },
            /** Width of cell */
            cellWidth: {
                type: Number,
                value: 15,
                observer: 'update'
            },
            /** Height of cell */
            cellHeight: {
                type: Number,
                value: 15,
                observer: 'update'
            },
            /** Space between cells (in px) */
            cellSpacing: {
                type: Number,
                value: 5,
                observer: 'update'
            },
            /** Set padding (in px) of the label shown when hovering over a datum */
            labelPadding: {
                type: Number,
                value: 3,
                observer: 'update'
            },
            /** Set text size (in px) of label shown when hovering over a datum */
            labelTextSize: {
                type: Number,
                value: 14,
                observer: 'update'
            },
            /** Determine whether labels of X axis should be rotated */
            rotateXLabels: {
                type: Boolean,
                value: false,
                observer: 'update'
            },
            /** Customize the label background color */
            labelBackgroundColor: {
                type: String,
                value: 'white',
                observer: 'update'
            },
            /** Title of the x axes */
            xTitle: {
                type: String,
                value: 'x',
                observer: 'update'
            },
            /** Title of the y axes */
            yTitle: {
                type: String,
                value: 'y',
                observer: 'update'
            },
            /** Set text size (in px) of the axes' title labels */
            axisTitleTextSize: {
                type: Number,
                value: 14,
                observer: 'update'
            },
            /** Set text size (in px) of the axes' labels */
            axisLabelsTextSize: {
                type: Number,
                value: 12,
                observer: 'update'
            },
            /** Decide with what column-frequency the lables on the x axis should be shown*/
            xLabelFrequency: {
                type: Number,
                value: 1,
                observer: 'update'
            },
            /** Decide with what column-frequency the lables on the y axis should be shown*/
            yLabelFrequency: {
                type: Number,
                value: 1,
                observer: 'update'
            },
            /** Flag to disable y-Axis */
            hideYAxis: {
                type: Boolean,
                value: false,
                observer: 'update'
            },
            /** Custom formatter function for x axes labels */
            xLabelFormatter: {
                type: Object,
                observer: 'update'
            },
            /** Custom formatter function for y axes labels */
            yLabelFormatter: {
                type: Object,
                observer: 'update'
            },
            /** Custom formatter function for cell label */
            cellLabelFormatter: {
                type: Object,
                observer: 'update'
            },
            /** Determines whether x values should be sorted before plotting (can be `asc` or `desc` depending on the sorting direction) */
            sortXValues: {
                type: String,
                observer: 'update'
            },
            /** Determines whether y values should be sorted before plotting (can be `asc` or `desc` depending on the sorting direction) */
            sortYValues: {
                type: String,
                observer: 'update'
            },
            /* Is updated automatically when data is changed and cannot be overwritten. */
            _xValues: Array,
            /* Is updated automatically when data is changed and cannot be overwritten. */
            _yValues: Array,
            /* This property is computed automatically based on cell-spacing and axis title text size and cannot be overwritten. */
            _yAxisOffset: {
                type: Number,
                computed: '_computeYAxesOffset(cellSpacing, axisTitleTextSize)'
            },
            /* This property is computed automatically based on cell-size and cell-spacing and cannot be overwritten. */
            _cellOuterWidth: {
                type: Number,
                computed: '_computeCellOuterSize(cellSpacing, cellWidth)'
            },
            /* This property is computed automatically based on cell-size and cell-spacing and cannot be overwritten. */
            _cellOuterHeight: {
                type: Number,
                computed: '_computeCellOuterSize(cellSpacing, cellHeight)'
            },
            /** Number of colored dots per column. Is always derived from the size of axisLabels.y.values provided and cannot be overwritten! */
            _cellsPerColumn: {
                type: Number,
                computed: '_computeCellsPerColumn(_yValues)'
            }
        };
    }

    static get observers() {
        return [];
    }

    /**
     * Computes the vertical offset of the y axes.
     * @param  {Number} cellSpacing       The cell spacing.
     * @param  {Number} axisTitleTextSize The text size used for the axis title.
     * @return {Number}                   The offset for the y axes.
     */
    _computeYAxesOffset(cellSpacing, axisTitleTextSize) {
        return axisTitleTextSize + 2 * cellSpacing;
    }

    /**
     * Computes the outer size(width or height) of a cell.
     * @param  {Number} cellSpacing The cell spacing.
     * @param  {Number} cellSize    The text size used for the axis title.
     * @return {Number}             The outer size of a cell.
     */
    _computeCellOuterSize(cellSpacing, cellSize) {
        return cellSize + cellSpacing;
    }

    /**
     * Deduces the number of cells to be shown per column from the number of y labels provided.
     * @param  {Number} yValues The number of y labels.
     * @return {Number}         The number of cells to be shown.
     */
    _computeCellsPerColumn(yValues) {
        return yValues.length;
    }

    /**
     * Plots the diagram
     * @override
     * @param  {Object} data The received data.
     * @return {void}
     */
    dataChanged(data) {
        // Clear diagram
        let diagram = d3.select(this.$.diagram);
        diagram.select('#left-part').selectAll('*').remove();
        diagram.select('#right-part').selectAll('*').remove();

        // Extract labels from data
        this._xValues = this._extractValues(data, 'x');
        this._yValues = this._extractValues(data, 'y').reverse();

        // Plot axis and cells
        this._plotYAxis(diagram);
        this._plotXAxis(diagram);
        this._plotCells(diagram, data);

        // Scroll all the way to the right
        this.$['right-part-wrapper'].scrollLeft = this._getBounds(diagram, 'right-part').width;
    }

    _extractValues(data, axis) {
        let values = this._distinct(data.map((dataPoint) => dataPoint[axis]));

        let sortDirection = axis === 'x' ? this.sortXValues : this.sortYValues;
        if (sortDirection) {
            if (typeof values[0] === 'number') {
                values = values.sort((a, b) => a - b);
            } else {
                values = values.sort();
            }
            if (sortDirection === 'desc') {
                values = values.reverse();
            }
        }

        return values;
    }

    _plotYAxis(diagram) {
        let that = this;

        // Add margin to right part
        diagram.select('#left-part')
            .style('margin-right', this.cellSpacing);

        // Create axis container
        let axis = diagram.select('#left-part').append('g')
            .attr('id', 'y-axis');

        // Add title
        axis.append('text')
            .text(this.yTitle)
            .style('font-size', this.axisTitleTextSize + 'px')
            .attr('x', 0)
            .attr('y', this.axisTitleTextSize);

        // Add labels
        let axisLabels = axis.append('g');
        axisLabels.selectAll('text')
            .data(this._yValues.filter((label, index) => index % that.yLabelFrequency === 0))
            .enter().append('text')
            .text(this._getAxisLabel.bind(this, this.yLabelFormatter))
            .style('font-size', this.axisLabelsTextSize + 'px')
            .attr('x', 0)
            .attr('y', (value) => that._getCellPosY(value) + (that.cellSpacing / 2) + (that.cellHeight / 2))
            .attr('alignment-baseline', 'middle');
        axisLabels.attr('transform', 'translate(0, ' + this._yAxisOffset + ')');

        // Set axis size
        diagram.select('#left-part')
            .attr('height', this._getBounds(diagram, 'y-axis').height)
            .attr('width', this.hideYAxis ? 0 : this._getBounds(diagram, 'y-axis').width);
    }

    _plotXAxis(diagram) {
        let that = this;
        // Create axis container
        let axis = diagram.select('#right-part').append('g')
            .attr('id', 'x-axis');

        // Add title
        axis.append('text')
            .text(this.xTitle)
            .style('font-size', this.axisTitleTextSize + 'px')
            .attr('x', this._xValues.length * this._cellOuterWidth + this.cellSpacing)
            .attr('y', this.axisTitleTextSize)
            .attr('alignment-baseline', 'after-edge');

        // Add labels
        axis.append('g').selectAll('text')
            .data(this._xValues.filter((label, index) => index % that.xLabelFrequency === 0))
            .enter().append('text')
            .text(this._getAxisLabel.bind(this, this.xLabelFormatter))
            .style('font-size', this.axisLabelsTextSize + 'px')
            .attr('transform', (label) => {
                let translationX = that._getCellPosX(label) + (that.cellWidth / 2);
                let translationY = that.rotateXLabels ? 0 : that.axisLabelsTextSize;
                let rotation = that.rotateXLabels ? -90 : 0;
                return 'translate(' + translationX + ', ' + translationY + ')rotate(' + rotation + ')';
            })
            .attr('text-anchor', this.rotateXLabels ? 'end' : 'middle')
            .attr('alignment-baseline', this.rotateXLabels ? 'middle' : 'after-edge');

        // Position axis at bottom
        axis.attr('transform', 'translate(0, ' + (this._yAxisOffset + (this._cellsPerColumn * this._cellOuterHeight)) + ')');
    }

    _plotCells(diagram, data) {
        let that = this;

        // Find min and max values
        let values = data.map((dataPoint) => dataPoint.value);
        let minValue = Math.min.apply(null, values);
        let maxValue = Math.max.apply(null, values);

        // The appropriate color is calculated based on the value of the datum
        let colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([this.accentcolor, this.primarycolor]);

        // Create cells container
        let cells = diagram.select('#right-part').append('g')
            .attr('transform', 'translate(0, ' + this._yAxisOffset + ')')
            .attr('id', 'cells');

        // Draw cells for data points
        cells.selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr('width', this.cellWidth)
            .attr('height', this.cellHeight)
            .attr('x', (dataPoint) => that._getCellPosX(dataPoint.x))
            .attr('y', (dataPoint) => that._getCellPosY(dataPoint.y))
            .attr('fill', (d) => colorScale(d.value))
            .on('mouseover', this._showLabel.bind(this, diagram))
            .on('mouseout', this._hideLabel.bind(this, diagram));

        // Set axis and cell size
        let xAxisBounds = this._getBounds(diagram, 'x-axis');
        let width = xAxisBounds.x + xAxisBounds.width;
        let height = this._yAxisOffset + (this._cellsPerColumn * this._cellOuterHeight) + xAxisBounds.height;
        diagram.select('#right-part-wrapper').style('width', width + 'px');
        diagram.select('#right-part').attr('height', height).attr('width', width);
    }

    /**
     * Appends a label showing the detailed activity count and date of the activity cell that the mouse hovers over.
     * @param  {Object} diagram   The diagram.
     * @param  {Object} dataPoint The data point to be annotated.
     * @param  {Object} index     The index.
     * @return {void}
     */
    _showLabel(diagram, dataPoint, index) {
        let label = diagram.select('#cells').append('g')
            .attr('id', 'label-' + index);


        let labelText = label.append('text')
            .text(this._getCellLabel(dataPoint))
            .style('font-size', this.labelTextSize + 'px')
            .attr('dominant-baseline', 'text-after-edge');

        // Position is set relative to the size of the text element
        let labelTextWidth = labelText.node().getBBox().width;
        labelText
            .attr('x', this._getLabelPosX(diagram, dataPoint, labelTextWidth))
            .attr('y', this._getLabelPosY(dataPoint));

        // Insert rect as background
        label.insert('rect', 'text')
            .attr('x', labelText.attr('x') - this.labelPadding)
            .attr('y', labelText.attr('y') - this.labelTextSize - this.labelPadding)
            .attr('fill', this.labelBackgroundColor)
            .attr('width', labelTextWidth + (2 * this.labelPadding))
            .attr('height', this.labelTextSize + (2 * this.labelPadding));
    }

    /**
     * Deletes the label once the mouse doesn't hover over the corresponding cell anymore
     * @param  {Object} diagram   The diagram.
     * @param  {Object} dataPoint The data point.
     * @param  {Object} index     The index.
     * @return {void}
     */
    _hideLabel(diagram, dataPoint, index) {
        diagram.select('#label-' + index).remove();
    }

    /**
     * Removes duplicate items from array
     * @param  {Array} array The array to clean.
     * @return {Array}       The array without duplicates.
     */
    _distinct(array) {
        return array.filter((item, index, self) => self.indexOf(item) === index);
    }

    _getCellLabel(dataPoint) {
        if (typeof this.cellLabelFormatter === 'function') {
            return this.cellLabelFormatter(dataPoint);
        } else {
            let xLabel = this._getAxisLabel(this.xLabelFormatter, dataPoint.x);
            let yLabel = this._getAxisLabel(this.yLabelFormatter, dataPoint.y);
            return dataPoint.value + ' (' + xLabel + ', ' + yLabel + ')';
        }
    }

    /**
     * Returns axes label for a corresponding value
     * @param  {Function} formatter The formatter to be used.
     * @param  {Object}   value     The value.
     * @return {String}             The axis label.
     */
    _getAxisLabel(formatter, value) {
        return typeof formatter === 'function' ? formatter(value) : value;
    }

    /**
     * Returns the bounding box of a group element, useful for accessing a group's width and height
     * @param  {Object} diagram The diagram.
     * @param  {Object} id      The ID.
     * @return {Object}         The bounding box.
     */
    _getBounds(diagram, id) {
        return diagram.select('#' + id).node().getBBox();
    }

    /**
     * Returns the x position of a label considering the corresponding cell's position, the label's width as well as the bounds of the SVG
     * @param  {Object} diagram        The diagram.
     * @param  {Object} dataPoint      The data point.
     * @param  {Number} labelTextWidth The width of the text label.
     * @return {Number}                The calculated x position.
     */
    _getLabelPosX(diagram, dataPoint, labelTextWidth) {
        let pos = this._getCellPosX(dataPoint.x) + this.labelPadding;
        let maxPos = this._getBounds(diagram, 'cells').width - labelTextWidth - this.labelPadding;

        return Math.min(pos, maxPos);
    }

    /**
     * Returns the y position of a label considering the corresponding cell's position, the label's height as well as the bounds of the SVG
     * @param  {Object} dataPoint The data point.
     * @return {Number}           The calculated y position.
     */
    _getLabelPosY(dataPoint) {
        let cellPos = this._getCellPosY(dataPoint.y);
        let labelHeight = this.labelTextSize + this.labelPadding;
        let minPos = this.cellHeight + labelHeight;
        let topPos = cellPos - this.labelPadding;
        let belowPos = cellPos + this.cellHeight + labelHeight;

        return topPos >= minPos ? topPos : belowPos;
    }

    /**
     * Returns the x position where the cell should be placed
     * @param  {Number} xValue The x value.
     * @return {Number}        The calculated x position.
     */
    _getCellPosX(xValue) {
        return Math.max(0, this._cellOuterWidth * this._xValues.indexOf(xValue));
    }

    /**
     * Returns the y position where the cell should be placed
     * @param  {Number} yValue The y value.
     * @return {Number}        The calculated y position.
     */
    _getCellPosY(yValue) {
        return Math.max(0, this._cellOuterHeight * this._yValues.indexOf(yValue));
    }
}

// Register custom element definition using standard platform API
customElements.define(ActivitychartBasic.is, ActivitychartBasic);
