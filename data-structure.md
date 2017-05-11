# the resume data structure


## AST structure

* basic node interface
```ts
  interface Node {
    type: string;
  }
```

* Node type
```ts
  type NodeType = 'Element' | 'Content' | 'Comment' | 'Component'
```

* Attribute
```ts
  interface Attribute {
    className?: string[];
    style?: Object<style>
  }
```

* Commnet
```ts
  interface Commnet extends Node {
    type: 'Comment';
  }
```

* Element
```ts
  interface Element extends Node {
    type: 'Element';
    tagName: string;
    attributes: Object<Attribute>;
    children?: Node;
  }
```

* Content
```ts
  interface Content extends Node {
    type: 'Content';
    text: string;
  }
```
* Varible
```ts
  interface Variable {
    name: string;
    type: string;
    value: any;
    default: any;
  }
```

* Theme
```ts
  interface Theme extends Variable {

  }
```

* Data
```ts
  interface Data extends Variable {

  }
```

* Component
```ts
  interface Component extends Variable {
    type: 'Component';
    componentType: 'template'| 'container';
    componentName: string;
    description: string;
    template: Template;
    styles: Object<Style>;
    data: Data;
    theme: Theme;
    id?: number & string;
    anthor: string;
  }
```
