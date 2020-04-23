import '@polymer/polymer/lib/elements/dom-if.js';
import '@lrnwebcomponents/count-up/count-up.js';
import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { FontAwesomeMixin } from '../mixins/font-awesome-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';
import { animationFrame } from '@polymer/polymer/lib/utils/async.js';

/**
 * ## `counter-basic`
 *
 * This is a basic component for a counter displaying a single numeric value.
 *
 * @polymer
 * @customElement
 * @appliesMixin FontAwesomeMixin
 * @appliesMixin DataReceiverMixin
 * @demo demo/visualizations/counter_basic_demo.html
 */
class CounterBasic extends FontAwesomeMixin(DataReceiverMixin(PolymerElement)) {
    static get template() {
        return html`
        <template is="dom-if" if="[[hasReceivedData]]">
            <template is="dom-if" if="[[_isNumericData]]">
                <count-up end="[[_value]]" prefixtext="[[prefix]]" suffixtext="[[suffix]]" decimalPlaces="[[decimals]]" duration="[[animationDuration]]"></count-up>
            </template>
            <template is="dom-if" if="[[_isTextData]]">
                <span>[[_value]]</span>
            </template>
        </template>
        <template is="dom-if" if="[[_showSpinner]]">
            <span> <!-- Another parent element than 'template' is required for FontAwesome -->
                <i id="spinner" class="fas fa-spinner fa-spin"></i>
            </span>
        </template>
`;
    }

    static get is() {
        return 'counter-basic';
    }

    static get properties() {
        return {
            /** Optional text before the number. */
            prefix: String,
            /** Optional text after the number. */
            suffix: String,
            /** Number of decimals to show. */
            decimals: {
                type: Number,
                value: 0
            },
            /** The default value that is shown if data is `null`. */
            defaultValue: {
                type: String,
                value: 'n/a'
            },
            /** Custom formatter function for displaying the value */
            valueFormatter: {
                type: Object,
                value: null
            },
            /** Animation duration in seconds. */
            animationDuration: {
                type: Number,
                value: 1
            },
            /** Determines whether the loading spinner should be hidden. */
            hideSpinner: {
                type: Boolean,
                value: false
            },
            _showSpinner: {
                type: Boolean,
                computed: '_computeShowSpinner(hideSpinner, hasReceivedData)'
            },
            _value: {
                type: Object,
                computed: '_computeValue(hasReceivedData, data, defaultValue, valueFormatter)'
            },
            _isNumericData: {
                type: Boolean,
                computed: '_computeIsNumericValue(_value)'
            },
            _isTextData: {
                type: Boolean,
                computed: '_computeIsTextValue(_value)'
            }
        };
    }

    static get observers() {
        return [];
    }

    _computeShowSpinner(hideSpinner, hasReceivedData) {
        return !hideSpinner && !hasReceivedData;
    }

    _computeValue(hasReceivedData, data, defaultValue, formatter) {
        if (!hasReceivedData || data === null || data === undefined) {
            return defaultValue;
        }

        return typeof formatter === 'function' ? formatter(data) : data;
    }

    _computeIsNumericValue(value) {
        return typeof value === 'number';
    }

    _computeIsTextValue(value) {
        return typeof value === 'string';
    }

    _dataChanged(data) {
        super._dataChanged();

        animationFrame.run(() => {
            let _countUpElement = this.shadowRoot.querySelector('count-up');

            if (_countUpElement !== null && _countUpElement !== undefined && this._computeIsNumericValue(data.value)) {
                _countUpElement._countUp.update(data.value);
            }
        });
    }
}

// Register custom element definition using standard platform API
customElements.define(CounterBasic.is, CounterBasic);
