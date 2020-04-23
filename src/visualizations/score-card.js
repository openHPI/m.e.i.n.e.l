import './counter-basic.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { DataReceiverMixin } from '../mixins/data-receiver-mixin.js';
import { FontAwesomeMixin } from '../mixins/font-awesome-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';


/**
 * ## `score-card`
 *
 * This is a basic component for a score card displaying a single numeric value.
 *
 * ### Styling
 *
 * `<score-card>` provides the following custom properties and mixins for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--score-card-icon-font-size` | Font size of the icon | `50px`
 * `--score-card-height` | Height of the control | `100px`
 * `--score-card-icon-background-border-radius` | Border radius of the control | `2px 0px 0px 2px`
 * `--score-card-icon-background-color` | Background color of the control | `transparent`
 * `--score-card-icon-link-color` | Text color of the link | `blue`
 * `--score-card-icon-link-color-hover` | Hover text color of the link | `transparent`
 * `--score-card-link-text-decoration` | Text decoration of the link | `underline`
 *
 * @polymer
 * @customElement
 * @appliesMixin FontAwesomeMixin
 * @appliesMixin DataReceiverMixin
 * @demo demo/visualizations/score_card_demo.html
 */
class ScoreCard extends FontAwesomeMixin(DataReceiverMixin(PolymerElement)) {
    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }

            #container {
                display: flex;
                width: 100%;
            }

            #icon-container {
                flex-grow: 0;
                flex-shrink: 0;
                min-width: 50px;
                min-height: 50px;
                font-size: var(--score-card-icon-font-size, 50px);
                height: var(--score-card-height, 100px);
                flex-basis: var(--score-card-height, 100px);
                border-radius: var(--score-card-icon-background-border-radius, 2px 0px 0px 2px);
                background-color: var(--score-card-icon-background-color, transparent);
            }
            
            #background-icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--score-card-icon-background-border-radius, 2px 0px 0px 2px);
            }

            #content-container {
                position: relative;
                width: 100%;
                padding: 5px 10px;
                overflow: hidden;
            }

            #name {
                display: block;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 3px;
            }

            #value {
                display: block;
                font-weight: bold;
                font-size: 18px;
            }

            #link-container {
                position: absolute;
                bottom: 5px;
                font-size: 14px;
                word-wrap: break-word;
            }
                
            #link-container > a {
                color: var(--score-card-link-color, blue);
                text-decoration: var(--score-card-link-text-decoration, underline);
                
            }
            
            #link-container > a:hover, #link-container > a:focus, #link-container > a:active {
                color: var(--score-card-link-color-hover, darkblue);
            }

            #link-icon {
                margin-right: 3px;
            }
            
            .text-icon {
              font-size: 1.5em;
              font-weight: 700;
              vertical-align: sub;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            
            .icon-average:before {
              content: "\\00D8";
            }
            
            .icon-one:before {
              content: "1";
            }
        </style>

        <div id="container">
            <div id="icon-container" style\$="[[_outerStyle]];">
                <div id="background-icon-container" style\$="background-color: [[primarycolor]]; height: [[height]]; flex-basis: [[height]];">
                    <span id="icon" class\$="[[iconClasses]]" style\$="font-size: [[iconSize]]"></span>
                </div>
            </div>
            <div id="content-container">
                <span id="name">[[name]]</span>
                <counter-basic id="value" data="[[data]]" prefix="[[prefix]]" suffix="[[suffix]]" decimals="[[decimals]]" default-value="[[defaultValue]]" value-formatter="[[valueFormatter]]" animation-duration="[[animationDuration]]" hide-spinner="[[hideSpinner]]"></counter-basic>
                <div id="link-container">
                    <template is="dom-if" if="[[link]]">
                        <a href="[[link]]">
                            <i id="link-icon" class="fas fa-arrow-circle-right"></i>[[linkText]]
                        </a>
                    </template>
                </div>
            </div>
        </div>`;
    }

    static get is() {
        return 'score-card';
    }

    static get properties() {
        return {
            /** Internal: Applied style string if height is set */
            _outerStyle: {
                type: String,
                value: ''
            },
            /** Height of the control */
            height: {
                type: String,
                value: 'inherit',
                observer: 'heightChanged'
            },
            /** Font size of the icon (px). */
            iconSize: {
                type: String,
                value: 'inherit',
                observer: 'iconSizeChanged'
            },
            /** Primary color of the control. */
            primarycolor: {
                type: String,
                value: 'transparent'
            },
            /** Classes of the icon that should be displayed. */
            iconClasses: {
                type: String,
                observer: 'iconChanged'
            },
            /** Name of the metric that is displayed. */
            name: String,
            /** Optional text before the number. */
            prefix: String,
            /** Optional text after the number. */
            suffix: String,
            /** Number of decimals to show. */
            decimals: {
                type: Number,
                value: 0
            },
            /** The default value that is shown if data is `null`. */
            defaultValue: {
                type: String,
                value: 'n/a'
            },
            /** Animation duration in seconds. */
            animationDuration: {
                type: Number,
                value: 1
            },
            /** Determines whether the loading spinner should be hidden. */
            hideSpinner: {
                type: Boolean,
                value: false
            },
            /** A link to a page showing related information (optional). */
            link: String,
            /** The text of the link (optional). */
            linkText: String,
            /** Custom formatter function for displaying the value */
            valueFormatter: Object
        };
    }

    static get observers() {
        return [];
    }

    /**
     *  Observe changes to the `iconClasses` and add FontAwesome family prefix "fa-" for proper icon replacement
     *  @return  {void}
     */
    iconChanged() {
        if (!this.iconClasses.includes('xikolo'))
            return;

        let requestedClasses = this.iconClasses.split(' ');
        requestedClasses = requestedClasses.map(iconClass =>
            iconClass.startsWith('icon-') ? `${this.FontAwesomeConfig().familyPrefix}-${iconClass}` : iconClass);
        this.iconClasses = requestedClasses.join(' ');
    }

    heightChanged() {
        if (this.height.includes('px') || this.height.includes('inherit'))
            return;

        this.height = `${this.height}px`;
        this._outerStyle += `height: ${this.height}; flex-basis: ${this.height};`;
    }

    iconSizeChanged() {
        if (this.iconSize.includes('px') || this.iconSize.includes('inherit'))
            return;

        this.iconSize = `${this.iconSize}px`;
        this._outerStyle += `font-size: ${this.iconSize};`;
    }
}

// Register custom element definition using standard platform API
customElements.define(ScoreCard.is, ScoreCard);
