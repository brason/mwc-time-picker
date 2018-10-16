import {LitElement, html, svg} from '@polymer/lit-element';
import {directive} from 'lit-html';
import {classMap} from 'lit-html/directives/classMap';

import '@material/mwc-button';

function _pad(n) {
    return ('0'.repeat(2) + `${n}`).slice(`${n}`.length);
}

class TimePicker extends LitElement {
    static get properties() {
        return {
            _open: {type: Boolean},
            _hour: {type: Number},
            _minute: {type: Number},
            _step: {type: Number},
            ampm: {type: Boolean}
        }
    }

    constructor() {
        super();
        this._open = false;
        this._hour = 0;
        this._minute = 0;
        this._step = 0;
        this.ampm = false;
    }

    firstUpdated() {
        this._svg = this.shadowRoot.querySelector('svg');
        this._svgPt = this._svg.createSVGPoint();
    }

    open() {
        return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
            this._open = true;
        });
    }

    _onCancel() {
        this._open = false;
        this._reject();
    }

    _onConfirm() {
        this._open = false;
        this._resolve(`${_pad(this._hour)}:${_pad(this._minute)}`);
    }

    _updateClock(e) {
        this._svgPt.x = e.clientX;
        this._svgPt.y = e.clientY;

        let cursorPt =  this._svgPt.matrixTransform(this._svg.getScreenCTM().inverse());

        const halfWidth = 100 / 2;

        // Make relative to center
        cursorPt.x = cursorPt.x - halfWidth;
        cursorPt.y = cursorPt.y - halfWidth;

        let closestNumber,
            minDist = Infinity,
            numberPos = this._step === 0 ? hourPos : minutePos;

        for (let i = 0; i < (this._step === 0 ? (this.ampm ? 12 : 24) : 60); i++) {
            const dist = Math.hypot(numberPos[i].x - cursorPt.x, numberPos[i].y - cursorPt.y);

            if (dist < minDist) {
                minDist = dist;
                closestNumber = i;
            }
        }

        if (this._step === 0) {
            this._hour = closestNumber
        } else {
            this._minute = closestNumber;
        }
    }

    _onClockMouseDown(e) {
        this._mouseDown = true;
        this._updateClock(e);
    }

    _onClockMouseMove(e) {
        if (this._mouseDown) {
            this._updateClock(e);
        }
    }

    _onClockMouseUp(e) {
        this._mouseDown = false;
        if (this._step === 0) {
            this._step = 1;
        }
    }

    _setStep(step) {
        this._step = step;
    }

    render() {
        const {_open, _hour, _minute, _step, ampm} = this;

        const numberPos = _step === 0 ? hourPos : minutePos;
        const selectedNum = _step === 0 ? _hour : _minute;

        // language=HTML
        return html`
            <style>
                #time-picker {
                    display: none;
                    user-select: none;
                    --time-picker-color: #3f51b5;
                }
                
                #time-picker.open {
                    display: block;
                }
                
                .backdrop {
                    position: fixed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.59);
                }

                .overlay {
                    background: white;
                    width: 300px;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .digital-clock {
                    height: 100px;
                    background: var(--time-picker-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 55px;
                    color: white;
                }
                
                .digital-clock > .number {
                    cursor: pointer;
                }
                
                .analog-clock-container {
                    position: relative;
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .analog-clock {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }
                
                .clock-face {
                    fill: #ededed;
                }
                
                .hand {
                    stroke: var(--time-picker-color);
                    stroke-width: 0.7;
                }
                
                .hand-marker {
                    fill: var(--time-picker-color);
                }
                
                .clock-number {
                    font-size: 6px;
                }
                
                .actions {
                    display: flex;
                    padding: 4px;
                    align-items: center;
                }
            </style>
            <div id='time-picker' class='${classMap({open: _open})}'>
                <div class='backdrop'>
                    <div class='overlay'>
                        <div class='digital-clock'>
                            <div class="number" @click="${() => this._setStep(0)}">${_pad(_hour + 1)}</div>
                            <div>:</div>
                            <div class="number" @click="${() => this._setStep(1)}">${_pad(_minute)}</div>
                        </div>
                        <div class='analog-clock-container'>
                            <svg 
                                class='analog-clock' 
                                viewBox='0 0 100 100' 
                                @mousedown="${e => this._onClockMouseDown(e)}"
                                @mousemove="${e => this._onClockMouseMove(e)}"
                                @mouseup="${e => this._onClockMouseUp(e)}"
                            >   
                                <g transform='translate(50,50)'>
                                    <circle class='clock-face' r='44'/>
                                    <line 
                                        class='hand'
                                        x1='0'
                                        y1='0'
                                        x2='${numberPos[selectedNum].x}'
                                        y2='${numberPos[selectedNum].y}'
                                    />
                                    <circle class='hand-marker' r='1'/>
                                    <circle 
                                        class='hand-marker' 
                                        r='5' 
                                        transform='translate(${numberPos[selectedNum].x}, ${numberPos[selectedNum].y})'
                                    />
                                    ${directive(part => {
                                        let numbers = [];
                                        
                                        for (let i = 0 ; i < (_step === 0 ? (ampm ? 12 : 24) : 12); i++) {
                                            let j = _step === 0 ? i : i * 5;
                                            numbers.push(svg`
                                                <text
                                                    class='clock-number'
                                                    alignment-baseline='middle' 
                                                    text-anchor='middle'
                                                    transform='translate(${numberPos[j].x}, ${numberPos[j].y})'>
                                                    ${_step === 0 ? (i + 1) : j}
                                                </text>`
                                            );
                                        }
                                        
                                        part.setValue(numbers);
                                    })}
                                </g>
                            </svg>
                        </div>
                        <div class='actions'>
                            <div style='flex: 1;'></div>
                            <mwc-button @click="${() => this._onCancel()}">Cancel</mwc-button>
                            <mwc-button @click="${() => this._onConfirm()}">Ok</mwc-button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('time-picker', TimePicker);

const minutePos = (() => {
    const pos = {};
    const segment = 2 * Math.PI / 60;
    const offset = Math.PI / 2;

    for (let i = 0; i < 60; i++) {
        pos[i] = {x: 36 * Math.cos(segment * i - offset), y: 36 * Math.sin(segment * i - offset)};
    }
    return pos;
})();

const hourPos = (() => {
    const pos = {};
    const segment = 2 * Math.PI / 12;
    const offset = Math.PI / 3;

    for (let i = 0; i < 12; i++) {
        pos[i] = {x: 36 * Math.cos(segment * i - offset), y: 36 * Math.sin(segment * i - offset)};
    }

    for (let i = 0; i < 12; i++) {
        pos[i + 12] = {x: 24 * Math.cos(segment * i - offset), y: 24 * Math.sin(segment * i - offset)};
    }

    return pos
})();