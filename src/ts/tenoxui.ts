/*!
 * tenoxui/core v1.0.0-alpha.1
 * Licensed under MIT (https://github.com/tenoxui/css/blob/main/LICENSE)
 */

interface MakeTenoxUIParams {
  element: HTMLElement | NodeListOf<HTMLElement>;
  property?: Property;
  values?: DefinedValue;
  breakpoint?: Breakpoint[];
}
type Property = {
  [key: string]: string | string[] | { property?: string | string[]; value?: string };
};
type Breakpoint = { name: string; min?: number; max?: number };
type StylesRegistry = Record<string, string[]>;
type DefinedValue = { [key: string]: { [key: string]: string } | string };
class makeTenoxUI {
  private readonly htmlElement: HTMLElement;
  private readonly styleAttribute: Property;
  private readonly valueRegistry: DefinedValue;
  private readonly breakpoints: Breakpoint[];
  constructor({ element, property = {}, values = {}, breakpoint = [] }: MakeTenoxUIParams) {
    this.htmlElement = element instanceof HTMLElement ? element : element[0];
    this.styleAttribute = property;
    this.valueRegistry = values;
    this.breakpoints = breakpoint;
  }
  private valueHandler(type: string, value: string, unit: string): string {
    const registryValue = this.valueRegistry[value] as string;
    let resolvedValue = registryValue || value;
    if (resolvedValue.startsWith("$")) {
      return `var(--${resolvedValue.slice(1)})`;
    } else if (resolvedValue.startsWith("[") && resolvedValue.endsWith("]")) {
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
  private setCssVar(variable: string, value: string): void {
    this.htmlElement.style.setProperty(variable, value);
  }
  private setCustomValue(properties: { property: string | string[]; value?: string }, resolvedValue: string): void {
    const { property, value } = properties;
    let finalValue = resolvedValue;
    if (value) {
      finalValue = value.replace(/{value}/g, resolvedValue);
    }
    if (typeof property === "string") {
      if (property.startsWith("--")) {
        this.setCssVar(property, finalValue);
      } else {
        (this.htmlElement.style as any)[property] = finalValue;
      }
    } else if (Array.isArray(property)) {
      property.forEach(prop => {
        if (typeof prop === "string" && prop.startsWith("--")) {
          this.setCssVar(prop, finalValue);
        } else {
          (this.htmlElement.style as any)[prop] = finalValue;
        }
      });
    }
  }
  private setDefaultValue(properties: string | string[], resolvedValue: string): void {
    const propsArray = Array.isArray(properties) ? properties : [properties];
    propsArray.forEach(property => {
      if (typeof property === "string" && property.startsWith("--")) {
        this.setCssVar(property, resolvedValue);
      } else {
        (this.htmlElement.style as any)[property] = resolvedValue;
      }
    });
  }
  private resizeListener: (() => void) | null = null;
  private handleResponsive(breakpointPrefix: string, type: string, value: string, unit: string): void {
    const applyStyle = () => this.addStyle(type, value, unit);
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const matchPoint = this.breakpoints.find(bp => this.matchBreakpoint(bp, breakpointPrefix, windowWidth));
      if (matchPoint) {
        applyStyle();
      } else {
        (this.htmlElement.style as any)[type] = "";
      }
    };
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
    this.resizeListener = handleResize;
    window.addEventListener("resize", this.resizeListener);
    handleResize();
  }
  private matchBreakpoint(bp: Breakpoint, prefix: string, width: number): boolean {
    if (bp.name !== prefix) return false;
    if (bp.min !== undefined && bp.max !== undefined) {
      return width >= bp.min && width <= bp.max;
    }
    if (bp.min !== undefined) return width >= bp.min;
    if (bp.max !== undefined) return width <= bp.max;
    return false;
  }
  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  }
  private pseudoHandler(type: string, value: string, unit: string, pseudoEvent: string, revertEvent: string): void {
    const propsName = this.getPropName(type);
    const styleInitValue = this.getInitialValue(propsName);
    const applyStyle = () => this.addStyle(type, value, unit);
    const revertStyle = () => this.revertStyle(propsName, styleInitValue);
    this.htmlElement.addEventListener(pseudoEvent, applyStyle);
    this.htmlElement.addEventListener(revertEvent, revertStyle);
  }
  private getPropName(type: string): string | string[] {
    if (type.startsWith("[--") && type.endsWith("]")) {
      return type.slice(1, -1);
    }
    const property = (this.styleAttribute[type] as any)?.property || this.styleAttribute[type];
    return Array.isArray(property) ? property.map(this.camelToKebab) : this.camelToKebab(property as string);
  }
  private getInitialValue(propsName: string | string[]): { [key: string]: string } | string {
    if (Array.isArray(propsName)) {
      return propsName.reduce(
        (acc, propName) => {
          acc[propName] = this.htmlElement.style.getPropertyValue(propName);
          return acc;
        },
        {} as { [key: string]: string }
      );
    }
    return this.htmlElement.style.getPropertyValue(propsName);
  }
  private revertStyle(propsName: string | string[], styleInitValue: { [key: string]: string } | string): void {
    if (Array.isArray(propsName)) {
      propsName.forEach(propName => {
        this.setCssVar(propName, (styleInitValue as { [key: string]: string })[propName]);
      });
    } else {
      this.setCssVar(propsName, styleInitValue as string);
    }
  }
  private parseClassName(className: string): [string | undefined, string, string, string] | null {
    const match = className.match(
      /(?:([a-zA-Z0-9-]+):)?(-?[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*|\[--[a-zA-Z0-9_-]+\])-(-?(?:\d+(\.\d+)?)|(?:[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*(?:-[a-zA-Z0-9_]+)*)|(?:#[0-9a-fA-F]+)|(?:\[[^\]]+\])|(?:\$[^\s]+))([a-zA-Z%]*)/
    );
    if (!match) return null;
    const [, prefix, type, value, , unit] = match;
    return [prefix, type, value, unit];
  }
  public addStyle(type: string, value: string, unit: string): void {
    const properties = this.styleAttribute[type];
    let resolvedValue = this.valueHandler(type, value, unit);
    if (type.startsWith("[--") && type.endsWith("]")) {
      this.setCssVar(type.slice(1, -1), resolvedValue);
    } else if (typeof properties === "object" && "property" in properties) {
      this.setCustomValue(properties as { property: string | string[]; value?: string }, resolvedValue);
    } else if (properties) {
      this.setDefaultValue(properties as string | string[], resolvedValue);
    }
  }
  public applyStyles(className: string): void {
    const parts = this.parseClassName(className);
    if (!parts) return;
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
    } else {
      this.addStyle(type, value, unit);
    }
  }
  public applyMultiStyles(styles: string): void {
    styles.split(/\s+/).forEach(style => this.applyStyles(style));
  }
  public cleanup(): void {
    if (this.resizeListener) {
      window.removeEventListener("resize", this.resizeListener);
    }
  }
}
