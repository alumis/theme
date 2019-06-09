import { CancellationToken } from '@alumis/cancellationtoken';
import { transitionAsync, easeIn } from '@alumis/transitionasync';

export class DropdownEaseInFadeAnimator implements IDropdownMenuAnimator {
    
    constructor(public duration: number = 150) {}

    async showAsync(node: HTMLElement, cancellationToken: CancellationToken): Promise<void> {
        
        let opacity = parseFloat(getComputedStyle(node).getPropertyValue('opacity'));

        if (opacity === 1)
            return;

        let remaining = 1 - opacity;

        await transitionAsync(this.duration, t => {

            node.style.opacity = opacity + easeIn(t) * remaining + '';

        }, cancellationToken);
    } 
    
    async hideAsync(node: HTMLElement, cancellationToken: CancellationToken): Promise<void> {
        
        let opacity = parseFloat(getComputedStyle(node).getPropertyValue('opacity'));

        if (opacity === 0)
            return;

        let remaining = opacity;

        await transitionAsync(this.duration, t => {

            node.style.opacity = opacity - easeIn(t) * remaining + '';

        }, cancellationToken);
    }
}

export interface IDropdownMenuAnimator {

    showAsync(node: HTMLDivElement, cancellationToken: CancellationToken): Promise<void>;
    hideAsync(node: HTMLDivElement, cancellationToken: CancellationToken): Promise<void>;
}