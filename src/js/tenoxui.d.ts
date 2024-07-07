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
    [key: string]: string | string[] | {
        property?: string | string[];
        value?: string;
    };
};
type Breakpoint = {
    name: string;
    min?: number;
    max?: number;
};
type StylesRegistry = Record<string, string[]>;
type DefinedValue = {
    [key: string]: {
        [key: string]: string;
    } | string;
};
declare class makeTenoxUI {
    private readonly htmlElement;
    private readonly styleAttribute;
    private readonly valueRegistry;
    private readonly breakpoints;
    constructor({ element, property, values, breakpoint }: MakeTenoxUIParams);
    private valueHandler;
    private setCssVar;
    private setCustomValue;
    private setDefaultValue;
    private resizeListener;
    private handleResponsive;
    private matchBreakpoint;
    private camelToKebab;
    private pseudoHandler;
    private getPropName;
    private getInitialValue;
    private revertStyle;
    private parseClassName;
    addStyle(type: string, value: string, unit: string): void;
    applyStyles(className: string): void;
    applyMultiStyles(styles: string): void;
    cleanup(): void;
}
