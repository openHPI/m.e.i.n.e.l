import { dom, library, config } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import * as xikoloIcons from '../fonts/xikolo-icomoon.js';

/**
 * Mixin that acts as base class for Font Awesome-based components.
 *
 * Based on the [Font Awesome documentation](https://fontawesome.com/how-to-use/on-the-web/advanced/svg-javascript-core) and [fontawesome-icon](https://github.com/soldag/fontawesome-icon)
 *
 * @polymer
 * @mixinFunction
 * @param  {PolymerElement | Function} BaseClass The base class to extend.
 * @return {Function}                            The extended base class.
 */
export const FontAwesomeMixin = (BaseClass) => class extends BaseClass {

    /**
     * Prepares FontAwesome injection
     * @constructor
     * @return  {void}
     */
    constructor() {
        super();

        library.add(xikoloIcons);
        library.add(fas, far, fab);
        this.styleInserted = false;
    }

    /**
     * Add listener for FontAwesome icons and add CSS to Shadow DOM
     * @callback connectedCallback
     * @return  {void}
     */
    connectedCallback() {
        super.connectedCallback();

        dom.watch({
            autoReplaceSvgRoot: this.shadowRoot,
            observeMutationsRoot: this.root
        });

        if (!this.styleInserted) {
            let faStyles = document.createElement('style');
            faStyles.innerHTML = dom.css();
            this.shadowRoot.appendChild(faStyles);
            this.styleInserted = true;
        }
    }

    /**
     * Return the FontAwesome config used for this fragment
     * @return {Config} FontAwesome config.
     */
    FontAwesomeConfig() {
        return config;
    }
};
