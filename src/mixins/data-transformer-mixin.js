import { DataReceiverMixin } from './data-receiver-mixin.js';

/**
 * Mixin that transforms data it receives and passes the result down to
 * descendant Polymer components  with `DataReceiverMixin`.
 *
 * @polymer
 * @mixinFunction
 * @extends DataReceiverMixin
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const DataTransformerMixin = (BaseClass) => class extends DataReceiverMixin(BaseClass) {
    static get properties() {
        return {};
    }

    /**
     * Callback that is executed when new data has been received.
     * Will execute the transformation and pass results to descendants.
     * @param  {Object} data The received data.
     * @return {void}
     */
    dataChanged(data) {
        try {
            data = this.transformData(data);
        } catch (e) {
            console.error(e);
        }
        this.passData(data);
    }

    /**
     * Applies the transformation. Needs to be implemented by the concrete component.
     * @param  {Object} data The source data.
     * @return {Object}      The transformed data.
     */
    transformData(data) {
        return data;
    }
};
