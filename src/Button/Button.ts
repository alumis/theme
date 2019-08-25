import { Observable, isObservable, co, o } from "@alumis/observables";
import { Component, Attributes, createNode, appendCleanCallback } from "@alumis/observables/src/JSX";

export class Button extends Component<HTMLButtonElement> {

    constructor(attrs: ButtonAttributes, children: any[]) {

        super();

        if (attrs) {

            var submits = attrs.submits;
            var theme = attrs.theme;
            var size = attrs.size;
            var fullWidth = attrs.fullWidth;

            delete attrs.submits;
            delete attrs.theme;
            delete attrs.size;
            delete attrs.fullWidth;
        }

        if (!theme && theme !== ButtonTheme.None)
            theme = ButtonTheme.Primary;

        (this.node = <HTMLButtonElement>createNode("button", attrs, children)).type = submits ? "submit" : "button";

        this.node.classList.add(Button.styles.btn);

        if (isObservable(theme)) {
            appendCleanCallback(this.node, (<Observable<any>>theme).subscribeInvoke(this.colorAction).unsubscribeAndRecycle);
            this.themeAsObservable = <Observable<any>>theme;
        }

        else if (typeof theme === "function") {
            let computedObservable = co(theme);
            computedObservable.subscribeInvoke(this.colorAction);
            appendCleanCallback(this.node, computedObservable.dispose);
            this.themeAsObservable = computedObservable;
        }

        else {
            let observable = <Observable<any>>o(theme);
            observable.subscribeInvoke(this.colorAction);
            appendCleanCallback(this.node, observable.dispose);
            this.themeAsObservable = observable;
        }

        if (size) {
            if (size === ButtonSize.Small)
                this.node.classList.add(Button.styles["btn-sm"]);
            else if (size === ButtonSize.Large)
                this.node.classList.add(Button.styles["btn-lg"]);
        }

        if (fullWidth)
            this.node.classList.add(Button.styles["btn-block"]);
    }

    themeAsObservable: Observable<ButtonTheme>;
    size: Observable<ButtonSize>;

    private static getColorClass(color: ButtonTheme) {

        switch (color) {

            case ButtonTheme.Primary:
                return Button.styles["btn-primary"];
            case ButtonTheme.PrimaryOutlined:
                return Button.styles["btn-outline-primary"];
            case ButtonTheme.Secondary:
                return Button.styles["btn-secondary"];
            case ButtonTheme.SecondaryOutlined:
                return Button.styles["btn-outline-secondary"];
            case ButtonTheme.Success:
                return Button.styles["btn-success"];
            case ButtonTheme.SuccessOutlined:
                return Button.styles["btn-outline-success"];
            case ButtonTheme.Warning:
                return Button.styles["btn-warning"];
            case ButtonTheme.WarningOutlined:
                return Button.styles["btn-outline-warning"];
            case ButtonTheme.Danger:
                return Button.styles["btn-danger"];
            case ButtonTheme.DangerOutlined:
                return Button.styles["btn-outline-danger"];
            case ButtonTheme.Info:
                return Button.styles["btn-info"];
            case ButtonTheme.InfoOutlined:
                return Button.styles["btn-outline-info"];
        }
    }

    colorAction = (newColor: ButtonTheme, oldColor: ButtonTheme) => {
        let cls = Button.getColorClass(newColor);
        if (cls)
            this.node.classList.add(cls);
        if (cls = Button.getColorClass(oldColor))
            this.node.classList.remove(cls);
    };

    static styles: ButtonStyles;
}

export interface ButtonStyles {

    "btn": string;
    "btn-primary": string;
    "btn-secondary": string;
    "btn-success": string;
    "btn-warning": string;
    "btn-danger": string;
    "btn-info": string;

    "btn-outline-primary": string;
    "btn-outline-secondary": string;
    "btn-outline-success": string;
    "btn-outline-warning": string;
    "btn-outline-danger": string;
    "btn-outline-info": string;

    "btn-block": string;

    "btn-sm": string;
    "btn-lg": string;
}

export interface ButtonAttributes extends Attributes {

    submits?: boolean;
    theme?: ButtonTheme | Observable<ButtonTheme> | (() => ButtonTheme);
    size?: ButtonSize;
    fullWidth?: boolean;
    pressed?: boolean | Observable<boolean> | (() => boolean);
}

export enum ButtonSize {

    Default,
    Small,
    Large
}

export enum ButtonTheme {

    None,
    Primary,
    PrimaryOutlined,
    Secondary,
    SecondaryOutlined,
    Success,
    SuccessOutlined,
    Warning,
    WarningOutlined,
    Danger,
    DangerOutlined,
    Info,
    InfoOutlined
}