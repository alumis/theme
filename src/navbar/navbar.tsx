import { globalAttrHandlers } from "@alumis/observables";

export interface NavbarStyles {

    "navbar": string;
    "navbar-brand": string;
}

let styles: NavbarStyles;

export function setStyles(styles: NavbarStyles) {

    styles = styles;
}

declare module '@alumis/observables' {

    interface Attributes {

        navbar?: boolean;
    }
}

globalAttrHandlers.set("navbar", (element: HTMLElement, attr: boolean) => {

    if (attr)
        element.classList.add(styles.navbar);
});

globalAttrHandlers.set("navbar-brand", (element: HTMLElement) => {

    element.classList.add(styles["navbar-brand"]);
});