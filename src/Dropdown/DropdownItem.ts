import { Component, IAttributes, createNode } from '@alumis/observables-dom';

export class DropdownItem<TElement extends HTMLElement> extends Component<TElement> {

    constructor(tagName: string, attrs: IAttributes, children: any[], cssClasses: IAlumisDropdownItemCssClasses) {

        super();

        this.node = createNode(tagName, attrs, children);
        this.node.classList.add(cssClasses["dropdown-item"]);
    }
}

export interface IAlumisDropdownItemCssClasses {

    'dropdown-item': string;
}