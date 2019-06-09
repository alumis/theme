import { globalAttrHandlers, generateHTMLElementId } from '@alumis/observables-dom';
import { DropdownMenu } from './DropdownMenu';
import { IButtonAttributes } from '../Button/Button';
import { OperationCancelledError, CancellationTokenNone } from '@alumis/cancellationtoken';

export function bindDropdownMenu(toggleElement: HTMLElement, dropdownMenu: DropdownMenu, attrs: IButtonAttributes) {

    let dropdownCloseOnClickOutside: boolean;

    if (attrs) {
        
        dropdownCloseOnClickOutside = attrs.dropdowncloseonclickoutside;
        delete attrs.dropdowncloseonclickoutside;
    }

    toggleElement.setAttribute('aria-haspopup', 'true');
    toggleElement.setAttribute('aria-expanded', 'false');    
    toggleElement.addEventListener('click', togglerClickEventHandler.bind(dropdownMenu));

    dropdownMenu.node.setAttribute('aria-labelledby', toggleElement.id || (toggleElement.id = generateHTMLElementId()));

    if (dropdownCloseOnClickOutside) {

        if (!isClickedOutsideEventHandlerAttached) {

            document.body.addEventListener('click', clickedOutsideEventHandler);

            isClickedOutsideEventHandlerAttached = true;
        }

        dropdownsToCloseOnClickOutsideSet.add(dropdownMenu);
    }

    dropdownMenu.toggleElement = toggleElement;
}

var isClickedOutsideEventHandlerAttached = false;
var dropdownsToCloseOnClickOutsideSet = new Set<DropdownMenu>();

function clickedOutsideEventHandler(event: Event) {

    for (let dropdown of dropdownsToCloseOnClickOutsideSet) {

        dropdown.hideAsync();
        dropdown.toggleElement.setAttribute('aria-expanded', 'false');
    }
}

async function togglerClickEventHandler(event: Event) {

    event.stopPropagation();

    const dropdownMenu = <DropdownMenu>this;
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

globalAttrHandlers.set('dropdownmenu', bindDropdownMenu);