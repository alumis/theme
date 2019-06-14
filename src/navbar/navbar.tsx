import { globalAttrHandlers, Component, IAttributes } from "@alumis/observables-dom";

let navbarStyles: INavbarStyles;

export function setStyles(styles: INavbarStyles) {

    navbarStyles = styles;
}

declare module '@alumis/observables-dom' {

    interface IAttributes {

        navbar?: boolean;
        ["navbar-sticky"]?: boolean;
        ["navbar-groups"]?: boolean;
    }
}

globalAttrHandlers.set("navbar", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(navbarStyles.navbar);
});

globalAttrHandlers.set("navbar-sticky", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(navbarStyles["navbar-sticky"]);
});

globalAttrHandlers.set("navbar-groups", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(navbarStyles["navbar-groups"]);
});

export class HamburgerButton extends Component<HTMLButtonElement> {

    constructor(attrs: IAttributes) {

        super();

        (this.node = document.createElement("button")).classList.add(navbarStyles.hamburger);

        let hamburgerBox = document.createElement("span");

        hamburgerBox.classList.add(navbarStyles["hamburger-box"]);

        let hamburgerInner = document.createElement("span");

        hamburgerInner.classList.add(navbarStyles["hamburger-inner"]);
        hamburgerBox.appendChild(hamburgerInner);
        this.node.appendChild(hamburgerBox);
    }
}

globalAttrHandlers.set("navbar-brand", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand"]);
});

globalAttrHandlers.set("navbar-brand-text", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand-text"]);
});

export interface INavbarStyles {

    "navbar": string;
    "navbar-sticky": string;
    "navbar-groups": string;
    "navbar-brand": string;
    "navbar-brand-text": string;
    "hamburger": string;
    "hamburger-box": string;
    "hamburger-inner": string;
}