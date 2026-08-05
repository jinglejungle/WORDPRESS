window.addEventListener('load', () => {
    // Select all accordion headings (toggle buttons)
    const accordionModuleToggles = document.querySelectorAll('.rebrand-accordion-module > h3');
  
    /**
     * Toggle the accordion open or closed.
     *
     * This function toggles the "isOpen" class on the accordion module and
     * updates a CSS custom property (--maxHeight) to animate the opening/closing.
     * It also updates the aria-expanded attribute for accessibility.
     *
     * @param {Event} e - The event object.
     */
    const toggleAccordion = (e) => {
      // The current heading that was activated (clicked or triggered by keyboard)
      const currentToggle = e.currentTarget;
      // Find the accordion module container for this toggle
      const parent = currentToggle.closest('.rebrand-accordion-module');
      // The accordion content is assumed to be the immediate sibling after the heading
      const accordionContent = currentToggle.nextElementSibling;
  
      if (parent.classList.contains('isOpen')) {
        // Collapse the accordion
        parent.classList.remove('isOpen');
        accordionContent.setAttribute('style', '--maxHeight: 0px;');
        currentToggle.setAttribute('aria-expanded', 'false');
      } else {
        // Expand the accordion
        parent.classList.add('isOpen');
        // Use the scrollHeight to calculate the maximum height for a smooth transition
        accordionContent.setAttribute('style', `--maxHeight: calc(var(--wp--preset--spacing--40) + ${accordionContent.scrollHeight}px +60px);`);
        currentToggle.setAttribute('aria-expanded', 'true');
      }
    };
  
    accordionModuleToggles.forEach(toggle => {
      // Ensure the accordion heading is keyboard-focusable
      toggle.setAttribute('tabindex', '0');
      // Set the role to "button" so assistive technology recognizes it as interactive
      toggle.setAttribute('role', 'button');
      // Initialize aria-expanded (collapsed by default)
      toggle.setAttribute('aria-expanded', 'false');
  
      // Toggle on click
      toggle.addEventListener('click', toggleAccordion);
  
      // Add keydown event listener for keyboard interactions
      toggle.addEventListener('keydown', function(e) {
        // Activate the accordion with Enter or Space
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccordion(e);
        }
        // Navigate between accordion headings with ArrowDown and ArrowUp
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          // Convert NodeList to an Array for easier index manipulation
          const headings = Array.from(accordionModuleToggles);
          // Find the current toggle's index in the list
          const currentIndex = headings.indexOf(this);
          let nextIndex;
          if (e.key === 'ArrowDown') {
            // Move to the next heading; wrap to the first if we're at the end
            nextIndex = (currentIndex + 1) % headings.length;
          } else {
            // ArrowUp: move to the previous heading; wrap to the last if we're at the beginning
            nextIndex = (currentIndex - 1 + headings.length) % headings.length;
          }
          headings[nextIndex].focus();
        }
      });
    });
  });
  