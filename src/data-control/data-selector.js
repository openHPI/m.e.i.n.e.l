import { DataTransformerMixin } from '../mixins/data-transformer-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `data-selector`
 *
 * This component performs a data projection on the passed data and passes the result to its inner children.
 *
 * @polymer
 * @customElement
 * @demo demo/data_control/data_selector_demo.html
 */
class DataSelector extends DataTransformerMixin(PolymerElement) {
    static get template() {
        return html`
        <slot id="chartingElement"></slot>
`;
    }

    static get is() {
        return 'data-selector';
    }

    static get properties() {
        return {
            /** Key/index of the data object that should be passed on */
            key: {
                type: String,
                observer: 'update'
            },
            /** Sequence of keys/indices of the data object that should be passed on */
            keys: {
                type: Array
            }
        };
    }

    static get observers() {
        return [
            'update(keys.*)'
        ];
    }

    /**
     * Transforms the data by performing the projection.
     * @param  {Object} data The source data.
     * @return {Object}      The transformed data.
     */
    transformData(data) {
        if (typeof data === 'undefined') return;

        let keys = this.keys || (this.key ? [this.key] : []);
        return this._selectData(data, keys);
    }

    /**
     * Perform projection defined by key sequence on given data object
     * @param  {Object} data The source data.
     * @param  {Object} keys The key sequence.
     * @return {Object}      The transformed data.
     */
    _selectData(data, keys) {
        if (Array.isArray(data) && typeof data[keys[0]] === 'undefined') {
            let that = this;
            return data.map((item) => that._selectData(item, keys));
        }

        keys.forEach((key) => {
            if (typeof data !== 'object')
                return data;
            data = data[key];
        });
        return data;
    }
}

// Register custom element definition using standard platform API
customElements.define(DataSelector.is, DataSelector);
