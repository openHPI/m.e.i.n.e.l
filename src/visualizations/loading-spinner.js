import '@polymer/polymer/lib/elements/dom-if.js';
import { DataTransformerMixin } from '../mixins/data-transformer-mixin.js';
import { FontAwesomeMixin } from '../mixins/font-awesome-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `loading-spinner`
 *
 * This component is used as wrapper of actual visualization components for displaying a spinner while loading data using the `ajax-wrapper`.
 *
 * @polymer
 * @customElement
 * @demo demo/visualizations/loading_spinner_demo.html
 */
class LoadingSpinner extends FontAwesomeMixin(DataTransformerMixin(PolymerElement)) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #spinnerContainer {
                width: 100%;
                height: 100%;
                vertical-align: middle;
                text-align: center;
            }

            #spinner {
                font-size: 40px;
            }
        </style>
        <template is="dom-if" if="[[!hasReceivedData]]">
            <div id="spinnerContainer">
                <i id="spinner" class="fa fas fa-spinner fa-spin"></i>
            </div>
        </template>
        <template is="dom-if" if="[[hasReceivedData]]">
            <slot id="chartingElement"></slot>
        </template>
`;
    }

    static get is() {
        return 'loading-spinner';
    }

    static get properties() {
        return {};
    }

    static get observers() {
        return [];
    }
}

// Register custom element definition using standard platform API
customElements.define(LoadingSpinner.is, LoadingSpinner);
