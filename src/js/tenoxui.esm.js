/*!
 * tenoxui/core v0.11.0
 * Licensed under MIT (https://github.com/tenoxui/css/blob/main/LICENSE)
 */
// tenoxui style handler
class makeTenoxUI {
    // TenoxUI constructor with parameter object
    constructor({ element, property, values, breakpoint }) {
        // basically selector
        this.htmlElement = element;
        // all types and properties
        this.styleAttribute = property || {};
        // value registry
        this.valueRegistry = values || {};
        // breakpoints
        this.breakpoints = breakpoint || [];
    }
    // `addStyle`: Handle the styling and custom value for property
    addStyle(type, value, unit) {
        /* Warning! */
        /* You will see a lot of if statement from here :p */
        // get `type` from allProps
        let properties = this.styleAttribute[type];
        // resolve value: use `defined value` if available or regular `value`
        let resolveValue = this.valueRegistry[value] || value;
        // recursive function to `generate/handle` custom/special values
        const specialValue = (value, unit) => {
            /*
             * [ Feature ] - CSS Variable Value 🎋
             *
             * Check className if the `value` is started with `$`,
             * if so then this is treated as css variable, css value.
             *
             * example :
             * usage: `m-$size`
             * output: `margin: var(--size)`
             */
            if (value.startsWith("$")) {
                // remove the "$" prefix and
                return `var(--${value.slice(1)})`;
            }
            else if (value.startsWith("[") && value.endsWith("]")) {
                /*
                 * [ Feature ] - Custom Values Support 🪐
                 *
                 * Check className if the `value` is wrapped with square bracket `[]`,
                 * if so then this is treated as custom value and ignore default value.
                 *
                 * example :
                 * usage: `m-[calc(10rem\_-\_100px)]`
                 * output: `margin: calc(10rem - 100px)`
                 */
                // Handle custom values wrapped in square brackets
                let solidValue = value.slice(1, -1).replace(/\\_/g, " ");
                // Check if the value is a CSS variable
                if (solidValue.startsWith("--")) {
                    return `var(${solidValue})`;
                }
                return solidValue;
            }
            return value + unit;
        };
        // check if properties has custom value for the type
        if (typeof properties === "object" && properties.value) {
            // replace all `{value}` with resolveValue
            resolveValue = properties.value.replace(/{value}/g, match => specialValue(resolveValue, unit));
        }
        else if (properties && typeof value === "string") {
            // custom values for each `type`
            // if the `DEFINED_VALUE` was an object, the drfined values inside of it will only work for its type
            // get value from `this.valueRegistry` if there matching value
            if (this.valueRegistry[type] && typeof this.valueRegistry[type] === "object") {
                // get the this.valueRegistry's keys name
                let typeValues = this.valueRegistry[type];
                // use value from registry or default value
                resolveValue = typeValues[value] || resolveValue;
            }
            resolveValue = specialValue(resolveValue, unit);
        }
        /*
         * [ Feature ] - Custom CSS variable class name
         *
         * instead of adding value for default css property, set the computed value for css variable.
         *
         * example :
         * usage: `m-[calc(10rem\_-\_100px)]`
         * output: `margin: calc(10rem - 100px)`
         */
        if (type.startsWith("[--") && type.endsWith("]")) {
            // remove bracket and use the the `type` as the variable's name to write the value
            this.htmlElement.style.setProperty(type.slice(1, -1), resolveValue);
        }
        else if (typeof properties === "object" && "property" in properties) {
            /*
             * [ Fearure ] - Custom value handler
             *
             * check if `type` inside `properties` is an object, get the property and value, then replace the {value} with RESOLVED VALUE.
             */
            // get custom property and custom value
            let objectProps = properties;
            // handle css variable with custom value
            if (typeof objectProps.property === "string" && objectProps.property.startsWith("--")) {
                // Set CSS variable property
                this.htmlElement.style.setProperty(objectProps.property, resolveValue);
            }
            // check if the property is an array
            else if (Array.isArray(objectProps.property)) {
                // if property inside objectProps was an array, iterate over each property
                objectProps.property.forEach(property => {
                    // handle CSS variable property
                    if (typeof property === "string" && property.startsWith("--")) {
                        // set `property` into css variable
                        this.htmlElement.style.setProperty(property, resolveValue);
                    }
                    else {
                        // handle array of default CSS property
                        this.htmlElement.style[property] = resolveValue;
                    }
                });
            }
            // default handler for custom value property
            else {
                // apply the custom property defined in properties
                this.htmlElement.style[objectProps.property] = resolveValue;
            }
        }
        // If properties matched the `type` or `property` from `allProps`
        else if (properties) {
            // turnn string into array :)
            if (!Array.isArray(properties)) {
                properties = [properties];
            }
            // iterate properties and handle each type and property
            properties.forEach((property) => {
                /*
                 * [ Feature ] - CSS Variable `type` 📖
                 *
                 * Check if the defined property start with `--`,
                 * like { "my-shadow": "--shadow-color" }.
                 * Then, instead of trating it as css property, it will set property for that css variable. Simple right :D
                 */
                if (typeof property === "string" && property.startsWith("--")) {
                    // set `property` into css variable
                    this.htmlElement.style.setProperty(property, resolveValue);
                }
                else {
                    /*
                     * [ Feature ] - Default value handler 🎏
                     *
                     * All types will have this as default values, no additional value
                     */
                    this.htmlElement.style[property] = resolveValue;
                }
            });
        }
    }
    // [ Feature ] - Responsive Handler
    handleResponsive(breakpointPrefix, type, value, unit) {
        const applyStyle = () => {
            this.addStyle(type, value, unit);
        };
        const handleResponsive = () => {
            const windowWidth = window.innerWidth;
            const matchPoint = this.breakpoints.find(bp => {
                if (bp.name !== breakpointPrefix)
                    return false;
                if (bp.min !== undefined && bp.max !== undefined) {
                    return windowWidth >= bp.min && windowWidth <= bp.max;
                }
                if (bp.min !== undefined) {
                    return windowWidth >= bp.min;
                }
                if (bp.max !== undefined) {
                    return windowWidth <= bp.max;
                }
                return false;
            });
            if (matchPoint) {
                applyStyle();
            }
            else {
                this.htmlElement.style[type] = "";
            }
        };
        handleResponsive();
        window.addEventListener("resize", handleResponsive);
    }
    // Utility function to convert camelCase to kebab-case
    camelToKebab(str) {
        return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    }
    // [ Feature ] - Pseudo clasd handler
    pseudoHandler(type, value, unit, pseudoEvent, revertEvent) {
        // get CSS property names
        let propsName = this.camelToKebab((this.styleAttribute[type].property || type));
        // store initial value for the type
        let styleInitValue = this.htmlElement.style.getPropertyValue(this.camelToKebab(this.styleAttribute[type]));
        // apply the styles when the event started
        this.htmlElement.addEventListener(pseudoEvent, () => {
            this.addStyle(type, value, unit);
        });
        // reverting style when done, apply initial style value of current element
        this.htmlElement.addEventListener(revertEvent, () => {
            // if element was css variable
            if (propsName.startsWith("--")) {
                this.htmlElement.style.setProperty(propsName, styleInitValue);
            }
            // default css property
            else {
                this.htmlElement.style.setProperty(this.camelToKebab(this.styleAttribute[type]), styleInitValue);
            }
        });
    }
    // [ Feature ] - Main classname handler for tenoxui
    applyStyles(className) {
        // the regexp for matches all possible classname, with help of an AI 🤖
        const match = className.match(/(?:([a-zA-Z0-9-]+):)?(-?[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*|\[--[a-zA-Z0-9_-]+\])-(-?(?:\d+(\.\d+)?)|(?:[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*(?:-[a-zA-Z0-9_]+)*)|(?:#[0-9a-fA-F]+)|(?:\[[^\]]+\])|(?:\$[^\s]+))([a-zA-Z%]*)/);
        // matching all classnames
        if (match) {
            // prefix = prefix for type. Example: md:, sm:, hover:, etc.
            const prefix = match[1];
            // type = property class. Example: p-, m-, flex-, fx-, filter-, etc.
            const type = match[2];
            // value = possible value. Example: 10, red, blue, etc.
            const value = match[3];
            // unit = possible unit. Example: px, rem, em, s, %, etc.
            const unitOrValue = match[5];
            // handle prefix of the element classname
            if (prefix) {
                switch (prefix) {
                    // hover prefix
                    case "hover":
                        this.pseudoHandler(type, value, unitOrValue, "mouseover", "mouseout");
                        break;
                    // focus prefix
                    case "focus":
                        this.pseudoHandler(type, value, unitOrValue, "focus", "blur");
                        break;
                    // responsive prefix
                    default:
                        this.handleResponsive(prefix, type, value, unitOrValue);
                }
            }
            else {
                // default style handler
                this.addStyle(type, value, unitOrValue);
            }
        }
    }
    // multi classname function
    applyMultiStyles(styles) {
        // splitting the classname and apply the styles using `applyStyles` method
        styles.split(/\s+/).forEach((style) => {
            this.applyStyles(style);
        });
    }
}
export { makeTenoxUI };
//# sourceMappingURL=tenoxui.esm.js.map