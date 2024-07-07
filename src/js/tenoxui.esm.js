/*!
 * tenoxui/core v1.0.0-alpha.1
 * Licensed under MIT (https://github.com/tenoxui/css/blob/main/LICENSE)
 */
class makeTenoxUI {
    constructor({ element, property = {}, values = {}, breakpoint = [] }) {
        this.resizeListener = null;
        this.htmlElement = element instanceof HTMLElement ? element : element[0];
        this.styleAttribute = property;
        this.valueRegistry = values;
        this.breakpoints = breakpoint;
    }
    valueHandler(type, value, unit) {
        const registryValue = this.valueRegistry[value];
        let resolvedValue = registryValue || value;
        if (resolvedValue.startsWith("$")) {
            return `var(--${resolvedValue.slice(1)})`;
        }
        else if (resolvedValue.startsWith("[") && resolvedValue.endsWith("]")) {
            const solidValue = resolvedValue.slice(1, -1).replace(/\\_/g, " ");
            return solidValue.startsWith("--") ? `var(${solidValue})` : solidValue;
        }
        const typeRegistry = this.valueRegistry[type];
        if (typeof typeRegistry === "object") {
            resolvedValue = typeRegistry[value] || resolvedValue;
            console.log(typeRegistry);
        }
        return resolvedValue + unit;
    }
    setCssVar(variable, value) {
        this.htmlElement.style.setProperty(variable, value);
    }
    setCustomValue(properties, resolvedValue) {
        const { property, value } = properties;
        let finalValue = resolvedValue;
        if (value) {
            finalValue = value.replace(/{value}/g, resolvedValue);
        }
        if (typeof property === "string") {
            if (property.startsWith("--")) {
                this.setCssVar(property, finalValue);
            }
            else {
                this.htmlElement.style[property] = finalValue;
            }
        }
        else if (Array.isArray(property)) {
            property.forEach(prop => {
                if (typeof prop === "string" && prop.startsWith("--")) {
                    this.setCssVar(prop, finalValue);
                }
                else {
                    this.htmlElement.style[prop] = finalValue;
                }
            });
        }
    }
    setDefaultValue(properties, resolvedValue) {
        const propsArray = Array.isArray(properties) ? properties : [properties];
        propsArray.forEach(property => {
            if (typeof property === "string" && property.startsWith("--")) {
                this.setCssVar(property, resolvedValue);
            }
            else {
                this.htmlElement.style[property] = resolvedValue;
            }
        });
    }
    handleResponsive(breakpointPrefix, type, value, unit) {
        const applyStyle = () => this.addStyle(type, value, unit);
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const matchPoint = this.breakpoints.find(bp => this.matchBreakpoint(bp, breakpointPrefix, windowWidth));
            if (matchPoint) {
                applyStyle();
            }
            else {
                this.htmlElement.style[type] = "";
            }
        };
        if (this.resizeListener) {
            window.removeEventListener("resize", this.resizeListener);
        }
        this.resizeListener = handleResize;
        window.addEventListener("resize", this.resizeListener);
        handleResize();
    }
    matchBreakpoint(bp, prefix, width) {
        if (bp.name !== prefix)
            return false;
        if (bp.min !== undefined && bp.max !== undefined) {
            return width >= bp.min && width <= bp.max;
        }
        if (bp.min !== undefined)
            return width >= bp.min;
        if (bp.max !== undefined)
            return width <= bp.max;
        return false;
    }
    camelToKebab(str) {
        return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    }
    pseudoHandler(type, value, unit, pseudoEvent, revertEvent) {
        const propsName = this.getPropName(type);
        const styleInitValue = this.getInitialValue(propsName);
        const applyStyle = () => this.addStyle(type, value, unit);
        const revertStyle = () => this.revertStyle(propsName, styleInitValue);
        this.htmlElement.addEventListener(pseudoEvent, applyStyle);
        this.htmlElement.addEventListener(revertEvent, revertStyle);
    }
    getPropName(type) {
        var _a;
        if (type.startsWith("[--") && type.endsWith("]")) {
            return type.slice(1, -1);
        }
        const property = ((_a = this.styleAttribute[type]) === null || _a === void 0 ? void 0 : _a.property) || this.styleAttribute[type];
        return Array.isArray(property) ? property.map(this.camelToKebab) : this.camelToKebab(property);
    }
    getInitialValue(propsName) {
        if (Array.isArray(propsName)) {
            return propsName.reduce((acc, propName) => {
                acc[propName] = this.htmlElement.style.getPropertyValue(propName);
                return acc;
            }, {});
        }
        return this.htmlElement.style.getPropertyValue(propsName);
    }
    revertStyle(propsName, styleInitValue) {
        if (Array.isArray(propsName)) {
            propsName.forEach(propName => {
                this.setCssVar(propName, styleInitValue[propName]);
            });
        }
        else {
            this.setCssVar(propsName, styleInitValue);
        }
    }
    parseClassName(className) {
        const match = className.match(/(?:([a-zA-Z0-9-]+):)?(-?[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*|\[--[a-zA-Z0-9_-]+\])-(-?(?:\d+(\.\d+)?)|(?:[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*(?:-[a-zA-Z0-9_]+)*)|(?:#[0-9a-fA-F]+)|(?:\[[^\]]+\])|(?:\$[^\s]+))([a-zA-Z%]*)/);
        if (!match)
            return null;
        const [, prefix, type, value, , unit] = match;
        return [prefix, type, value, unit];
    }
    addStyle(type, value, unit) {
        const properties = this.styleAttribute[type];
        let resolvedValue = this.valueHandler(type, value, unit);
        if (type.startsWith("[--") && type.endsWith("]")) {
            this.setCssVar(type.slice(1, -1), resolvedValue);
        }
        else if (typeof properties === "object" && "property" in properties) {
            this.setCustomValue(properties, resolvedValue);
        }
        else if (properties) {
            this.setDefaultValue(properties, resolvedValue);
        }
    }
    applyStyles(className) {
        const parts = this.parseClassName(className);
        if (!parts)
            return;
        const [prefix, type, value, unit] = parts;
        if (prefix) {
            switch (prefix) {
                case "hover":
                    this.pseudoHandler(type, value, unit, "mouseover", "mouseout");
                    break;
                case "focus":
                    this.pseudoHandler(type, value, unit, "focus", "blur");
                    break;
                default:
                    this.handleResponsive(prefix, type, value, unit);
            }
        }
        else {
            this.addStyle(type, value, unit);
        }
    }
    applyMultiStyles(styles) {
        styles.split(/\s+/).forEach(style => this.applyStyles(style));
    }
    cleanup() {
        if (this.resizeListener) {
            window.removeEventListener("resize", this.resizeListener);
        }
    }
}
export { makeTenoxUI };
//# sourceMappingURL=tenoxui.esm.js.map