import { Observable, ComputedObservable, ObservableArray } from "@alumis/observables";
import { Component, IAttributes, createNode, appendDispose, globalAttrHandlers, bindAttribute } from "@alumis/observables-dom";
import { r } from "@alumis/observables-i18n";

export class Alert extends Component<HTMLDivElement> {

    constructor(attrs: IAlertAttributes, children: any[]) {

        super();

        if (attrs) {

            var theme = attrs.theme;
            var dismissable = attrs.dismissable;

            if (this._localStorageKey = attrs.localStorageKey) {

                let value = localStorage.getItem(this._localStorageKey);

                if (value) {

                    try {

                        this._isDismissed = JSON.parse(value);
                    }

                    catch (e) {

                        console.error(e);
                    }
                }
            }

            else if (this._sessionStorageKey = attrs.sessionStorageKey) {

                let value = sessionStorage.getItem(this._sessionStorageKey);

                if (value) {

                    try {

                        this._isDismissed = JSON.parse(value);
                    }

                    catch (e) {

                        console.error(e);
                    }
                }
            }

            this.ondismiss = attrs.ondismiss;

            delete attrs.theme;
            delete attrs.dismissable;
            delete attrs.ondismiss;
        }

        if (!theme && theme !== AlertTheme.None)
            theme = AlertTheme.Warning;

        (this.node = <HTMLDivElement>createNode("div", attrs, children)).setAttribute("role", "alert");

        this.node.classList.add(Alert.styles.alert);

        if (theme instanceof Observable) {

            appendDispose(this.node, theme.subscribeInvoke(this.colorAction).dispose);
            this.themeAsObservable = theme;
        }

        else if (typeof theme === "function") {

            let computedObservable = ComputedObservable.createComputed(theme);

            computedObservable.subscribeInvoke(this.colorAction);
            appendDispose(this.node, computedObservable.dispose);

            this.themeAsObservable = computedObservable;
        }

        else {

            let observable = Observable.create(theme);

            observable.subscribeInvoke(this.colorAction);
            appendDispose(this.node, observable.dispose);

            this.themeAsObservable = observable;
        }

        if (dismissable) {

            /// <i18n key="Close" lang="en">Close</i18n>
            /// <i18n key="Close" lang="no">Lukk</i18n>

            this.node.classList.add(Alert.styles["alert-dismissible"]);

            let closeButtonElement = document.createElement("button");

            closeButtonElement.classList.add(Alert.styles.close);

            bindAttribute(closeButtonElement, "aria-label", r("Close"));

            let timesElement = document.createElement("span");

            timesElement.setAttribute("aria-hidden", "true");
            timesElement.textContent = "\u00D7"; // &times;

            closeButtonElement.appendChild(timesElement);
            this.node.appendChild(closeButtonElement);

            closeButtonElement.addEventListener("click", e => {

                this.isDismissed = true;
            });
        }
    }

    themeAsObservable: Observable<AlertTheme>;
    ondismiss?: () => any;

    private _localStorageKey: string;
    private _sessionStorageKey: string;

    private _isDismissed: boolean;

    get isDismissed() {

        return this._isDismissed;
    }

    set isDismissed(value: boolean) {

        if (value !== !!this._isDismissed) {

            this._isDismissed = value;

            if (this._localStorageKey)
                localStorage.setItem(this._localStorageKey, JSON.stringify(value));

            else if (this._sessionStorageKey)
                sessionStorage.setItem(this._sessionStorageKey, JSON.stringify(value));

            if (value && this.ondismiss)
                this.ondismiss();
        }
    }

    private static getColorClass(color: AlertTheme) {

        switch (color) {

            case AlertTheme.Primary:
                return Alert.styles["alert-primary"];
            case AlertTheme.Secondary:
                return Alert.styles["alert-secondary"];
            case AlertTheme.Success:
                return Alert.styles["alert-success"];
            case AlertTheme.Warning:
                return Alert.styles["alert-warning"];
            case AlertTheme.Danger:
                return Alert.styles["alert-danger"];
            case AlertTheme.Info:
                return Alert.styles["alert-info"];
            case AlertTheme.Light:
                return Alert.styles["alert-light"];
            case AlertTheme.Dark:
                return Alert.styles["alert-dark"];
        }
    }

    colorAction = (newColor: AlertTheme, oldColor: AlertTheme) => {

        let cls = Alert.getColorClass(newColor);

        if (cls)
            this.node.classList.add(cls);

        if (cls = Alert.getColorClass(oldColor))
            this.node.classList.remove(cls);
    };

    static styles: IAlertStyles;
}

export interface IAlertAttributes extends IAttributes {

    theme?: AlertTheme | Observable<AlertTheme> | (() => AlertTheme);
    dismissable?: boolean;
    ondismiss?: () => any;
    localStorageKey?: string;
    sessionStorageKey?: string;
}

export enum AlertTheme {

    None,
    Primary,
    Secondary,
    Success,
    Warning,
    Danger,
    Info,
    Light,
    Dark
}

declare module '@alumis/observables-dom' {

    interface IAttributes {

        ["alert-heading"]?: boolean;
    }
}

globalAttrHandlers.set("alert-heading", (element: HTMLElement) => {

    element.classList.add(Alert.styles["alert-heading"]);
});

export class AlertManager extends Component<HTMLUListElement> {

    constructor(attrs: IAlertManagerAttributes) {

        super();

        if (attrs) {

            this.alerts = attrs.alerts;

            delete attrs.alerts;
        }

        if (!this.alerts)
            this.alerts = new ObservableArray<Alert>();

        (this.node = <HTMLUListElement>createNode(
            "ol",
            attrs,
            this.alerts.map(a => {
                a.ondismiss = () => { this.alerts.remove(a); };
                return createNode("li", null, a);
            })
        ));
    }

    alerts: ObservableArray<Alert>;
}

export interface IAlertManagerAttributes extends IAttributes {

    alerts?: ObservableArray<Alert>;
}

export interface IAlertStyles {

    "alert": string;
    "alert-primary": string;
    "alert-secondary": string;
    "alert-success": string;
    "alert-warning": string;
    "alert-danger": string;
    "alert-info": string;
    "alert-light": string;
    "alert-dark": string;
    "alert-heading": string;
    "alert-dismissible": string;

    "close": string;
}