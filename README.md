# Yup validator for Svelte

- ### Elegant
- ### Using Svelte actions
- ### Full yup support

## Usage

```typescript
<script lang="ts">
  import validator from "svup";
  import { string } from "yup";

  const { register, isValid, onSubmit, errors } = validator({
    validateOnInput: true,
    schema: {
      email: string().required().email(),
      password: string().required().min(8),
    },
  });
</script>

<form on:submit(onSubmit(console.log))>
    <input type="email" name="email" use:register />
    <input type="password" name="password" use:register />
    <button disabled={!$isValid}>Submit</button>
</form>
```

## Options

- ### `schema`(required): The validation schema to test against.
- ### `validateOnInput`: Validate on `on:input` event or not. If not set validation happen on `on:blur` event.

## Returns

- ### `register` is an action what should used on `<input>` element, it will prepare everything for the validaton.
- ### `isValid` is a `Readable<boolean>` store what notify you if the form is valid or not.
- ### `errors` is a `Readable<boolean>` store what contains the error messages from yup schema.
- ### `onSubmit` is an `on:submit` event handler. It expect a callback what get the form values.

## NOTE

- ### `<input>` `name` property and schema `key` must match for validation.
- ### Simply throw `use:register` action onto inputfield and u good to go.
- ### You can define custom `on:input` and `on:blur` listeners, they will called before validation
