import '@polymer/polymer/lib/elements/dom-if.js';
import { DataTransformerMixin } from '../mixins/data-transformer-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `fallback-text`
 *
 * This component is used as wrapper of actual visualization components for displaying a fallback text if received data is empty.
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/fallback_text_demo.html
 */
class FallbackText extends DataTransformerMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }
        </style>
        <template is="dom-if" if="[[_hasEmptyData]]">
            <span>[[emptyDataText]]</span>
        </template>
        <template is="dom-if" if="[[!_hasEmptyData]]">
            <slot></slot>
        </template>
`;
    }

    static get is() {
        return 'fallback-text';
    }

    static get properties() {
        return {
            emptyDataText: String,
            _hasEmptyData: {
                type: Boolean,
                computed: '_computeHasEmptyData(hasReceivedData, data)'
            }
        };
    }

    static get observers() {
        return [];
    }

    _computeHasEmptyData(hasReceivedData, data) {
        if (!hasReceivedData) {
            return false;
        }
        if (Array.isArray(data)) {
            return data.length === 0;
        }
        if (data !== null && typeof data === 'object') {
            return Object.keys(data).length === 0;
        }

        return typeof data === 'undefined' || data === null;
    }
}

// Register custom element definition using standard platform API
customElements.define(FallbackText.is, FallbackText);
