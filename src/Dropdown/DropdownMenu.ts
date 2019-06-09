import { Component, createNode, IAttributes } from '@alumis/observables-dom';
import Popper from 'popper.js';
import { CancellationToken } from '@alumis/cancellationtoken';
import { observe } from '@alumis/utils';
import { IButtonAttributes } from '../Button/Button';
import { IDropdownMenuAnimator } from './DropdownEaseInFadeAnimator';

export class DropdownMenu extends Component<HTMLDivElement> {

    constructor(attrs: IDropdownMenuAttributes, children: any[], cssClasses: IDropdownMenuCssClasses) {

        super();

        this.clickEventHandler = this.clickEventHandler.bind(this);
        
        let animator: IDropdownMenuAnimator;
        let placement: DropdownMenuPlacement;        

        if (attrs) {
           
            animator = attrs.animator;
            placement = attrs.placement;
            
            delete attrs.animator;
            delete attrs.placement;
        }

        this.node = createNode('div', attrs, children);
        this.node.addEventListener('click', this.clickEventHandler);
        this.node.classList.add(cssClasses["dropdown-menu"]);

        this.placement = placement || DropdownMenuPlacement.bottom;
        this.animator = animator;
    }

    placement: DropdownMenuPlacement;
    animator: IDropdownMenuAnimator;

    get toggleElement() {

        return this._toggleElement;
    }
    set toggleElement(value: HTMLElement) {

        this._toggleElement = value;
        this._popper = new Popper(this._toggleElement, this.node, {
            placement: this.placement
        });
    }

    get isVisible() { return this._isVisible };
    
    private _toggleElement: HTMLElement;
    private _isVisible: boolean;
    private _cancellationToken: CancellationToken;
    private _popper: Popper;

    async showAsync() {

        if (this._isVisible) 
            return;

        this._isVisible = true;

        if (!this.animator) {

            this.toggleElement.appendChild(this.node);
            observe(this.node);

            this._popper.update();

        } else {

            if (this._cancellationToken) 
                this._cancellationToken.cancel();

            this._cancellationToken = new CancellationToken();

            if (!this.node.parentElement) {

                this.node.style.opacity = '0';
                this.toggleElement.parentElement.appendChild(this.node);
                observe(this.node);
            }

            this._popper.update();                

            await this.animator.showAsync(this.node, this._cancellationToken);

            delete this._cancellationToken;
        }
    }

    async hideAsync() {

        if (!this._isVisible)
            return;

        this._isVisible = false;

        if (!this.animator) {

            this.node.remove();

        } else {

            if (!this.node.parentElement)
                return;
            
            if (this._cancellationToken) 
                this._cancellationToken.cancel();

            this._cancellationToken = new CancellationToken();

            await this.animator.hideAsync(this.node, this._cancellationToken);
            this.node.remove();

            delete this._cancellationToken;
        }
    }

    private clickEventHandler(event: Event) {

        event.stopPropagation();
    }
}

export interface IDropdownMenuAttributes extends IAttributes {

    placement?: DropdownMenuPlacement;
    animator?: IDropdownMenuAnimator;
}

declare module '@alumis/observables-dom' {

    export interface IAttributes {

        dropdownmenu?: DropdownMenu;
    }
}

declare module '../Button/Button' {

    export interface IButtonAttributes {

        dropdowncloseonclickoutside?: boolean;
    }
}

export interface IDropdownMenuAttributes extends IAttributes {

    placement?: DropdownMenuPlacement;
    animator?: IDropdownMenuAnimator;
}

export interface IDropdownMenuCssClasses {

    'dropdown-menu': string;
}

export enum DropdownMenuPlacement {

    autoStart = 'auto-start',
    autoEnd = 'auto-end',
    auto = 'auto',    
    topStart = 'top-start',
    topEnd = 'top-end',
    top = 'top',
    rightStart = 'right-start',
    rightEnd = 'right-end',
    right = 'right',
    bottomStart = 'bottom-start',
    bottomEnd = 'bottom-end',
    bottom = 'bottom',
    leftStart = 'left-start',
    leftEnd = 'left-end',
    left = 'left',
}