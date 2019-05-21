import { globalAttrHandlers, Component, IAttributes } from "@alumis/observables-dom";
import * as cssClasses from "./_navbar.scss";

declare module '@alumis/observables-dom' {

    interface IAttributes {

        navbar?: boolean;
        ["navbar-sticky"]?: boolean;
        ["navbar-groups"]?: boolean;
    }
}

globalAttrHandlers.set("navbar", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add((cssClasses as any).navbar);
});

globalAttrHandlers.set("navbar-sticky", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add((cssClasses as any)["navbar-sticky"]);
});

globalAttrHandlers.set("navbar-groups", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add((cssClasses as any)["navbar-groups"]);
});

export class NavbarProgress extends Component<HTMLProgressElement> {

    constructor() {

        super();

        this.node =

        <progress id="navbar-progress" type="indeterminate">
            <div class="devsite-progress--indeterminate">
                <div class="devsite-progress--indeterminate-1"></div>
                <div class="devsite-progress--indeterminate-2"></div>
                <div class="devsite-progress--indeterminate-3"></div>
                <div class="devsite-progress--indeterminate-4"></div>
            </div>
        </progress>;
    }
}

export class HamburgerButton extends Component<HTMLButtonElement> {

    constructor(attrs: IAttributes) {

        super();

        (this.node = document.createElement("button")).classList.add((cssClasses as any).hamburger);

        let hamburgerBox = document.createElement("span");

        hamburgerBox.classList.add((cssClasses as any)["hamburger-box"]);

        let hamburgerInner = document.createElement("span");

        hamburgerInner.classList.add((cssClasses as any)["hamburger-inner"]);
        hamburgerBox.appendChild(hamburgerInner);
        this.node.appendChild(hamburgerBox);
    }
}