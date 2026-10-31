import { useId, type InputHTMLAttributes } from 'react';
import { AlertIcon } from './icons';
import './TextField.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** 'number' uses the monospace number font (default), 'text' the normal font */
  kind?: 'number' | 'text';
  suffix?: string;
  error?: string;
}

export function TextField({ label, suffix, error, disabled, kind = 'number', className = '', ...inputProps }: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={`field${error ? ' has-error' : ''}${disabled ? ' is-disabled' : ''} ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-control">
        <input
          id={id}
          className={`field-input ${kind === 'text' ? 'text' : 'num'}`}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
      {error && (
        <p className="field-error" id={errorId}>
          <AlertIcon size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
