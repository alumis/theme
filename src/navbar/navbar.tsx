import { globalAttrHandlers } from "@alumis/observables";

let navbarStyles: NavbarStyles;

export function setStyles(styles: NavbarStyles) {

    navbarStyles = styles;
}

declare module '@alumis/observables' {

    interface Attributes {

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

globalAttrHandlers.set("navbar-brand", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand"]);
});

globalAttrHandlers.set("navbar-brand-text", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand-text"]);
});

export interface NavbarStyles {

    "navbar": string;
    "navbar-sticky": string;
    "navbar-groups": string;
    "navbar-brand": string;
    "navbar-brand-text": string;
}