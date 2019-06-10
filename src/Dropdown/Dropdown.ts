import { Component, createNode, IAttributes } from '@alumis/observables-dom';
import Popper from 'popper.js';
import { CancellationToken } from '@alumis/cancellationtoken';
import { observe } from '@alumis/utils';
import { IButtonAttributes } from '../Button/Button';
import { globalAttrHandlers, generateHTMLElementId } from '@alumis/observables-dom';
import { OperationCancelledError } from '@alumis/cancellationtoken';
import { transitionAsync, easeIn, IDOMAnimator } from '@alumis/transitionasync';

export class Dropdown extends Component<HTMLDivElement> {

    constructor(attrs: IDropdownAttributes, children: any[]) {

        super();

        this.clickEventHandler = this.clickEventHandler.bind(this);
        
        let animator: IDropdownAnimator;
        let placement: DropdownPlacement;        

        if (attrs) {
           
            animator = attrs.animator;
            placement = attrs.placement;
            
            delete attrs.animator;
            delete attrs.placement;
        }

        this.node = createNode('div', attrs, children);
        this.node.addEventListener('click', this.clickEventHandler);
        this.node.classList.add(Dropdown.styles["dropdown-menu"]);

        this.placement = placement || DropdownPlacement.BottomStart;
        this.animator = animator;
    }

    placement: DropdownPlacement;
    animator: IDropdownAnimator;

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

        if (event.target === this.node) {
            event.stopPropagation();
        }
    }

    static styles: IDropdownStyles;
}

export class DropdownItem extends Component<HTMLDivElement> {

    constructor(attrs: IAttributes, children: any[]) {

        super();

        this.node = createNode('div', attrs, children);
        this.node.classList.add(Dropdown.styles["dropdown-item"]);
    }
}

export interface IDropdownItemCssClasses {

    'dropdown-item': string;
}

export class DropdownEaseInFadeAnimator implements IDropdownAnimator {

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

    insertBeforeAsync(parentElement: HTMLElement, newChild: HTMLElement, referenceNode: Node, cancellationToken?: CancellationToken): Promise<any> {
        throw new Error("Method not implemented.");
    }
    removeAsync(element: HTMLElement, cancellationToken?: CancellationToken): Promise<any> {
        throw new Error("Method not implemented.");
    }
    replaceAsync(newChild: HTMLElement, oldChild: HTMLElement, cancellationToken?: CancellationToken, replaced?: () => any): Promise<any> {
        throw new Error("Method not implemented.");
    }
    resumeAsync(element: HTMLElement, cancellationToken?: CancellationToken): Promise<any> {
        throw new Error("Method not implemented.");
    }
}

export interface IDropdownAnimator extends IDOMAnimator {

    showAsync(node: HTMLDivElement, cancellationToken: CancellationToken): Promise<void>;
    hideAsync(node: HTMLDivElement, cancellationToken: CancellationToken): Promise<void>;
}

export function bindDropdown(toggleElement: HTMLElement, dropdownMenu: Dropdown, attrs: IButtonAttributes) {

    delete attrs.dropdown;

    toggleElement.setAttribute('aria-haspopup', 'true');
    toggleElement.setAttribute('aria-expanded', 'false');    
    toggleElement.addEventListener('click', togglerClickEventHandler.bind(dropdownMenu));

    dropdownMenu.node.setAttribute('aria-labelledby', toggleElement.id || (toggleElement.id = generateHTMLElementId()));

    if (!isClickedOutsideEventHandlerAttached) {

        document.addEventListener('click', clickedOutsideEventHandler);
        isClickedOutsideEventHandlerAttached = true;
    }

    dropdownsToCloseOnClickOutsideSet.add(dropdownMenu);    

    dropdownMenu.toggleElement = toggleElement;
}

var isClickedOutsideEventHandlerAttached = false;
var dropdownsToCloseOnClickOutsideSet = new Set<Dropdown>();

function clickedOutsideEventHandler(event: Event) {

    for (let dropdown of dropdownsToCloseOnClickOutsideSet) {

        if (dropdown.isVisible) {

            dropdown.hideAsync();
            dropdown.toggleElement.setAttribute('aria-expanded', 'false');
        }
    }
}

async function togglerClickEventHandler(event: Event) {

    event.stopPropagation();

    const dropdownMenu = <Dropdown>this;
    const toggleElement = dropdownMenu.toggleElement;

    if (dropdownMenu.isVisible) {

        try {
            await dropdownMenu.hideAsync();
        }
        catch(error) {

            if (error instanceof OperationCancelledError) 
                return;

            throw error;
        }
        
        toggleElement.setAttribute('aria-expanded', 'false');

    } else {

        try {
            await dropdownMenu.showAsync();
        }
        catch(error) {

            if (error instanceof OperationCancelledError)
                return;

            throw error; 
        }

        toggleElement.setAttribute('aria-expanded', 'true');
    }
}

globalAttrHandlers.set('dropdown', bindDropdown);

export interface IDropdownAttributes extends IAttributes {

    placement?: DropdownPlacement;
    animator?: IDropdownAnimator;
}

declare module '@alumis/observables-dom' {

    export interface IAttributes {
        dropdown?: Dropdown;
    }
}

export interface IDropdownAttributes extends IAttributes {

    placement?: DropdownPlacement;
    animator?: IDropdownAnimator;
}

export enum DropdownPlacement {

    AutoStart = 'auto-start',
    AutoEnd = 'auto-end',
    Auto = 'auto',    
    TopStart = 'top-start',
    TopEnd = 'top-end',
    Top = 'top',
    RightStart = 'right-start',
    RightEnd = 'right-end',
    Right = 'right',
    BottomStart = 'bottom-start',
    BottomEnd = 'bottom-end',
    Bottom = 'bottom',
    LeftStart = 'left-start',
    LeftEnd = 'left-end',
    Left = 'left',
}

export interface IDropdownStyles {

    'dropdown-menu': string;
    "dropdown-item": string;
}