import {LitElement, html} from '@polymer/lit-element';

import './time-picker';

class TimePickerDemo extends LitElement {
    async _onInput1Click(e) {
        e.target.value = await this.shadowRoot.querySelector('time-picker:not(.ampm)').open();
    }

    async _onInput2Click(e) {
        e.target.value = await this.shadowRoot.querySelector('time-picker.ampm').open();
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
                <input @click="${e => this._onInput1Click(e)}">
                <input @click="${e => this._onInput2Click(e)}">
                <time-picker .ampm="${false}"></time-picker>
                <time-picker class="ampm" .ampm="${true}"></time-picker>
            </div>
        `;
    }
}

customElements.define('time-picker-demo', TimePickerDemo);