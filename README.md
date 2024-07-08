# `@tenoxui/core`

## About

This repository contain a core component of TenoxUI CSS Framework.

## Features

- Generated as `inline-style`
- Support all `CSS` properties (including prefixes) and values
- `CSS` variable class names and properties
- Responsive feature
- `:hover` and `:focus` pseudo class
- Easy to customizing both style logics and values
- Work with state in js

## Installation

### Using NPM

```bash
npm i @tenoxui/core --save-dev
```

Add it by importing the `makeTenoxUI` :

```javascript
import { makeTenoxUI } from "@tenoxui/core";
```

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@tenoxui/core"></script>
```

## API

`tenoxui/core` only exporting class `makeTenoxUI`.

### Constructor

`makeTenoxUI` will take 4 parameters defined as an object :

```typescript
class makeTenoxUI {
  private htmlElement: HTMLElement;
  private styleAttribute: Property;
  private valueRegistry: DefinedValue;
  private breakpoints: Breakpoint;

  constructor({ element, property, values, breakpoint }: makeTenoxUIParams) {
    this.htmlElement = element;
    this.styleAttribute = property || {};
    this.valueRegistry = values || {};
    this.breakpoints = breakpoint || [];
  }

  /* ... */
}
```

#### `element`

This parameter is where the style should applied, you can define the selector here and this is where the style will be applied.

Usage :

```javascript
new makeTenoxUI({
  element: document.querySelector(".my-element")
  /* ... */
});
```

#### `property`

Of course we need to define the `CSS` properties to work with. This parameter is responsible for handling the `type` (the CSS property's handler) and `property`. There are several `property` you can define :

1. Regular property

This is the basic example for defining the `type` and `property` :

```javascript
const props = {
  // type: property
  m: "margin",
  p: "padding"
};
```

Usage :

```html
<div class="m-1rem p-8px"></div>
```

Same as :

```css
div {
  margin: 1rem;
  padding: 8px;
}
```

2. Multi propeties in one type

You can use an array of property to add same value into multiple propeties, here's the example :

```javascript
const props = {
  d: "display",
  size: ["width", "height"],
  "flex-parent": ["alignItems", "justify-content"], // you can define with both `camelCase` or `kebab-case`
  transition: ["transition", "-webkit-transition"]
};
```

Usage :

```html
<div class="d-flex flex-parent-center box-100px">hello</div>
```

Same as :

```css
div {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
}
```

3. CSS variable as property
   Maybe you want to change the CSS variable, you can add `--` before the property's name, and it will treated as CSS variable property. Example :

```javascript
const props = {
  color: "--my-color",
  text: "color"
};
```

Usage :

```html
<div class="color-blue text-$my-color"></div>
```

Same as :

```css
div {
  --my-color: blue;
  color: var(--my-color);
}
```

4. Custom value

You can also define custom value. You can set where the value will take place. Example :

```javascript
const props = {
  gradient: {
    property: "background",
    value: "linear-gradient(to right, {value}, blue, {value})"
  },
  blur: {
    property: "filter",
    value: "blur({value})"
  }
};
```

The `{value}` will replaced with the value from your class names.

Usage :

```html
<div class="gradient-red blur-10px"></div>
```

Same as :

```css
div {
  background: linear-gradient(to right, red, blue, red);
  filter: blur(10px);
}
```

#### `values`

You can define your `values` that class names can use. Example :

```javascript
new makeTenoxUI({
  element: "...",
  property: {
    w: "width",
    p: "padding"
  },
  values: {
    full: "100%",
    size: "200px",
    2: "4px"
  }
  /* ... */
});
```

Usage :

```html
<body class="w-full">
  <div class="p-2">Hello</div>
</body>
```

Same as :

```css
body {
  width: 100%;
}
div {
  padding: 4px;
}
```

#### `breakpoint`

This is where you will store the breakpoints. Example :

```javascript
new makeTenoxUI({
  property: {
    bg:"background"
  }
  breakpoint: [
    { name: "max-md", min: 0, max: 678 },
    { name: "md", min: 678 }
  ]
});
```

Usage :

```html
<div class="bg-blue max-md:bg-blue md:bg-red">hello</div>
```

If you want to use the responsive feature, you must use it like the code above, or else it will have some issues, like the styles not handled properly and else. [See more](https://tenoxui.web.app/docs/core/responsive).

### Methods

### Types

```typescript
interface makeTenoxUIParams {
  element: HTMLElement;
  property: Property;
  values?: DefinedValue;
  breakpoint?: Breakpoint;
}
type Property = {
  [key: string]: string | string[] | { property?: string | string[]; value?: string };
};
type DefinedValue = { [key: string]: { [key: string]: string } | string };
type Breakpoint = { name: string; min?: number; max?: number }[];
```

#### `addStyle`

This method will handle all the defined `type`, `property`, `value`, all styling logic, and the styles rules from the class name.

```javascript
public addStyle(type: string, value: string, unit: string): void {}
```

Usage :

```javascript
const styler = new makeTenoxUI();

styler.addStyle("p", "10", "px");
styler.addStyle("m", "1", "rem");
```

### `applyStyles`

This method will get all class names possibilities and matched it using `regexp`.

```javascript
public applyStyles(className: string): void {}
```

> Note: This method will get `only` one class name!

Usage :

```javascript
const styler = new makeTenoxUI();

styler.applyStyles("p-10px");
styler.applyStyles("m-1rem");
```

### `applyMultiStyles`

This method will just apply the styles with `applyStyles` method, but can use multiple classnames at the same time.

```javascript
public applyMultiStyles(styles: string): void {}
```

Usage :

```javascript
const styler = new makeTenoxUI();

styler.applyMultiStyles("p-10px m-1rem");
```

## Usage

`makeTenoxUI` usage example for creating a styles.

### Basic Usage

Add a simple element with class :

```html
<div class="my-element">Hello</div>
```

Then, add the styler instance :

```javascript
// define selector
const selector = document.querySelector(".my-element");
// create tenoxui instance
const styler = new makeTenoxUI({
  element: selector,
  property: { bg: "background", text: "color" }
});

// apply the styles
styler.applyMultiStyles("bg-red text-blue");
```

### Multi Elements

Maybe there will be more than one element with same classes :

```html
<main>
  <div class="my-element">Hello</div>
  <div class="my-element">World</div>
</main>
```

Then, add the styler instance :

```javascript
// define selector
const selectors = document.querySelectorAll(".my-element");

selectors.forEach(selector => {
  // create tenoxui instance
  const styler = new makeTenoxUI({
    element: selector,
    property: { bg: "background", text: "color" }
  });

  // apply the styles
  styler.applyMultiStyles("bg-red text-blue");
});
```

### Auto-Styler (complex usage)

Creating `utility-first` compability or auto styler for your project, it will automatically scan the element's classnames and give the styles. By following this steps, you can create your own css framework 🗿 :

#### Create Elements

First, let's create some html elements with `utility-first` class names :

```html
<main>
  <div class="bg-red p-10px br-6px">Hello</div>
  <div class="bg-blue p-2rem br-1rem">World</div>
</main>
```

#### Adding `types` and `properties`

Let's add some `types` and `properties` you need :

```javascript
const props = {
  bg: "background",
  p: "padding",
  br: "borderRadius"
};
```

#### Creating a Selector

After defining some `types`, you need to create a selector from the defined `types` key's name :

```javascript
const classes = Object.keys(props).map(className => `[class*="${className}-"]`);

const selectors = document.querySelectorAll(classes.join(", "));
```

#### Putting All Together

It's done. So, let's create the styler instance from the components we define earlier :

First, we will iterate the `selectors` :

```javascript
selectors.forEach(selector => {
  /* ... */
});
```

Adding styler instance :

```javascript
const styler = new makeTenoxUI({
  // get each selector
  element: selector,
  // the propeties we define earlier
  property: props
});
```

Finally, get all element's class name and applying each styles from the element's `classList` :

```javascript
selector.classList.forEach(className => {
  styler.applyStyles(className);
});
```

Or, you can be more specific for scanning only the possible classes :

```javascript
selector.classList.forEach(className => {
  const strippedClassName = className.replace(/^[a-z-]*:/, "");
  const prefix = strippedClassName.split("-")[0];
  if (props[prefix]) {
    styler.applyStyles(className);
    console.log(className);
  }
});
```

The final code will looks like this :

```javascript
const props = {
  bg: "background",
  text: "color",
  p: "padding",
  br: "border-radius",
  mt: "marginTop"
};

const classes = Object.keys(props).map(className => `[class*="${className}-"]`);

const selectors = document.querySelectorAll(classes.join(", "));

selectors.forEach(selector => {
  const styler = new makeTenoxUI({
    element: selector,
    property: props
  });

  selector.classList.forEach(className => {
    styler.applyStyles(className);
  });
});
```

And done ✅. Easy right? :)
