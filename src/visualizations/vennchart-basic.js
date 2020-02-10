import * as d3 from 'd3-selection';
import * as venn from 'venn.js';
import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `vennchart-basic`
 *
 * This is a basic component for venn.js charts.
 *
 * For further information and deeper understanding visit the [venn.js documentation](https://github.com/benfred/venn.js).
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/vennchart_basic_demo.html
 */
class VennchartBasic extends DataReceiverMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #container {
                position: relative;
                width: 100%;
                height: 100%;
            }

            #diagram {
                width: 100%;
                height: 100%;
            }

            #diagram svg {
                width: 100%;
                height: 100%;
            }

            #diagram path {
                stroke-opacity: 0;
                stroke: #ffffff;
                stroke-width: 3;
            }

            #tooltip {
                position: absolute;
                text-align: center;
                background: #333;
                color: #ddd;
                padding: 5px 10px;
                border: 0px;
                border-radius: 8px;
                opacity: 0;
            }
        </style>
        <div id="container">
            <div id="diagram" class="svg-container oneten-height"></div>
            <div id="tooltip"></div>
        </div>
`;
    }

    static get is() {
        return 'vennchart-basic';
    }

    static get properties() {
        return {
            /** Width of the outer div */
            width: {
                type: Number,
                value: 400
            },
            /** Height of the outer div */
            height: {
                type: Number,
                value: 300
            },
            /** Padding of the inner chart */
            padding: {
                type: Number,
                value: 10
            },
            /** Custom formatter function for displaying the labels */
            labelFormatter: {
                type: Object,
                observer: 'update'
            },
            /** Custom formatter function for displaying the value */
            valueFormatter: {
                type: Object,
                observer: 'update'
            },
            /** Excluded sets, which are not visualized */
            blacklist: {
                type: Array,
                value: [],
                observer: 'update'
            },
            hideIntersectionLabels: Boolean
        };
    }

    static get observers() {
        return [];
    }

    /**
     * Displays the data in a pie chart
     * @override
     * @param  {Object} data The received data.
     * @return {void}
     */
    dataChanged(data) {
        if (!Array.isArray(data) || data.length === 0) return;

        let that = this;
        data.forEach((set) => {
            if (typeof set.label === 'undefined') return;
            if (that.hideIntersectionLabels && set.sets.length > 1) {
                set.label = '';
            } else if (typeof that.labelFormatter === 'function') {
                set.label = that.labelFormatter(set.label);
            }
            if (typeof set.label !== 'string') {
                set.label = set.label.toString();
            }
        });

        // Apply blacklist
        data = data.filter((set) => {
            for (let i = 0; i < that.blacklist.length; i++) {
                if (set.sets.indexOf(that.blacklist[i]) >= 0) {
                    return false;
                }
            }
            return true;
        });

        let chart = venn.VennDiagram()
            .width(this.width)
            .height(this.height)
            .padding(this.padding);
        let diagram = d3.select(this.$.diagram);
        let tooltip = d3.select(this.$.tooltip);
        diagram.datum(data).call(chart);

        // Defines the width and height of the outer div
        if (this.width) {
            diagram.style('width', this.width + 'px');
        }
        if (this.height) {
            diagram.style('height', this.height + 'px');
        }

        // Make diagram responsive
        let svg = this.$.diagram.querySelector('svg');
        svg.removeAttribute('height');
        svg.removeAttribute('width');
        svg.setAttribute('viewBox', '0 0 ' + this.width + ' ' + this.height);
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.setAttribute('class', 'svg-content-responsive');

        that = this;
        diagram.selectAll('g')
            .on('mouseover', function (d) {
                // Sort all the areas relative to the current item
                venn.sortAreas(diagram, d);
                // Display a tooltip with the current size
                tooltip.transition().duration(400).style('opacity', .9);
                let text = typeof that.valueFormatter === 'function' ? that.valueFormatter(d.size) : d.size;
                tooltip.text(text);
                // Highlight the current path
                let selection = d3.select(this).transition('tooltip').duration(400);
                selection.select('path')
                    .style('fill-opacity', d.sets.length === 1 ? .4 : .1)
                    .style('stroke-opacity', 1);
            })
            .on('mousemove', () => {
                let tooltipBounds = tooltip.node().getBoundingClientRect();
                let posX = Math.min(d3.event.offsetX + 5, that.width - tooltipBounds.width);
                let posY = Math.max(d3.event.offsetY - 35, 0);
                tooltip.style('left', posX + 'px')
                    .style('top', posY + 'px');
            })
            .on('mouseout', function (d) {
                tooltip.transition().duration(400).style('opacity', 0);
                let selection = d3.select(this).transition('tooltip').duration(400);
                selection.select('path')
                    .style('fill-opacity', d.sets.length === 1 ? .25 : .0)
                    .style('stroke-opacity', 0);
            });
    }
}

// Register custom element definition using standard platform API
customElements.define(VennchartBasic.is, VennchartBasic);
