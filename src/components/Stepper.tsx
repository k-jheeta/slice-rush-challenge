import { useId } from 'react';
import { AlertIcon, MinusIcon, PlusIcon } from './icons';
import './Stepper.css';

export interface StepperProps {
  label: string;
  /** Part 1: static. Part 3: make it controlled (value + onChange) and wire up the − / + buttons */
  defaultValue: string;
  min?: number;
  max?: number;
  error?: string;
}

export function Stepper({ label, defaultValue, min = 1, max = 99, error }: StepperProps) {
  const id = useId();
  const parsed = Number(defaultValue);
  return (
    <div className={`field stepper${error ? ' has-error' : ''}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="stepper-control">
        <button type="button" className="stepper-btn" aria-label={`Decrease ${label.toLowerCase()}`} disabled={parsed <= min}>
          <MinusIcon size={14} />
        </button>
        <input
          id={id}
          className="stepper-input num"
          inputMode="numeric"
          autoComplete="off"
          defaultValue={defaultValue}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <button type="button" className="stepper-btn" aria-label={`Increase ${label.toLowerCase()}`} disabled={parsed >= max}>
          <PlusIcon size={14} />
        </button>
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`}>
          <AlertIcon size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
