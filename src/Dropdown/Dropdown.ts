import { Component, createNode, Attributes, globalAttrHandlers, generateHTMLElementId } from '@alumis/observables/src/JSX';
import Popper from 'popper.js';
import { CancellationToken } from '@alumis/utils/src/CancellationToken';
import { KeyCode } from "@alumis/utils/src/KeyCode";
import { ButtonAttributes } from '../Button/Button';
import { OperationCancelledError } from '@alumis/utils/src/OperationCancelledError';

export class Dropdown extends Component<HTMLDivElement> {

    constructor(attrs: IDropdownAttributes, children: any[]) {

        super();

        this.documentKeydownEventHandler = this.documentKeydownEventHandler.bind(this);

        let placement: DropdownPlacement;

        if (attrs) {

            placement = attrs.placement;

            delete attrs.placement;
        }


        this.node = createNode('div', attrs, createNode("ul", null, children));
        this.unorderedListElement.addEventListener('click', e => e.stopPropagation());
        this.node.classList.add(Dropdown.styles["dropdown-menu"]);

        this.placement = placement || DropdownPlacement.BottomStart;
    }

    placement: DropdownPlacement;

    get unorderedListElement() {

        return this.node.querySelector('ul');
    }

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

    private _cancellationToken: CancellationToken;
    private _isVisible: boolean;
    private _popper: Popper;
    private _toggleElement: HTMLElement;

    async showAsync() {

        if (this._isVisible)
            return;

        this._isVisible = true;
        this.toggleElement.appendChild(this.node);
        this._popper.update();

        document.addEventListener('keydown', this.documentKeydownEventHandler);
    }

    async hideAsync() {

        if (!this._isVisible)
            return;

        this._isVisible = false;
        this.node.remove();
        document.removeEventListener('keydown', this.documentKeydownEventHandler);
    }

    private documentKeydownEventHandler(event: KeyboardEvent) {

        const target = event.target as HTMLElement;
        const keyCode = event.keyCode;

        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {

            if (keyCode == KeyCode.Space || (keyCode !== KeyCode.Escape && keyCode !== KeyCode.ArowUp && keyCode !== KeyCode.ArrowDown)) {
                return;
            }
        }

        if (keyCode === KeyCode.Escape || keyCode === KeyCode.Space) {

            if (keyCode === KeyCode.Escape) {
                this.toggleElement.focus();
            }

            this.hideAsync();
        }

        const items = Array.from(this.node.querySelectorAll(`.${Dropdown.styles['dropdown-item']}`)) as HTMLElement[];

        if (!items.length)
            return;

        let index = items.indexOf(target);

        if (keyCode === KeyCode.ArowUp && index > 0)
            index--;

        if (keyCode === KeyCode.ArrowDown && index < items.length - 1)
            index++;

        if (index < 0)
            index = 0;

        items[index].focus();
    }

    static styles: DropdownStyles;
}

export class DropdownItem extends Component<HTMLDivElement> {

    constructor(attrs: Attributes, children: any[]) {

        super();

        this.node = createNode('li', attrs, children);
        this.node.setAttribute('tabIndex', '-1');
        this.node.classList.add(Dropdown.styles["dropdown-item"]);
    }
}

export interface IDropdownItemCssClasses {

    'dropdown-item': string;
}

export function bindDropdown(toggleElement: HTMLElement, dropdownMenu: Dropdown, attrs: ButtonAttributes) {

    delete attrs.dropdown;

    toggleElement.setAttribute('aria-haspopup', 'true');
    toggleElement.setAttribute('aria-expanded', 'false');
    toggleElement.addEventListener('click', togglerClickEventHandler.bind(dropdownMenu));

    dropdownMenu.node.setAttribute('aria-labelledby', toggleElement.id || (toggleElement.id = generateHTMLElementId()));

    if (!isClickedOutsideEventHandlerAttached) {

        document.addEventListener('click', hideDropdowns);
        isClickedOutsideEventHandlerAttached = true;
    }

    dropdowns.add(dropdownMenu);

    dropdownMenu.toggleElement = toggleElement;
}

var isClickedOutsideEventHandlerAttached = false;
var dropdowns = new Set<Dropdown>();

function hideDropdowns() {

    for (let dropdown of dropdowns) {

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

    (async () => {

        await delayAsync(0);

        if (!dropdownMenu.isVisible) {

            try {
                await dropdownMenu.showAsync();
            }
            catch (error) {

                if (error instanceof OperationCancelledError)
                    return;

                throw error;
            }

            toggleElement.setAttribute('aria-expanded', 'true');
        }
    })();

    hideDropdowns();
}

globalAttrHandlers.set('dropdown', bindDropdown);

export interface IDropdownAttributes extends Attributes {

    placement?: DropdownPlacement;
    animator?: IDropdownAnimator;
}

declare module '@alumis/observables-dom' {

    export interface Attributes {
        dropdown?: Dropdown;
    }
}

export interface IDropdownAttributes extends Attributes {

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

export interface DropdownStyles {

    'dropdown-menu': string;
    "dropdown-item": string;
}