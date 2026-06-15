/* =====================================================================
 *  KEYBOARD NAVIGATION FIX — MEGA MENU
 *  Paste into global.js, REPLACING the existing
 *  getFocusableElements() and handleMegaMenuTab() functions.
 *
 *  What this fixes:
 *   1. We now collect only the elements that are ACTUALLY visible
 *      (sub-link columns set to display:none no longer corrupt the
 *      first / last element calculation).
 *   2. We sort the elements in the browser's REAL tab order
 *      (positive tabindex values ascending, then 0/none in DOM
 *      order) -> "first" and "last" finally match what the user
 *      actually reaches with the keyboard. The fix therefore works
 *      WITH or WITHOUT the positive tabindex values still present
 *      in the HTML.
 *   3. The focus trap fires correctly at the end of the menu:
 *      focus returns to the next tab instead of jumping to the top
 *      of the page.
 * ===================================================================== */

// Returns the focusable AND visible elements within a mega menu.
function getFocusableElements(megaMenu) {
    const selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

    return Array.from(megaMenu.querySelectorAll(selector)).filter((el) => {
        // Exclude disabled or hidden elements.
        if (el.disabled || el.getAttribute('aria-hidden') === 'true') return false;

        // Visibility test: an element set to display:none (a collapsed
        // sub-link column) has neither an offsetParent nor a render rect.
        const isVisible =
            el.offsetParent !== null ||
            el.getClientRects().length > 0;

        return isVisible;
    });
}

// Sorts a list of elements into the browser's real tab order:
// positive tabindex values first (1, 2, 3...), then 0 / none in DOM order.
function sortByTabOrder(elements) {
    return elements
        .map((el, domIndex) => {
            const ti = parseInt(el.getAttribute('tabindex'), 10);
            return { el, domIndex, tabindex: Number.isNaN(ti) ? 0 : ti };
        })
        .sort((a, b) => {
            const aPos = a.tabindex > 0;
            const bPos = b.tabindex > 0;
            if (aPos && bPos) {
                // Two positive tabindex values: ascending value, then DOM order.
                return a.tabindex - b.tabindex || a.domIndex - b.domIndex;
            }
            if (aPos !== bPos) {
                // A positive tabindex always comes before a 0/none.
                return aPos ? -1 : 1;
            }
            // Two 0/none elements: DOM order.
            return a.domIndex - b.domIndex;
        })
        .map((entry) => entry.el);
}

// Handles Tab / Shift+Tab inside an open mega menu.
function handleMegaMenuTab(megaMenu, event) {
    const focusableElements = sortByTabOrder(getFocusableElements(megaMenu));
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const active = document.activeElement;

    // Shift+Tab from the first element -> wrap around to the last one.
    if (event.shiftKey && active === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
    }

    // Tab from the last element -> close the menu and move to the next
    // top-level tab (instead of leaking focus to the top of the page).
    if (!event.shiftKey && active === lastElement) {
        event.preventDefault();
        closeMegaMenu(megaMenu);

        const currentMenuId = megaMenu.getAttribute('data-menu-id');
        const currentTopLevelItem = document.querySelector(
            `.top-level-menu li[data-menu-id="${currentMenuId}"]`
        );

        let nextTopLevelItem = currentTopLevelItem
            ? currentTopLevelItem.nextElementSibling
            : null;

        // Skip any <li> with no link/button (e.g. the search icon).
        while (nextTopLevelItem && !nextTopLevelItem.querySelector('a, button')) {
            nextTopLevelItem = nextTopLevelItem.nextElementSibling;
        }

        // If we've reached the end, loop back to the first tab.
        if (!nextTopLevelItem) {
            nextTopLevelItem = document.querySelector('.top-level-menu li:first-child');
        }

        const target = nextTopLevelItem && nextTopLevelItem.querySelector('a, button');
        if (target) target.focus();
    }
}
