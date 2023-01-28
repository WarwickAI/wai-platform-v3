# Elements

## How they work

### Structure

Elements are building blocks of (usually) visual components, like Text or Images. The structure of the whole plaform is a tree of elements. Elements are the nodes of the tree, and they can have children. The children are also elements. A good example of this is the `Page` element which itself can belong to another `Page`, and contain other elements like `Text` or `Image`.

### Types

Each file in the `src/components/elements` directory is an element. Each element has a type, which is the name of the file. For example, the `src/components/elements/Text.tsx` file is the `Text` element.

### Attributes

To give an element some data, we can use `attributes`. Attributes are key-value pairs. For example, the `Text` element has an attribute called `Markdown` which is the text that will be displayed. The `Page` element has an attribute called `Title` which is the title of the page. See the [Attributes](#attributes) section for more information.

### Security

Elements contain 4 security permissions:

- `view`: Whether the element can be viewed by the current signed in user.
- `interact`: Whether the element can be interacted with by the current signed in user.
- `edit`: Whether the element can be edited by the current signed in user.
- `master`: Super permission that allows the user to do anything with the element.

These permissions contain groups. Each user has a group, and new groups can be created. See [Groups](#groups) for more information.

Only elements that a user can view are ever returned from the DB. This means that as long as you use the platform correctly, setting the `view` permissions to just you, means that no one else will ever see the element (with exception of the `master` permission).

The `edit` permission allows the user (by default) to edit the elements attributes and add children. To edit the elements index (as in the position on a page) you must have edit permissions on the parent element.

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

## Advanced Features 👀

### Security

As mentioned above we have the four security permissions, where by default only a user can edit the attributes or add new children if they have the `edit` permission. You may not want to limit this functionality however. A good example is that for the `Survey` element, you want users to be able to create responses (which are children to the element) even if they cannot edit the survey. For this, we allow in the `src/components/elements/index.ts` to specify a custom `checkPermissions` function. This can have arguments:

- `element`: element with permission groups
- `user`: user with their groups they belong to
- `operation`: type of operation (e.g. edit, delete, create child)
- `data`: would contain the input data if we are creating a child

If you do not provide the `checkPermissions` function, we will use the default permission checking. If you return `null` or `undefined`, we will assume you also want to use the default strategy. Therefore, this function will only be considered for strictly boolean values as results.

### Side-Effects

When making changes to elements, there may be side-effects you want to check and make adjustments for. A good example here is when adding a new column to a database, making sure that all children get given an equivalent attribute. For this you can specify a custom `sideEffects` function and provide it for a element in `src/components/elements/index.ts`. You will be provided with the following arguments:

- `element`: modified element (in case of deletion, will not be modifed)
- `user`: user
- `operation`: type of operation (e.g. edit, delete, create child)
- `data`: would contain the input data if we are creating a child

This function should return a boolean value, indicating success or failure. ToDo: Handle failure here correctly.
