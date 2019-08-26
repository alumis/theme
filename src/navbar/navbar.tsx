import { globalAttrHandlers } from "@alumis/observables";

export interface NavbarStyles {

    "navbar": string;
    "navbar-brand": string;
    "navbar-nav": string;
}

let navbarStyles: NavbarStyles;

export function setStyles(styles: NavbarStyles) {

    navbarStyles = styles;
}

declare module '@alumis/observables' {

    interface Attributes {

        navbar?: boolean;
        ["navbar-brand"]?: boolean;
        ["navbar-sticky"]?: boolean;
        ["navbar-groups"]?: boolean;
        ["navbar-group"]?: boolean;
        ["navbar-link"]?: boolean;
    }
}

globalAttrHandlers.set("navbar", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(navbarStyles.navbar);
});

globalAttrHandlers.set("navbar-brand", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand"]);
});

globalAttrHandlers.set("navbar-sticky", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-sticky"]);
});

globalAttrHandlers.set("navbar-groups", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-groups"]);
});

globalAttrHandlers.set("navbar-group", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-group"]);
});

globalAttrHandlers.set("navbar-link", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-link"]);
});