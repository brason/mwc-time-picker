import {LitElement, html} from '@polymer/lit-element';

import './time-picker';

class TimePickerDemo extends LitElement {
    async _onInputClick(e) {
        e.target.value = await this.shadowRoot.querySelector('time-picker').open();
    }

    render() {
        // language=HTML
        return html`
            <style>
                :host {
                    display: block;
                }
                
                div {
                    display: flex;
                    padding: 16px;
                }
                
                input {
                    margin-right: 40px;
                }
            </style>
            <div>
                <input @click="${e => this._onInputClick(e)}">
                <input @click="${e => this._onInputClick(e)}">
                <input @click="${e => this._onInputClick(e)}">
                <time-picker .ampm="${false}"></time-picker>
            </div>
        `;
    }
}

customElements.define('time-picker-demo', TimePickerDemo);