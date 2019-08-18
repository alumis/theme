import { Component, createNode, bindAttribute, Attributes } from "@alumis/observables/src/JSX";
import { isObservable, appendCleanCallback, co, o, Observable } from "@alumis/observables";
import { r } from "@alumis/observables-i18n";
import { CancellationToken } from "@alumis/utils/src/CancellationToken";
import qrcode from "qrcode";
import { OperationCancelledError } from "@alumis/utils/src/OperationCancelledError";

export class QRCode extends Component<HTMLDivElement> {

    constructor(attrs: IQRCodeAttributes) {
        super();
        if (attrs) {
            var value = attrs.value;
            this._size = attrs.size;
            this._errorCorrectionLevel = attrs.errorCorrectionLevel;
            delete attrs.value;
            delete attrs.size;
            delete attrs.errorCorrectionLevel;
        }
        (this.node = <HTMLDivElement>createNode("div", attrs, this._svgElementObservable)).setAttribute("role", "img");
        bindAttribute(this.node, "aria-label", r("qrCode"));

        /// <i18n key="qrCode" lang="en">QR Code</i18n>
        /// <i18n key="qrCode" lang="no">QR-kode</i18n>

        if (isObservable(value)) {
            appendCleanCallback(this.node, (<Observable<string>>value).subscribeInvoke(this.valueAction).unsubscribeAndRecycle);
            this.valueAsObservable = <Observable<string>>value;
        }
        else if (typeof value === "function") {
            let computedObservable = co(value);
            computedObservable.subscribeInvoke(this.valueAction);
            appendCleanCallback(this.node, computedObservable.dispose);
            this.valueAsObservable = computedObservable;
        }
        else {
            let observable = o(value);
            observable.subscribeInvoke(this.valueAction);
            appendCleanCallback(this.node, observable.dispose);
            this.valueAsObservable = <Observable<string>>observable;
        }
        appendCleanCallback(this.node, () => {
            if (this._cancellationToken)
                this._cancellationToken.cancel();
            this._svgElementObservable.dispose();
        });
    }

    valueAsObservable: Observable<string>;

    private _size: number;
    private _errorCorrectionLevel: QRCodeErrorCorrectionLevel;

    private _svgElementObservable = o(undefined as SVGElement);
    private _cancellationToken: CancellationToken;

    valueAction = (newValue) => {
        if (this._cancellationToken) {
            this._cancellationToken.cancel();
            delete this._cancellationToken;
        }
        this._cancellationToken = new CancellationToken();
        (async () => {
            try { this._svgElementObservable.value = await createQrCodeImageElementAsync(newValue, this._size, this._errorCorrectionLevel, this._cancellationToken); }
            catch (e) {
                if (!(e instanceof OperationCancelledError))
                    throw e;
            }
            delete this._cancellationToken;
        })();
    };
}

function createQrCodeImageElementAsync(value: string, size: number, errorCorrectionLevel: QRCodeErrorCorrectionLevel, cancellationToken: CancellationToken): Promise<SVGElement> {
    return new Promise((resolve, reject) => {
        if (value) {
            qrcode.toString(value, { errorCorrectionLevel: errorCorrectionLevel, width: size, margin: 0, type: "svg" }, (error, str) => {
                if (cancellationToken.isCancellationRequested)
                    reject(new OperationCancelledError());
                else if (error)
                    reject(error);
                else {
                    let div = document.createElement("div");
                    div.innerHTML = str;
                    resolve(<SVGElement>div.firstElementChild);
                }
            });
        }
        else resolve(null);
    });
}

export interface IQRCodeAttributes extends Attributes {
    value?: string | Observable<string> | (() => string);
    size?: number;
    errorCorrectionLevel?: QRCodeErrorCorrectionLevel;
}

export enum QRCodeErrorCorrectionLevel {
    Low = "low",
    Medium = "medium",
    Quartile = "quartile",
    High = "high"
}