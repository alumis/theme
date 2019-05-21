import { globalAttrHandlers, Component, IAttributes } from "@alumis/observables-dom";
import * as cssClasses from "@alumis/theme/src/navbar/_navbar.scss";

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

export class HamburgerButton extends Component<HTMLButtonElement> {

    constructor(attrs: IAttributes) {

        super();


        (this.node = document.createElement("button")).classList.add((cssClasses as any).hamburger, (cssClasses as any)["hamburger--squeeze"]);

        let hamburgerBox = document.createElement("span");

        hamburgerBox.classList.add((cssClasses as any)["hamburger-box"]);

        let hamburgerInner = document.createElement("span");

        hamburgerInner.classList.add((cssClasses as any)["hamburger-inner"]);
        hamburgerBox.appendChild(hamburgerInner);
        this.node.appendChild(hamburgerBox);
    }
}
