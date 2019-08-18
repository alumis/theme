import { globalAttrHandlers } from "@alumis/observables-dom";
import styles from "./_popunder.scss";
import Popper from "popper.js";

class Popunder {

    constructor(private referenceElement: HTMLElement, private unresolvedPopunderElement: HTMLElement | (() => Promise<HTMLElement>)) {


        referenceElement.addEventListener("mouseenter", () => {

            this._hoveringReferenceElement = true;
            setTimeout(() => { this.invalidate(); }, 0);
        });

        referenceElement.addEventListener("mouseleave", () => {

            this._hoveringReferenceElement = false;
            setTimeout(() => { this.invalidate(); }, 0);
        });
    }

    private _hoveringReferenceElement: boolean;
    private _hoveringPopunderElement: boolean;

    private _popper: Popper;

     private _hideHandle: number;
    private _showHandle: number;

    private _cancellationToken;

    private invalidate() {

        if (this._hoveringReferenceElement || this._hoveringPopunderElement) {

            if (this._hideHandle) {

                clearTimeout(this._hideHandle);
                delete this._hideHandle;
            }

            if (!this._showHandle) {

                let promise = this.getPopunderElementAsync(), cancellationToken = this._cancellationToken = {};

                this._showHandle = setTimeout(async () => {

                    delete this._showHandle;

                    try {

                        var popunderElement = await promise;
                    }

                    finally {

                        if (this._cancellationToken === cancellationToken)
                            delete this._cancellationToken;
                        
                        else return;
                    }

                    if (popunderElement.parentNode !== this.referenceElement)
                        this.referenceElement.appendChild(popunderElement);

                    (this._popper || (this._popper = new Popper(this.referenceElement, popunderElement, { placement: "bottom" }))).update();

                }, 200) as any;
            }
        }

        else {

            if (this._showHandle) {

                clearTimeout(this._showHandle);

                delete this._showHandle;
                delete this._cancellationToken;
            }

            if (!this._hideHandle && this._popper) {

                this._hideHandle = setTimeout(() => {

                    delete this._hideHandle;

                    this._popper.popper.remove();
                    this._popper.destroy();

                    delete this._popper;

                }, 200) as any;
            }
        }
    }

    private _getPopunderElementPromise: Promise<HTMLElement>;

    private async getPopunderElementAsync() {

        if (this._getPopunderElementPromise)
            return this._getPopunderElementPromise;

        this._getPopunderElementPromise = this.doGetPopunderElementAsync();

        try {

            return await this._getPopunderElementPromise;
        }

        catch (e) {

            delete this._getPopunderElementPromise;
            throw e;
        }
    }

    private async doGetPopunderElementAsync() {

        if (typeof this.unresolvedPopunderElement === "function") {

            let popunderElement = await this.unresolvedPopunderElement();

            popunderElement.addEventListener("mouseenter", () => {

                this._hoveringPopunderElement = true;
                setTimeout(() => { this.invalidate(); }, 0);
            });

            popunderElement.addEventListener("mouseleave", () => {

                this._hoveringPopunderElement = false;
                setTimeout(() => { this.invalidate(); }, 0);
            });

            return popunderElement;
        }

        else return this.unresolvedPopunderElement as HTMLElement;
    }
}

declare module '@alumis/observables-dom' {

    interface IAttributes {

        popunder?: HTMLElement | (() => Promise<HTMLElement>);
    }
}

globalAttrHandlers.set("popunder", (element: HTMLElement, attr: HTMLElement) => {

    if (attr) {

        new Popunder(element, attr);
    }
});

export interface IPopunderStyles {

}