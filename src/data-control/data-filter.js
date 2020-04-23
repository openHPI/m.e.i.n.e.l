import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-button/paper-button.js';
import { DataTransformerMixin } from '../mixins/data-transformer-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `data-filter`
 *
 * This is a component for filtering data based on user input.
 *
 * @polymer
 * @customElement
 * @appliesMixin DataTransformerMixin
 * @demo demo/data_control/data_filter_demo.html
 */
class DataFilter extends DataTransformerMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #filterBar {
                margin-bottom: 20px;
            }

            #filterBar paper-button[active] {
                font-weight: bold;
            }
        </style>
        <div id="filterBar">
            <template is="dom-repeat" items="[[data]]">
                <paper-button toggles="" raised="" active="[[_isActive(item)]]" on-tap="_handleTap">[[item.name]]
                </paper-button>
            </template>
        </div>
        <slot id="chartingElement"></slot>
`;
    }

    static get is() {
        return 'data-filter';
    }

    static get properties() {
        return {
            /** Determines whether multiple series or only a single one can be selected. */
            exclusive: {
                type: Boolean,
                value: false
            },
            /** List of names of active series that are visualized */
            activeSeries: {
                type: Array,
                value: [],
                reflectToAttribute: true
            }
        };
    }

    static get observers() {
        return [
            'update(activeSeries.*)'
        ];
    }

    /**
     * Transforms the data by applying the filter
     * @param  {Object} data The source data.
     * @return {Object}      The transformed data.
     */
    transformData(data) {
        data.forEach((series, index) => {
            series.name = series.name || 'Data ' + index;
        });

        return data.filter(this._isActive.bind(this));
    }

    /**
     * Checks, whether the filter for a specific series is active or not.
     * @param  {Object}  series The data series.
     * @return {boolean}        The state of the filter for the given series.
     */
    _isActive(series) {
        if (!this.activeSeries) return false;

        return this.activeSeries.some((name) => series.name === name);
    }

    /**
     * Event handler for tap events on filter buttons.
     * Will enable or disable appropriate filter.
     * @param  {Object} e The tap event.
     * @return {void}
     */
    _handleTap(e) {
        let name = e.model.item.name;
        let index = this.activeSeries.indexOf(name);
        if (e.target.active && index === -1) {
            if (this.exclusive) {
                let buttons = this.$.filterBar.querySelectorAll('paper-button');
                for (let i = 0; i < buttons.length; i++) {
                    if (buttons[i] !== e.target) {
                        buttons[i].active = false;
                    }
                }
                this.set('activeSeries', [name]);
            } else {
                this.push('activeSeries', name);
            }
        } else if (!e.target.active && index !== -1) {
            this.splice('activeSeries', index, 1);
        }
    }
}

// Register custom element definition using standard platform API
customElements.define(DataFilter.is, DataFilter);
