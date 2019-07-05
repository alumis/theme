import { globalAttrHandlers } from "@alumis/observables-dom";
import styles from "./_popunder.scss";
import Popper from "popper.js";

class Popunder {

    constructor(public referenceElement: HTMLElement, public popunderElement: HTMLElement) {

        referenceElement.addEventListener("hover", () => {

            this._hoveringReferenceElement = true;
            setTimeout(() => { this.invalidate(); }, 0);
        });

        referenceElement.addEventListener("blur", () => {

            this._hoveringReferenceElement = false;
            setTimeout(() => { this.invalidate(); }, 0);
        });

        popunderElement.addEventListener("hover", () => {

            this._hoveringPopunderElement = true;
            setTimeout(() => { this.invalidate(); }, 0);
        });

        popunderElement.addEventListener("blur", () => {

            this._hoveringPopunderElement = false;
            setTimeout(() => { this.invalidate(); }, 0);
        });
    }

    private _hoveringReferenceElement: boolean;
    private _hoveringPopunderElement: boolean;

    private _popper: Popper;

    get popper() {

        return this._popper || (this._popper = new Popper(this.referenceElement, this.popunderElement, { placement: "bottom" }));
    }

    private _hideHandle: number;
    private _showHandle: number;

    private invalidate() {

        if (this._hoveringReferenceElement || this._hoveringPopunderElement) {

            if (this._hideHandle) {

                clearTimeout(this._hideHandle);
                delete this._hideHandle;
            }

            if (!this._showHandle) {

                this._showHandle = setTimeout(() => {

                    delete this._showHandle;

                    if (this.popunderElement.parentNode !== this.referenceElement)
                        this.referenceElement.appendChild(this.popunderElement);

                    this.popper.update();

                }, 200) as any;
            }
        }

        else {

            if (this._showHandle) {

                clearTimeout(this._showHandle);
                delete this._showHandle;
            }

            if (!this._hideHandle && this._popper) {

                this._hideHandle = setTimeout(() => {

                    delete this._hideHandle;
                    this.popunderElement.remove();
                    this._popper.destroy();
                    delete this._popper;

                }, 200) as any;
            }
        }
    }
}

declare module '@alumis/observables-dom' {

    interface IAttributes {

        popunder?: HTMLElement;
    }
}

globalAttrHandlers.set("popunder", (element: HTMLElement, attr: HTMLElement) => {

    if (attr) {

        let popper = new Popper(element, attr, { placement: "bottom" });
    }
});

export interface IPopunderStyles {

}