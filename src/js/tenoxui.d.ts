/*!
 * tenoxui/core v0.11.0
 * Licensed under MIT (https://github.com/tenoxui/css/blob/main/LICENSE)
 */
interface makeTenoxUIParams {
    element: HTMLElement;
    property?: Property;
    values?: DefinedValue;
    breakpoint?: Breakpoint;
}
type Property = {
    [key: string]: string | string[] | {
        property?: string | string[];
        value?: string;
    };
};
type Breakpoint = {
    name: string;
    min?: number;
    max?: number;
}[];
type StylesRegistry = Record<string, string[]>;
type DefinedValue = {
    [key: string]: {
        [key: string]: string;
    } | string;
};
declare class makeTenoxUI {
    private htmlElement;
    private styleAttribute;
    private valueRegistry;
    private breakpoints;
    constructor({ element, property, values, breakpoint }: makeTenoxUIParams);
    addStyle(type: string, value: string, unit: string): void;
    private handleResponsive;
    private camelToKebab;
    private pseudoHandler;
    applyStyles(className: string): void;
    applyMultiStyles(styles: string): void;
}
