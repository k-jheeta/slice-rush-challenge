import './SegmentedControl.css';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  /** Optional second line, e.g. a price */
  hint?: string;
}

export interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  size?: 'md' | 'sm';
}

/** A radio group rendered as a segmented button bar. Part 3: add onChange + arrow-key support. */
export function SegmentedControl<T extends string | number>({ label, options, value, size = 'md' }: SegmentedControlProps<T>) {
  return (
    <div className="segmented-field">
      <span className="field-label" aria-hidden="true">
        {label}
      </span>
      <div className={`segmented segmented-${size}`} role="radiogroup" aria-label={label}>
        {options.map((option) => (
          <button key={option.value} type="button" role="radio" aria-checked={option.value === value} className="segment">
            <span className="segment-label">{option.label}</span>
            {option.hint && <span className="segment-hint num">{option.hint}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
