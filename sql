/* =====================================================================
 *  KEYBOARD NAVIGATION FIX — MEGA MENU
 *  Paste into global.js, REPLACING the existing getFocusableElements()
 *  and handleMegaMenuTab() functions, and ADDING sortByTabOrder().
 *
 *  Minimal changes vs. the original code:
 *   - getFocusableElements(): now returns only VISIBLE elements
 *     (collapsed sub-link columns in display:none no longer skew
 *     the first/last calculation). Returns an Array instead of a
 *     NodeList so it can be sorted.
 *   - sortByTabOrder(): NEW helper. Reorders elements into the
 *     browser's real tab order (positive tabindex ascending, then
 *     0/none in DOM order) so firstElement/lastElement match what
 *     the keyboard actually reaches.
 *   - handleMegaMenuTab(): UNCHANGED except its first line, which now
 *     wraps the result in sortByTabOrder().
 * ===================================================================== */

// Function to get all focusable elements within a mega menu
function getFocusableElements(megaMenu) {
    const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(megaMenu.querySelectorAll(selector)).filter((el) =>
        !el.disabled &&
        el.getAttribute('aria-hidden') !== 'true' &&
        (el.offsetParent !== null || el.getClientRects().length > 0)
    );
}

// Sorts elements into the browser's real tab order:
// positive tabindex first (1, 2, 3...), then 0 / none in DOM order.
function sortByTabOrder(elements) {
    return elements
        .map((el, domIndex) => {
            const ti = parseInt(el.getAttribute('tabindex'), 10);
            return { el, domIndex, tabindex: Number.isNaN(ti) ? 0 : ti };
        })
        .sort((a, b) => {
            const aPos = a.tabindex > 0;
            const bPos = b.tabindex > 0;
            if (aPos && bPos) return a.tabindex - b.tabindex || a.domIndex - b.domIndex;
            if (aPos !== bPos) return aPos ? -1 : 1;
            return a.domIndex - b.domIndex;
        })
        .map((entry) => entry.el);
}

// Function to handle tabbing within a mega menu
function handleMegaMenuTab(megaMenu, event) {
    const focusableElements = sortByTabOrder(getFocusableElements(megaMenu));
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        closeMegaMenu(megaMenu);

        // Get the current data-menu-id of the mega menu
        const currentMenuId = megaMenu.getAttribute('data-menu-id');

        // Find the corresponding top-level li
        const currentTopLevelItem = document.querySelector(`.top-level-menu li[data-menu-id="${currentMenuId}"]`);

        // Find the next top-level item by using its sibling
        let nextTopLevelItem = currentTopLevelItem ? currentTopLevelItem.nextElementSibling : null;

        // Loop back to the first item if we're at the end
        if (!nextTopLevelItem) {
            nextTopLevelItem = document.querySelector('.top-level-menu li:first-child');
        }

        // Set focus to the link or button in the next top-level item
        if (nextTopLevelItem) {
            nextTopLevelItem.querySelector('a, button').focus();
        }
    }
}
