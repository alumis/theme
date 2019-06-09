import { Observable, ComputedObservable } from "@alumis/observables";
import { Component, IAttributes, createNode, appendDispose } from "@alumis/observables-dom";
import * as cssClasses from "./_button.scss";

export class Button extends Component<HTMLButtonElement> {

    constructor(attrs: IButtonAttributes, children: any[]) {

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

        this.node.classList.add((cssClasses as any as IButtonCssClasses).btn);

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

        if (size) {

            if (size === ButtonSize.Small)
                this.node.classList.add((cssClasses as any as IButtonCssClasses)["btn-sm"]);

            else if (size === ButtonSize.Large)
                this.node.classList.add((cssClasses as any as IButtonCssClasses)["btn-lg"]);
        }

        if (fullWidth)
            this.node.classList.add((cssClasses as any as IButtonCssClasses)["btn-block"]);
    }

    themeAsObservable: Observable<ButtonTheme>;
    size: Observable<ButtonSize>;

    private static getColorClass(color: ButtonTheme) {

        switch (color) {

            case ButtonTheme.Primary:
                return (cssClasses as any as IButtonCssClasses)["btn-primary"];
            case ButtonTheme.PrimaryOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-primary"];
            case ButtonTheme.Secondary:
                return (cssClasses as any as IButtonCssClasses)["btn-secondary"];
            case ButtonTheme.SecondaryOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-secondary"];
            case ButtonTheme.Success:
                return (cssClasses as any as IButtonCssClasses)["btn-success"];
            case ButtonTheme.SuccessOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-success"];
            case ButtonTheme.Warning:
                return (cssClasses as any as IButtonCssClasses)["btn-warning"];
            case ButtonTheme.WarningOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-warning"];
            case ButtonTheme.Danger:
                return (cssClasses as any as IButtonCssClasses)["btn-danger"];
            case ButtonTheme.DangerOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-danger"];
            case ButtonTheme.Info:
                return (cssClasses as any as IButtonCssClasses)["btn-info"];
            case ButtonTheme.InfoOutlined:
                return (cssClasses as any as IButtonCssClasses)["btn-outline-info"];
        }
    }

    colorAction = (newColor: ButtonTheme, oldColor: ButtonTheme) => {

        let cls = Button.getColorClass(newColor);

        if (cls)
            this.node.classList.add(cls);

        if (cls = Button.getColorClass(oldColor))
            this.node.classList.remove(cls);
    };
}

export interface IButtonCssClasses {

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

export interface IButtonAttributes extends IAttributes {

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