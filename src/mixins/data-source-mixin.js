import { DataControlMixin } from './data-control-mixin.js';

/**
 * Mixin for components that act as a data source. Published data is
 * passed down to descendant Polymer components with `DataReceiverMixin`.
 *
 * @polymer
 * @mixinFunction
 * @appliesMixin DataControlMixin
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const DataSourceMixin = (BaseClass) => class extends DataControlMixin(BaseClass) {
    static get properties() {
        return {
            isDataSource: {
                type: Boolean,
                value: true,
                readOnly: true
            }
        };
    }

    /**
     * Publishes data created by the component.
     * @param  {Object} data The data that was created.
     * @return {void}
     */
    publishData(data) {
        this.passData(data);
    }
};
