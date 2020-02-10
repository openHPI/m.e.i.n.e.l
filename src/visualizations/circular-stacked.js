import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `circular-stacked`
 *
 * This is a basic component for stacked circular charts
 *
 * **Data format:** array of integer values (percentage)
 * @polymer
 * @customElement
 * @demo demo/visualizations/circular_stacked_demo.html
 */
class CircularStacked extends DataReceiverMixin(PolymerElement) {
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
        return 'circular-stacked';
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
            /** Fill and text color*/
            primarycolor: {
                type: String,
                value: '#f2503f'
            }
        };
    }

    static get observers() {
        return [];
    }

    /**
     * Plots the diagram
     * @override
     * @param  {Object} data The received data.
     * @return {void}
     */
    dataChanged(data) {
        let d3 = Plotly.d3;
        let tau = 2 * Math.PI;

        let width = this.width;
        let height = this.height;
        let edgeLength = Math.min(width, height);

        let arcCount = data.length;

        let innermostRadius = edgeLength / 8; //Smallest
        let outermostRadius = innermostRadius * 3; //Largest

        let lineWeight = (outermostRadius - innermostRadius) / arcCount;
        let MAX_LINEWEIGHT = 50;
        if (lineWeight > MAX_LINEWEIGHT) {
            lineWeight = MAX_LINEWEIGHT;
        }

        let spacing = lineWeight - 10;

        function buildArc(innerRadius, outerRadius, percentage) {
            let endAngle = percentage / 100 * tau;
            return d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(0)
                .endAngle(endAngle);
        }

        let diagram = d3.select(this.$.diagram);

        //Make sure to delte old diagram components on update
        diagram.selectAll('*').remove();

        let svg = diagram.append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        let innerRadius = innermostRadius;
        let outerRadius = innerRadius + lineWeight;
        let delta = lineWeight + spacing;

        for (let i = 0; i < arcCount; i++) {
            let arc = buildArc(innerRadius, outerRadius, data[i]);
            svg.append('path')
                .attr('d', arc)
                .attr('fill', this.primarycolor);

            innerRadius += delta;
            outerRadius += delta;
        }
    }
}

// Register custom element definition using standard platform API
customElements.define(CircularStacked.is, CircularStacked);
