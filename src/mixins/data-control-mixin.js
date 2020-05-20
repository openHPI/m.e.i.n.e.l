import { animationFrame } from '@polymer/polymer/lib/utils/async.js';

/**
 * Mixin that passes data down to all descendant Polymer components
 * with `DataReceiverMixin`.
 *
 * Should be used by components that create or process data before visualization.
 *
 * @polymer
 * @mixinFunction
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const DataControlMixin = (BaseClass) => class extends BaseClass {
    /**
     * Fires ready event when the component has been attached to the DOM.
     * @callback connectedCallback
     * @return {void}
     * @fires 'ready'
     */
    connectedCallback() {
        super.connectedCallback();
        // The CustomEvent constructor is not supported on IE, but the webcomponents
        // polyfills include a small polyfill for it so you can use the same syntax everywhere.
        this.dispatchEvent(new CustomEvent('ready', { bubbles: true, composed: true }));
    }

    /**
     * Passes data to accepting descendants.
     * @param  {Object} data The data that should be passed.
     * @return {void}
     */
    passData(data) {
        let that = this;
        animationFrame.run(() => {
            let children = that.children;
            for (let i = 0; i < children.length; i++) {
                that._passDataTo(children[i], data);
            }
        });
    }

    _passDataTo(element, data) {
        // Ensure that descendant elements are initialized
        let that = this;
        animationFrame.run(() => {
            if (element.isDataSource) {
                // Do nothing
            } else if (element.acceptData) {
                // Ensure that each element gets its own copy of the data
                let clonedData = JSON.parse(JSON.stringify(data));
                element.receiveData(clonedData);
            } else if (element.childNodes && element.hasChildNodes()) {
                for (let i = 0; i < element.childNodes.length; i++) {
                    that._passDataTo(element.childNodes[i], data);
                }
            } else {
                that._passDataTo(element, data);
            }
        });
    }
};
