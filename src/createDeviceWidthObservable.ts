import { DeviceWidth } from "./DeviceWidth";
import { co } from "@alumis/observables";
import { Component, disposeNode } from "@alumis/observables-dom";
import { currentDeviceWidth } from "./currentDeviceWidth";

export function createDeviceWidthObservable(...configurations: { deviceWidth: DeviceWidth; createComponent: () => Node | Component<Node>; }[]) {

    let createComponent = co<() => Node | Component<Node>>(() => {

        let cdw = currentDeviceWidth.value;

        for (let i = configurations.length; 0 < i;) {

            let configuration = configurations[--i];

            if (configuration.deviceWidth <= cdw)
                return configuration.createComponent;
        }
    });

    let component = co<Node | Component<Node>>(() => {

        let cc = createComponent.value;

        if (cc)
            return cc();
    });

    component.subscribe((_, o) => {

        if (o instanceof Component) {

            disposeNode(o.node);
            delete o.node;
        }

        else if (o instanceof Node)
            disposeNode(o);
    });

    let oldDispose = component.dispose;

    component.dispose = function () {

        oldDispose();
        createComponent.dispose();
    };

    return component;
}