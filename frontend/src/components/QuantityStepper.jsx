import { Minus, Plus, Trash2 } from 'lucide-react';
import './QuantityStepper.css';

/**
 * − qty +. At quantity 1 the minus button becomes a remove button when `onRemove` is given.
 */
export default function QuantityStepper({ value, min = 1, max = 10, onChange, onRemove, busy = false, label = 'item', size = 'md' }) {
  const atMin = value <= min;
  const atMax = value >= max;
  const removeMode = atMin && onRemove;

  return (
    <div className={`stepper stepper--${size}`} aria-busy={busy || undefined}>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => (removeMode ? onRemove() : onChange(value - 1))}
        disabled={busy || (atMin && !onRemove)}
        aria-label={removeMode ? `Remove ${label} from cart` : `Decrease quantity of ${label}`}
      >
        {removeMode ? <Trash2 size={15} /> : <Minus size={15} />}
      </button>
      <span className="stepper__value" aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(value + 1)}
        disabled={busy || atMax}
        aria-label={`Increase quantity of ${label}`}
        title={atMax ? `Maximum ${max}` : undefined}
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
