import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

/** Waits 300 ms after the last keystroke before calling onChange. */
export default function SearchBox({ value, onChange, delay = 300 }) {
  const [text, setText] = useState(value);
  const timer = useRef(null);
  const lastSent = useRef(value);

  // Follow outside changes (e.g. "Clear all", back button)
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const send = (next) => {
    clearTimeout(timer.current);
    lastSent.current = next.trim();
    onChange(next.trim());
  };

  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => send(next), delay);
  };

  return (
    <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); send(text); }}>
      <Search className="search__icon" size={18} aria-hidden="true" />
      <input
        type="search"
        className="search__input"
        placeholder="Search innerwear, thermals, socks…"
        value={text}
        onChange={handleChange}
        aria-label="Search products"
        maxLength={100}
        enterKeyHint="search"
      />
      {text && (
        <button type="button" className="search__clear" onClick={() => { setText(''); send(''); }} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </form>
  );
}
