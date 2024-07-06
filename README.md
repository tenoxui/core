# `@tenoxui/core`

## About

This repository contain a core component of TenoxUI CSS Framework.

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

### Methods

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
