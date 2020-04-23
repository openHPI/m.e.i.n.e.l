import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `circular-progress`
 *
 * This is a basic component for circular progress charts
 *
 * **Data format:** integer value (percentage) or array of two integer values (percentage) to show secondary data
 *
 * @polymer
 * @customElement
 * @appliesMixin DataReceiverMixin
 * @demo demo/visualizations/circular_progress_demo.html
 */
class CircularProgress extends DataReceiverMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }
        </style>
        <div id="diagram"></div>
`;
    }

    static get is() {
        return 'circular-progress';
    }

    static get properties() {
        return {
            /** Width of the outer div */
            width: {
                type: Number,
                value: 200
            },
            /** Height of the outer div */
            height: {
                type: Number,
                value: 200
            },
            /** Fill color */
            primarycolor: {
                type: String,
                value: '#f2503f'
            },
            /** Text color */
            primarytextcolor: {
                type: String,
                value: '#000000'
            },
            /** Fill color of optional secondary value */
            secondarycolor: {
                type: String,
                value: '#ffa64c'
            },
            /** Text color of optional secondary value */
            secondarytextcolor: {
                type: String,
                value: '#ffa64c'
            },
            /** Background color of the circle */
            accentcolor: {
                type: String,
                value: '#404F70'
            }
        };
    }

    static get observers() {
        return [];
    }

    /**
     * Add resize event listener
     * @callback connectedCallback
     * @return  {void}
     * @listens 'resize'
     */
    connectedCallback() {
        super.connectedCallback();
        let that = this;
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (that.ignoreFirst) {
                    that.update();
                }
                that.ignoreFirst = true;
            }, 250);
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

        let diagram = d3.select(this.$.diagram);

        /** Reset plot area in case we're redrawing */
        let gd3 = diagram.selectAll('*').remove();

        let WIDTH_IN_PERCENT_OF_PARENT = 100,
            HEIGHT_IN_PERCENT_OF_PARENT = 100;

        /** Defines the width and height of the outer div */
        diagram.style('width', this.width + 'px');
        diagram.style('height', this.height + 'px');

        /** Create new div with specific attributes under outer div */
        gd3 = diagram.append('div')
            .style('width', WIDTH_IN_PERCENT_OF_PARENT + '%')
            .style('margin-left', (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%')
            .style('height', HEIGHT_IN_PERCENT_OF_PARENT + '%')
            .style('margin-top', (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 2 + '%');

        let createPercentageFill = function (svg, id, color) {
            let defs = svg.append('svg:defs');

            let redGradient = defs.append('svg:linearGradient')
                .attr('id', id)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '50%')
                .attr('y2', '100%')
                .attr('spreadMethod', 'pad');

            redGradient.append('svg:stop')
                .attr('offset', '50%')
                .attr('stop-color', color)
                .attr('stop-opacity', 1);
        };

        let width = this.offsetWidth,
            height = this.offsetHeight;

        let edgeLength = Math.min(width, height);

        let innerRadius = edgeLength / 3;
        let arcLineWeight = edgeLength / 10;
        let outerRadius = innerRadius + arcLineWeight;

        let svg = gd3.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        let arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(2 * Math.PI);

        let arcLine = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0);

        // PathBackground
        svg.append('path')
            .attr('d', arc)
            .style('fill', this.accentcolor);

        if (Array.isArray(data)) { //  Tx, ty, px, py,  fts,  fps
            buildValue(data[0], this.primarycolor, this.primarytextcolor, 'gradient1', -20, 25, 6, -20, 0.30, 0.15);
            buildValue(data[1], this.secondarycolor, this.secondarytextcolor, 'gradient2', -40, 4, 8, 6, 0.20, 0.10);
        } else {
            buildValue(data, this.primarycolor, this.primarytextcolor, 'gradient1', -20, 10, 6, -60, 0.30, 0.15);
        }

        function buildValue(percent, color, textcolor, id, tx, ty, px, py, fts, fps) {
            if (percent === null) return;

            //Percent to fill, fill-color, unique ID, textx, texty, %x, %y, font-size(text), font-size(%)
            if (parseInt(percent) === 100) {
                px = px - 2;
            } // Move % to right if 100% to prevent overlap

            let ratio = percent / 100;
            createPercentageFill(svg, id, color);

            let pathChart = svg.append('path')
                .datum({ endAngle: 0 })
                .attr('d', arcLine)
                .style('fill', 'url(#' + id + ')');

            let middleCount = svg.append('text')
                .text((d) => d)
                .attr('text-anchor', 'middle')
                .attr('dy', edgeLength / ty)
                .attr('dx', edgeLength / tx)
                .style('fill', textcolor)
                .style('font-size', (fts * edgeLength) + 'px');

            svg.append('text')
                .text('%')
                .attr('text-anchor', 'middle')
                .attr('dy', edgeLength / py)
                .attr('dx', edgeLength / px)
                .style('fill', textcolor)
                .style('font-size', (fps * edgeLength) + 'px');

            let arcTween = function (transition, newAngle) {
                transition.attrTween('d', (d) => {
                    let interpolate = d3.interpolate(d.endAngle, newAngle);
                    let interpolateCount = d3.interpolate(0, percent);
                    return function (t) {
                        d.endAngle = interpolate(t);
                        middleCount.text(Math.floor(interpolateCount(t)));
                        return arcLine(d);
                    };
                });
            };

            pathChart.transition()
                .duration(750)
                .ease('cubic')
                .call(arcTween, 2 * Math.PI * ratio);
        }
    }
}

// Register custom element definition using standard platform API
customElements.define(CircularProgress.is, CircularProgress);
