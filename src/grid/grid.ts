import { globalAttrHandlers } from "@alumis/observables";
import { DeviceWidth } from "../DeviceWidth";

export interface GridStyles {

    "container": string;
    "container-fluid": string;
    "row";
}

let gridStyles: GridStyles;

export function setStyles(styles: GridStyles) {

    gridStyles = styles;
}

declare module '@alumis/observables' {

    interface Attributes {

        container?: ContainerWidth | boolean;
        row?: boolean;
        columns?: number | { breakpoint: DeviceWidth; span: number; }[];
    }
}

globalAttrHandlers.set("container", (element: HTMLElement, attr: ContainerWidth | boolean) => {

    if (attr === ContainerWidth.Responsive || attr === true)
        element.classList.add(gridStyles.container);
    
    else if (attr === ContainerWidth.Fluid)
        element.classList.add(gridStyles["container-fluid"]);
});

export enum ContainerWidth {

    Responsive,
    Fluid
}

globalAttrHandlers.set("row", (element: HTMLElement) => {

    element.classList.add(gridStyles.row);
});

globalAttrHandlers.set("columns", (element: HTMLElement, attr: number | { breakpoint: DeviceWidth; span: number; }[]) => {

    if (typeof attr === "number")
        element.classList.add(gridStyles["col-" + attr]);
    
    else {
        
        for (let r of <{ breakpoint: DeviceWidth; span: number; }[]>attr)
            element.classList.add(gridStyles[r.breakpoint === DeviceWidth.ExtraSmall ? "col-" + r.span : `col-${getDeviceWidthPrefix(r.breakpoint)}-${r.span}`]);
    }
});

function getDeviceWidthPrefix(deviceWidth: DeviceWidth) {

    switch (deviceWidth) {

        case DeviceWidth.Small:
            return "sm";
        
        case DeviceWidth.Medium:
            return "md";

        case DeviceWidth.Large:
            return "lg";

        case DeviceWidth.ExtraLarge:
            return "xl";
    }
}