import { Observable, ComputedObservable } from "@alumis/observables";
import { createNode, Component, IAttributes, generateHTMLElementId, appendDispose, bindClass } from "@alumis/observables-dom";

export class TextInput extends Component<HTMLDivElement> {

    constructor(attrs: ITextInputAttributes) {

        super();

        let type: TextInputType;
        let label: any | Observable<any> | (() => any);
        let value: string | Observable<string> | (() => string);
        let help: string | Observable<string> | (() => string);
        let invalidFeedback: Observable<string | Observable<string> | (() => string)>;
        let autocomplete: boolean;
        let multiline: boolean;

        if (attrs) {

            type = attrs.type;
            label = attrs.label;
            value = attrs.value;
            help = attrs.help;
            invalidFeedback = attrs.invalidfeedback;
            autocomplete = attrs.autocomplete;
            multiline = attrs.multiline;

            delete attrs.type;
            delete attrs.label;
            delete attrs.value;
            delete attrs.help;
            delete attrs.invalidfeedback;
            delete attrs.autocomplete;
            delete attrs.multiline;
        }

        if (multiline)
            this.inputElement = createNode("textarea", attrs) as HTMLTextAreaElement;

        else {

            this.inputElement = createNode("input", attrs) as HTMLInputElement;

            switch (type) {

                case TextInputType.CurrentPassword:
                case TextInputType.NewPassword:

                    this.inputElement.type = "password";
                    break;

                case TextInputType.Email:

                    this.inputElement.type = "email";
                    break;

                case TextInputType.PhoneNumber:

                    this.inputElement.type = "tel";
                    break;

                case TextInputType.Url:

                    this.inputElement.type = "url";
                    break;

                default:

                    this.inputElement.type = "text";
                    break;
            }
        }

        this.inputElement.classList.add(TextInput.styles["form-control"]);

        if (value instanceof ComputedObservable) {

            appendDispose(this.inputElement, (this.valueAsObservable = value).subscribeInvoke(n => { this.inputElement.value = n !== null && n !== undefined ? n : ""; }).dispose);
            this.inputElement.readOnly = true;
        }

        else if (value instanceof Observable) {

            let observableSubscription = (this.valueAsObservable = value).subscribeInvoke(n => { this.inputElement.value = n !== null && n !== undefined ? n : ""; });

            appendDispose(this.inputElement, observableSubscription.dispose);
            this.inputElement.addEventListener("input", () => { this.valueAsObservable.setValueDontNotify(this.inputElement.value, observableSubscription); });
        }

        else if (typeof value === "function") {

            let computedObservable = ComputedObservable.createComputed(value);

            (this.valueAsObservable = computedObservable).subscribeInvoke(n => { this.inputElement.value = n !== null && n !== undefined ? n : ""; });
            appendDispose(this.inputElement, computedObservable.dispose);
            this.inputElement.readOnly = true;
        }

        else {

            let observable = <Observable<string>>Observable.create(value);
            let observableSubscription = (this.valueAsObservable = observable).subscribeInvoke(n => { this.inputElement.value = n !== null && n !== undefined ? n : ""; });

            appendDispose(this.inputElement, observable.dispose);
            this.inputElement.addEventListener("input", () => { this.valueAsObservable.setValueDontNotify(this.inputElement.value, observableSubscription); });
        }

        if (autocomplete !== false && type) {

            this.inputElement.autocomplete = type;

            if (!this.inputElement.id)
                this.inputElement.id = generateHTMLElementId();

            if (!this.inputElement.name)
                this.inputElement.name = type;
        }

        (this.node = document.createElement("div")).classList.add(TextInput.styles["form-group"]);

        if (label) {

            (this.labelElement = <HTMLLabelElement>createNode("label", null, label)).setAttribute("for", this.inputElement.id || (this.inputElement.id = generateHTMLElementId()));
            this.node.appendChild(this.labelElement);
        }

        this.node.appendChild(this.inputElement);

        let ariaDescribedBy: string;

        if (help) {

            (this.helpElement = <HTMLElement>createNode("small", null, help)).id = ariaDescribedBy = generateHTMLElementId();

            this.helpElement.classList.add(TextInput.styles["form-text"], TextInput.styles["text-muted"]);
            this.node.appendChild(this.helpElement);
        }

        if (invalidFeedback)
            this.invalidFeedback = invalidFeedback;

        else appendDispose(this.inputElement, (this.invalidFeedback = Observable.create(null)).dispose);

        bindClass(this.inputElement, TextInput.styles["is-invalid"], () => !!this.invalidFeedback.value);

        this.invalidFeedbackElement = <HTMLDivElement>createNode("div", null, () => {

            let invalidFeedback = this.invalidFeedback.value;
            let result: string;

            if (invalidFeedback instanceof Observable)
                result = invalidFeedback.value;

            else if (typeof invalidFeedback === "function")
                result = invalidFeedback();

            else result = invalidFeedback;

            return result !== null && result !== undefined ? String(result) : "";
        });

        this.invalidFeedbackElement.id = generateHTMLElementId();

        if (ariaDescribedBy)
            ariaDescribedBy += " " + this.invalidFeedbackElement.id;

        else ariaDescribedBy = this.invalidFeedbackElement.id;

        this.invalidFeedbackElement.classList.add(TextInput.styles["invalid-feedback"]);
        this.node.appendChild(this.invalidFeedbackElement);

        if (ariaDescribedBy)
            this.inputElement.setAttribute("aria-describedby", ariaDescribedBy);

        this.node = this.node;
    }

    labelElement: HTMLLabelElement;
    inputElement: HTMLInputElement | HTMLTextAreaElement;
    helpElement: HTMLElement;
    invalidFeedbackElement: HTMLElement;
    valueAsObservable: Observable<string>;
    invalidFeedback: Observable<string | Observable<string> | (() => string)>;

    static styles: ITextInputStyles;
}

export interface ITextInputAttributes extends IAttributes {

    type?: TextInputType;

    label?: any | Observable<any> | (() => any);
    value?: string | Observable<string> | (() => string);
    help?: string | Observable<string> | (() => string);
    placeholder?: string | Observable<string> | (() => string);
    invalidfeedback?: Observable<string | Observable<string> | (() => string)>;

    id?: string;
    name?: string;
    autocomplete?: boolean;

    multiline?: boolean;
    rows?: number;
}

export enum TextInputType {

    Name = "name",
    HonorificPrefix = "honorific-prefix",
    GivenName = "given-name",
    MiddleName = "additional-name",
    Surname = "family-name",
    HonorificSuffix = "honorific-suffix",
    Nickname = "nickname",
    Email = "email",
    Username = "username",
    CurrentPassword = "current-password",
    NewPassword = "new-password",
    JobTitle = "organization-title",
    Organization = "organization",
    StreetAddress = "street-address",
    AddressLine1 = "address-line1",
    AddressLine2 = "address-line2",
    AddressLine3 = "address-line3",
    PhoneNumber = "tel",
    PhoneNumberCountryCode = "tel-country-code",
    PhoneNumberWithoutCountryCode = "tel-national",
    PhoneNumberAreaCode = "tel-area-code",
    PhoneNumberWithoutAreaCode = "tel-local",
    PhoneNumberExtension = "tel-extension",
    Url = "url"
}

export interface ITextInputStyles {

    "form-group": string;
    "form-control": string;
    "form-text": string;
    "text-muted": string;
    "is-invalid": string;
    "invalid-feedback": string;
}