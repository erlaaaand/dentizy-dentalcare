// components/ui/forms/checkbox/index.ts
import { Checkbox as MainCheckbox } from './Checkbox';
import { CheckboxGroup } from './CheckboxGroup';

type CheckboxCompound = typeof MainCheckbox & {
    Group: typeof CheckboxGroup;
};

const Checkbox = MainCheckbox as CheckboxCompound;

Checkbox.Group = CheckboxGroup;

export default Checkbox;

export { CheckboxGroup };
export * from './checkbox.types';