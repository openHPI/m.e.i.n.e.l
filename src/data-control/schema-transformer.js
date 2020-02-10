import { DataTransformerMixin } from '../mixins/data-transformer-mixin.js';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

/**
 * ## `schema-transformer`
 *
 * This component performs a schema transformation on the passed data and passes the result to its inner children.
 *
 * The transformation is defined by a list of mappings each creating a single key-value pair in the resulting object. Mappings need to match the following schema:
 *
 * ```xml
 *  {
 *      "<keyInResult>": {
 *          "type": "<transformationType>",
 *          "<additionalParameter1>": "<value>",
 *          "<additionalParameter2>": "<value>"
 *      },
 *      ...
 *  }
 * ```
 *
 * The following transformation types are supported:
 * - **constant**: The value of the key is set to a constant string specified in additional parameter `value`.
 * - **collect**: The value of the key is collected from a certain key of the source object(s). Key of the entry must be specified in additional parameter `sourceKey`.
 * - **keys**: The value of the key is set to an (flattened) array of the keys of the source object(s).
 * - **values**: The value of the key is set to an (flattened) array of the values of the source object(s).
 *
 * For more concrete mapping examples visit the demo page.
 *
 * @polymer
 * @customElement
 * @demo demo/data_control/schema_transformer_demo.html
 */
class SchemaTransformer extends DataTransformerMixin(PolymerElement) {
    static get template() {
        return html`
        <slot id="chartingElement"></slot>
`;
    }

    static get is() {
        return 'schema-transformer';
    }

    static get properties() {
        return {
            /** The array of mappings that should be performed. */
            mappings: Array,
            /** Per default, the mappings are executed for each source object and results get merged into a single object. This mixin can be disabled using this parameter. */
            noMerge: Boolean
        };
    }

    static get observers() {
        return [
            'update(mapping.*)'
        ];
    }

    /**
     * Transforms the data into a plotly readable object.
     * @param  {Object} data The source data.
     * @return {Object}      The transformed data.
     */
    transformData(data) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        if (this.noMerge) {
            let that = this;
            return this._flatten(data.map((item) => that._applyMappings(item)));
        } else {
            return this._applyMappings(data);
        }
    }

    _applyMappings(data) {
        let that = this;
        return this.mappings.map((mapping) => {
            let result = {};
            for (let key in mapping) {
                if (Object.prototype.hasOwnProperty.call(mapping, key)) {
                    let transformType = mapping[key].type;
                    result[key] = that._applyTransformation(transformType, data, mapping[key]);
                }
            }

            return result;
        });
    }

    _applyTransformation(type, data, mapping) {
        switch (type) {
            case 'constant':
                return this._applyConstantMapping(mapping, data);
            case 'collect':
                return this._applyCollectMapping(mapping, data);
            case 'keys':
                return this._applyKeysMapping(mapping, data);
            case 'values':
                return this._applyValuesMapping(mapping, data);
        }
    }

    _applyConstantMapping(mapping) {
        return mapping.value;
    }

    _applyCollectMapping(mapping, data) {
        if (!Array.isArray(data)) {
            return data[mapping.sourceKey];
        }

        let result = data.map((item) => item[mapping.sourceKey]);

        if (mapping.nestedTargetKey !== undefined) {
            let hash = {};
            hash[mapping.nestedTargetKey] = result;
            return hash;
        } else {
            return result;
        }
    }

    _applyKeysMapping(mapping, data) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        return this._flatten(data.map((item) => Object.keys(item)));
    }

    _applyValuesMapping(mapping, data) {
        if (!Array.isArray(data)) {
            data = [data];
        }

        return this._flatten(data.map((item) => Object.keys(item).map((key) => item[key])));
    }

    _flatten(arrays) {
        return [].concat.apply([], arrays);
    }
}

// Register custom element definition using standard platform API
customElements.define(SchemaTransformer.is, SchemaTransformer);
