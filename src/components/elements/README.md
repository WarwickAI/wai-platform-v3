# Elements

## How they work

### Structure

Elements are building blocks of (usually) visual components, like Text or Images. The structure of the whole plaform is a tree of elements. Elements are the nodes of the tree, and they can have children. The children are also elements. A good example of this is the `Page` element which itself can belong to another `Page`, and contain other elements like `Text` or `Image`.

### Types

Each file in the `src/components/elements` directory is an element. Each element has a type, which is the name of the file. For example, the `src/components/elements/Text.tsx` file is the `Text` element.

### Attributes

To give an element some data, we can use `attributes`. Attributes are key-value pairs. For example, the `Text` element has an attribute called `Markdown` which is the text that will be displayed. The `Page` element has an attribute called `Title` which is the title of the page. See the [Attributes](#attributes) section for more information.

## Creating a New Element

Here we will detail a step by step process of creating a new element.

### 1. Create the file

Create a new file in the `src/components/elements` directory. The name of the file will be the type of the element. For example, if we want to create a `Button` element, we will create a file called `Button.tsx`. Strictly speaking, the file name doesn't have to be the same as the type, but it's a good practice to do so.

### 2. Define the required attributes

From this new file we need to export the attributes that are required for this element to work. For our `Button` element, we will need to know the text that will be displayed on the button. So we will export the following array of required attributes:

```ts
export const BadgeRequiredAttributes: RequiredAttribute[] = [
  { name: "Text", type: "Text", value: "Some Button Name..." },
];
```

You may want to add other attributes too, for example color, action etc.

### 3. Create the actual element

Now you need to create a default export that is the element to be rendered for this type. Elements receive the following properties when rendered:

- `element`: The element with its attributes, permissions. _Note the children are also provided but should not be used_
- `edit`: Whether the element can be edited or not by the current signed in user. This is usually passed in from `src/components/item.tsx`.

If you require more information from the element, like children, you can fetch the full element in the component. This is done in, for example, the `Survey` and `Database` components. Try and avoid having to do this however since it adds a nested DB call on opening a page.

### 4. Add the element to the `src/components/elements/index.ts` file

This file exports all the elements. You need to add your new element to this file so that it can be used in the platform. If you do not want your element globally usable (for example a `SurveyResponse` element), you can skip this step.
