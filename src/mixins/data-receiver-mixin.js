import { DataControlMixin } from './data-control-mixin.js';

/**
 * Mixin that accepts data passed by ancestor Polymer components or
 * specified manually via attribute.
 *
 * This mixin needs to be added to all visualization components.
 *
 * @polymer
 * @mixinFunction
 * @extends DataControlMixin
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const DataReceiverMixin = (BaseClass) => class extends DataControlMixin(BaseClass) {
    static get properties() {
        return {
            /** Data that should be processed/visualized. */
            data: Object,
            /** Determines whether the component accepts data from other data-control components. */
            acceptData: {
                type: Boolean,
                value: true
            },
            /** Determines whether data das been received so far. */
            hasReceivedData: {
                type: Boolean,
                value: false
            },
            _receivingData: {
                type: Boolean,
                value: false
            },
            /** Determines whether the component is currently attached */
            isAttached: {
                type: Boolean,
                value: false
            }
        };
    }

    static get observers() {
        return [
            '_dataChanged(data.*)'
        ];
    }

    /**
     * This is called by Polymer after the component instance is attached to the document.
     * @callback connectedCallback
     * @return {void}
     */
    connectedCallback() {
        super.connectedCallback();
        this.isAttached = true;
        this.update();
    }

    /**
     * This is called by Polymer after the component instance is detached from the document.
     * @callback disconnectedCallback
     * @return {void}
     */
    disconnectedCallback() {
        this.isAttached = false;
        super.disconnectedCallback();
    }

    /**
     * Receives data from other data-control components.
     * @param  {Object} data The data that should be received.
     * @return {void}
     */
    receiveData(data) {
        if (!this.acceptData) return;

        this._receivingData = true;
        this.data = data;
        this._receivingData = false;
    }

    /**
     * Forces the component to reprocess data as if it were new.
     * Should be called if any property needed for processing has changed.
     * @return {void}
     */
    update() {
        // Ensure that all properties are initialized and data is provided
        if (!this.isAttached || typeof this.data === 'undefined') return;

        this.hasReceivedData = true;
        let clonedData = JSON.parse(JSON.stringify(this.data));
        this.dataChanged(clonedData);
    }

    /**
     * Observer that is executed when the data property has changed.
     * @return {void}
     */
    _dataChanged() {
        // Ensure that all properties are initialized
        if (!this.isAttached) return;

        // If property was set manually, no longer accept data from data-control components
        if (!this._receivingData) {
            this.acceptData = false;
        }

        this.hasReceivedData = true;
        let clonedData = JSON.parse(JSON.stringify(this.data));
        this.dataChanged(clonedData);
    }

    /**
     * Callback that is executed when new data has been received.
     * Needs to be implemented by concrete component.
     * @abstract
     * @callback dataChanged
     * @param  {Object} data The received data.
     * @return {void}
     */
    // eslint-disable-next-line no-unused-vars
    dataChanged(data) {
    }
};
