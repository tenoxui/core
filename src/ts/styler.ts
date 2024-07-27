import { makeTenoxUI } from "./tenoxui.esm.js";

document.addEventListener("DOMContentLoaded", () => {
  const utilityClasses = {
    text: "color",
    bg: "backgroundColor",
    p: "padding",
    m: "margin",
    w: "width",
    h: "height",
    d: "display",
    tr: "transition",
    items: "alignItems",
    br: "borderRadius",
    justify: "justifyContent",
  };

  const valueRegistry = {
    red: "#ff0000",
    blue: "#0000ff",
    green: "#00ff00",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
  };

  const selector = `[class*="${Object.keys(utilityClasses).join('-"],[class*="')}"]`;
  const elements = document.querySelectorAll(selector);
  elements.forEach((element) => {
    if (element instanceof HTMLElement) {
      const styler = new makeTenoxUI({
        element: element,
        property: utilityClasses,
        values: valueRegistry,
      });

      // Apply styles for each class on the element
      element.className.split(/\s+/).forEach((className) => {
        try {
          styler.applyStyles(className);
        } catch (error) {
          console.warn(
            `Error applying style '${className}' to element:`,
            element,
            error,
          );
        }
      });
    }
  });
});
