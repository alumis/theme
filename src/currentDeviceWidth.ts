import { Observable } from "@alumis/observables";
import { DeviceWidth } from "./DeviceWidth";

function getDeviceWidth(width: number) {

    if (1200 <= width)
        return DeviceWidth.ExtraLarge;

    if (992 <= width)
        return DeviceWidth.Large;

    if (768 <= width)
        return DeviceWidth.Medium;

    if (576 <= width)
        return DeviceWidth.Small;

    if (width < 576)
        return DeviceWidth.ExtraSmall;
}

export var currentDeviceWidth = Observable.create(getDeviceWidth(innerWidth));

addEventListener("resize", () => currentDeviceWidth.value = getDeviceWidth(innerWidth));