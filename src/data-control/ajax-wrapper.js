import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { DataSourceMixin } from '../mixins/data-source-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';

/**
 * ## `ajax-wrapper`
 *
 * This component handles a given url by asynchronously fetching data from it and passing the data to its inner children.
 *
 * @polymer
 * @customElement
 * @appliesMixin DataSourceMixin
 * @demo demo/data_control/ajax_wrapper_demo.html
 */
class AjaxWrapper extends DataSourceMixin(PolymerElement) {
    static get template() {
        return html`
        <style>
            #error-text {
                display: block;
            }
        </style>
        <iron-ajax id="ajaxCaller" url="[[dataUrl]]" handle-as="json" on-response="_handleResponse" on-error="_handleError" debounce-duration="300">
        </iron-ajax>
        <div id="contentWrapper">
            <template is="dom-if" if="[[_showErrorText]]" restamp="">
                <span id="error-text">[[errorText]]</span>
            </template>
            <template is="dom-if" if="[[!_showErrorText]]" restamp="">
                <slot id="content">Nothing</slot>
            </template>
        </div>
`;
    }

    static get is() {
        return 'ajax-wrapper';
    }

    static get properties() {
        return {
            /** URL of data to be fetched */
            dataUrl: String,
            /** The data schema of the requested data. So far, only `jsonapi` is supported. */
            dataSchema: String,
            /** If set, data is refreshed constantly after the specified interval (ms). */
            refreshInterval: Number,
            /** If set, the initial request is delayed (ms). */
            initialDelay: Number,
            /** If set, the initial request is delayed until the element is scrolled into the viewport. */
            lazyLoad: Boolean,
            /** The text that should be shown in case of an erroneous response */
            errorText: {
                type: String,
                value: null
            },
            _responseData: Object,
            _responseError: {
                type: Object,
                value: null
            },
            _showErrorText: {
                type: Boolean,
                computed: '_computeShowErrorText(errorText, _responseError)'
            },
            _intersectionObserver: {
                type: Object,
                value: null
            }
        };
    }

    static get observers() {
        return [];
    }

    /**
     * This is called by Polymer after the component instance is attached to the document.
     * @callback connectedCallback
     * @returns {void}
     */
    connectedCallback() {
        super.connectedCallback();
        let that = this;
        if (this.lazyLoad && 'IntersectionObserver' in window) {
            this._intersectionObserver = new IntersectionObserver(((entries) => {
                // If intersectionRatio is 0, the target is out of view
                // and we do not need to do anything.
                if (entries[0].intersectionRatio <= 0) return;

                that._intersectionObserver.unobserve(entries[0].target);
                that._request();
            }));
            this._intersectionObserver.observe(this.$.contentWrapper);
        } else {
            this._request();
        }
    }

    /**
     * This is called by Polymer after the element is detached from the document.
     * @callback disconnectedCallback
     * @returns {void}
     */
    disconnectedCallback() {
        if (this._intersectionObserver) {
            this._intersectionObserver.disconnect();
        }
        if (this._delayTimeout) {
            clearTimeout(this._delayTimeout);
        }
        if (this._refreshTimeout) {
            clearTimeout(this._refreshTimeout);
        }
        super.disconnectedCallback();
    }

    /**
     * Executes the request.
     * @returns {void}
     */
    _request() {
        let that = this;
        if (this.initialDelay) {
            this._delayTimeout = setTimeout(() => {
                that.$.ajaxCaller.generateRequest();
            }, this.initialDelay);
        } else {
            this.$.ajaxCaller.generateRequest();
        }
    }

    /**
     * Handle the ajax response and pass data down to contained elements.
     * @param {Object} response The receeived response.
     * @returns {void}
     */
    _handleResponse(response) {
        this._responseError = !response.detail.succeeded;
        if (this._responseError) return;

        let body = JSON.parse(JSON.stringify(response.detail.response)); // We need a deep copy here. See benchmark: http://jsben.ch/#/bWfk9
        let data = this._handlePagination(body);
        if (typeof data !== 'undefined') {
            this.publishData(this._parseData(data));
            if (this.refreshInterval) {
                this._scheduleRefresh();
            }
        }
    }

    /**
     * Request and append additional resources, if endpoint is paginated.
     * If all resources were retrieved, they are returned.
     * @param  {Object} body The body of the response.
     * @return {Object}      The entire resources or 'undefined', if additional request is in progress.
     */
    _handlePagination(body) {
        if (this.dataSchema === 'jsonapi' && Array.isArray(body)) {
            this._responseData = this._responseData || [];
            this._responseData = this._responseData.concat(body.data);
            if (body.links.next) {
                this.$.ajaxCaller.url = body.links.next;
                this.$.ajaxCaller.generateRequest();
                return;
            } else {
                let responseData = this._responseData;
                this._responseData = [];
                this.$.ajaxCaller.url = this.dataUrl;
                return responseData;
            }
        }

        return body;
    }

    /**
     * Parse data depending on the specified data schema.
     * @param  {Object} data The raw data that should be parsed
     * @return {Object}      The parsed data.
     */
    _parseData(data) {
        if (this.dataSchema === 'jsonapi' && Array.isArray(data)) {
            return data.map((resource) => resource.attributes);
        }

        return data;
    }

    _handleError() {
        this._responseError = true;
        this.publishData(null);

        if (this.refreshInterval) {
            this._scheduleRefresh();
        }
    }

    _scheduleRefresh() {
        let that = this;
        this._refreshTimeout = setTimeout(() => {
            that.$.ajaxCaller.generateRequest();
        }, this.refreshInterval);
    }

    _computeShowErrorText(errorText, responseError) {
        return errorText !== null && responseError;
    }
}

// Register custom element definition using standard platform API
customElements.define(AjaxWrapper.is, AjaxWrapper);
