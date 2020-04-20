import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `badges-list`
 *
 * This is a component for a list of counter badges.
 *
 * @polymer
 * @customElement
 * @appliesMixin DataReceiverMixin
 * @demo demo/visualizations/badges_list_demo.html
 */
class BadgesList extends DataReceiverMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            .table {
                display: table;
            }
            
            .row {
                display: table-row;
            }
            
            .cell {
                display: table-cell;
            }

            .badge {
                background-color: #000;
                color: #fff;
                display: inline-block;
                padding-left: 8px;
                padding-right: 8px;
                text-align: center;
                border-radius: 10px;
                margin-right: 8px;
                margin-top: 2px;
                margin-bottom: 2px;
            }

            .badge-cell {
                text-align: right;
            }
        </style>
        <template is="dom-if" if="[[hasReceivedData]]">
            <!-- Use CSS table style as otherwise the dom-repeat is broken in IE 11
            See: https://github.com/Polymer/polymer/issues/1567 -->
            <div class="table">
                <template is="dom-repeat" items="[[data]]">
                    <div class="row">
                        <div class="cell badge-cell">
                            <div class="badge">[[item.value]]</div>
                        </div>
                        <div class="cell badge-title-cell">
                            <div class="badge-title">[[item.title]]</div>
                        </div>
                    </div>
                </template>
            </div>
        </template>
        <template is="dom-if" if="[[_showSpinner]]">
            <i id="spinner" class="fa fas fa-spinner fa-spin"></i>
        </template>
`;
    }

    static get is() {
        return 'badges-list';
    }

    static get properties() {
        return {
            /** Determines whether the loading spinner should be hidden. */
            hideSpinner: {
                type: Boolean,
                value: false
            },
            _showSpinner: {
                type: Boolean,
                computed: '_computeShowSpinner(hideSpinner, hasReceivedData)'
            }
        };
    }

    static get observers() {
        return [];
    }

    _computeShowSpinner(hideSpinner, hasReceivedData) {
        return !hideSpinner && !hasReceivedData;
    }
}

// Register custom element definition using standard platform API
customElements.define(BadgesList.is, BadgesList);
