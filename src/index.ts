import omit from 'lodash/omit';
import pick from 'lodash/pick';
import { derived, writable, type Writable } from 'svelte/store';
import { object, ObjectSchema } from 'yup';

type SubmitEventType = SubmitEvent & {
  currentTarget: EventTarget & HTMLFormElement;
};

interface Props {
  schema: Record<string, any>;
  defaultValues?: Record<string, any>;
  validateOnInput?: boolean;
}

function getRefs(field: any) {
  return [...field._whitelist.refs.keys()];
}

export default function validator(props: Props) {
  const schema: ObjectSchema<any> = object(props.schema);
  const dirty: Set<string> = new Set();
  const fields: Record<string, any> = props.defaultValues || {};

  const _errors: Writable<Record<string, string>> = writable({});
  const _isValid: Writable<boolean> = writable<boolean>(false);

  async function validate({ name, parentElement }: HTMLInputElement) {
    const refs = getRefs(schema.fields[name]);
    const testSchema = object({ ...pick(schema.fields, [name, ...refs]) });
    const testValues = pick(fields, [name, ...refs]);

    try {
      await testSchema.validate(testValues);
      _errors.update((values) => omit(values, name));
      parentElement?.classList.remove('invalid');
    } catch (error: any) {
      _errors.update((values) => ({ ...values, [name]: error.message }));
      parentElement?.classList.add('invalid');
    }

    _isValid.set(await schema.isValid(fields));
  }

  function register(node: HTMLInputElement) {
    const oldInput = node.oninput?.bind(window);
    const oldBlur = node.onblur?.bind(window);

    node.oninput = async (e) => {
      oldInput?.(e);
      dirty.add(node.name);
      fields[node.name] = (e.target as HTMLInputElement).value;
      if (props.validateOnInput) validate(node);
    };

    node.onblur = async (e) => {
      oldBlur?.(e);
      await validate(node);
    };

    if (schema.fields[node.name].exclusiveTests.required) {
      node.required = true;
    }
  }

  function onSubmit(cb: (data: any, event: SubmitEventType) => any) {
    return function (e: SubmitEventType) {
      cb(fields, e);
    };
  }

  return {
    register,
    onSubmit,
    errors: derived(_errors, ($v) => $v),
    isValid: derived(_isValid, ($v) => $v),
  };
}
