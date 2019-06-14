import { globalAttrHandlers } from "@alumis/observables-dom";
import styles from "./_grid.scss";
import { DeviceWidth } from "../DeviceWidth";

declare module '@alumis/observables-dom' {

    interface IAttributes {

        container?: ContainerWidth | boolean;
        row?: boolean;
        columns?: number | { breakpoint: DeviceWidth; span: number; }[];
    }
}

globalAttrHandlers.set("container", (element: HTMLElement, attr: ContainerWidth | boolean) => {

    if (attr === ContainerWidth.Responsive || attr === true)
        element.classList.add(styles.container);
    
    else if (attr === ContainerWidth.Fluid)
        element.classList.add(styles["container-fluid"]);
});

export enum ContainerWidth {

    Responsive,
    Fluid
}

globalAttrHandlers.set("row", (element: HTMLElement) => {

    element.classList.add(styles.row);
});

globalAttrHandlers.set("columns", (element: HTMLElement, attr: number | { breakpoint: DeviceWidth; span: number; }[]) => {

    if (typeof attr === "number")
        element.classList.add(styles["col-" + attr]);
    
    else {
        
        for (let r of <{ breakpoint: DeviceWidth; span: number; }[]>attr)
            element.classList.add(styles[r.breakpoint === DeviceWidth.ExtraSmall ? "col-" + r.span : `col-${getDeviceWidthPrefix(r.breakpoint)}-${r.span}`]);
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