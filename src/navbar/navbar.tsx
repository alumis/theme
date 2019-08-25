import { globalAttrHandlers } from "@alumis/observables";

export interface NavbarStyles {

    "navbar": string;
    "navbar-brand": string;
}

let navbarStyles: NavbarStyles;

export function setStyles(styles: NavbarStyles) {

    navbarStyles = styles;
}

declare module '@alumis/observables' {

    interface Attributes {

        navbar?: boolean;
    }
}

globalAttrHandlers.set("navbar", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(navbarStyles.navbar);
});

globalAttrHandlers.set("navbar-brand", (element: HTMLElement) => {

    element.classList.add(navbarStyles["navbar-brand"]);
});