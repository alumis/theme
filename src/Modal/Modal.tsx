import { Component, Attributes } from "@alumis/observables/src/JSX";
import { Observable } from "@alumis/observables/src/Observable";
import { CancellationToken } from "@alumis/utils/src/CancellationToken";
import { transitionAsync, easeOut } from "@alumis/utils/src/transitionAsync";
import { dontThrowOperationCancelledErrorAsync } from "@alumis/utils/src/dontThrowOperationCancelledErrorAsync";
import { OperationCancelledError } from "@alumis/utils/src/OperationCancelledError";

export abstract class Modal<TValue> extends Component<HTMLDivElement> {
    constructor(attrs: ModalAttributes, children: any[]) {
        super();
        if (attrs) {
            var backdrop = attrs.backdrop;
            var title = attrs.title;
            delete attrs.backdrop;
            delete attrs.title;
        }
        this.node =
            <div tabindex="-1" role="dialog" aria-modal="true" {...attrs}>
                <div class={Modal.styles["modal-dialog"]} role="document">
                    <div class={Modal.styles["modal-content"]}>
                        <div class={Modal.styles["modal-header"]}>
                            <h5 class={Modal.styles["modal-title"]}>{title}</h5>
                            <button type="button" class="close" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class={Modal.styles["modal-body"]}>
                            {children}
                        </div>
                        <div class={Modal.styles["modal-footer"]}>
                            {/* <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary">Save changes</button> */}
                        </div>
                    </div>
                </div>
            </div>;

        this.node.classList.add(Modal.styles["modal-container"]);
        if (backdrop) {
            (this._backdropElement = document.createElement("div")).classList.add(Modal.styles["modal-backdrop"]);

        }
    }

    private _backdropElement: HTMLElement;

    private _promise: Promise<TValue>;
    private _resolve: (value?: TValue | PromiseLike<TValue>) => void;
    private _reject: (reason?: any) => void;

    private initializePromise() {
        if (this._promise)
            return;
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    getResultAsync() {
        this.initializePromise();
        return this._promise;
    }

    protected resolve(value?: TValue) {
        let resolve = this._resolve;
        if (resolve)
            resolve(value);
    }

    protected reject(reason?: any) {
        let reject = this._reject;
        if (reject)
            reject(reason);
    }

    private _transitionCancellationToken: CancellationToken;

    show() {
        let ct = this._transitionCancellationToken;
        if (ct)
            ct.cancel();
        this._transitionCancellationToken = ct = new CancellationToken();
        if (!this.node.parentElement)
            document.body.appendChild(this.node);
        if (this._backdropElement) {
            if (!this._backdropElement.parentElement)
                document.body.appendChild(this._backdropElement);
            let opacity = parseFloat(getComputedStyle(this._backdropElement).opacity);
            let remainingOpacity = 1 - opacity;
            if (remainingOpacity)
                dontThrowOperationCancelledErrorAsync(transitionAsync(150, t => this._backdropElement.style.opacity = String(opacity + remainingOpacity * easeOut(t)), ct));
        }
    }

    hide() {
        let ct = this._transitionCancellationToken;
        if (ct)
            ct.cancel();
        this._transitionCancellationToken = ct = new CancellationToken();
        if (this._backdropElement) {
            if (!this._backdropElement.parentElement)
                document.body.appendChild(this._backdropElement);
            let opacity = parseFloat(getComputedStyle(this._backdropElement).opacity);
            if (opacity) {
                (async () => {
                    try { await transitionAsync(150, t => this._backdropElement.style.opacity = String(opacity - opacity * easeOut(t)), ct); }
                    catch (e) { if (e instanceof OperationCancelledError) return; throw e; }
                    this._backdropElement.remove();
                })();
            }
        }
    }

    protected onBackdropClick() {
        this.hide();
    }

    static styles: ModalStyles;
}

export interface ModalAttributes extends Attributes {

    backdrop?: boolean;
    title?: string | Observable<string> | (() => string);
}

export interface ModalStyles {

    "modal-backdrop": string;
    "modal-container": string;
    "modal-dialog": string;
    "modal-dialog-scrollable": string;
    "modal-content": string;
    "modal-header": string;
    "modal-title": string;
    "modal-body": string;
    "modal-footer": string;
}