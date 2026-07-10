import { useState, useEffect, useRef } from "react";
import { DATA_FILTERS } from "../data/dataFilters";

export default function SingleSelect({ filter, label, style, value, onChange }) {
  const [open, setOpen] = useState(false);
  const options = DATA_FILTERS[filter];

  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filterAliase = {
    anio: "Año",
    mes: "Mes",
    delimitacion: "Delimitación",
    provincia: "Provincia",
    trimestre: "Trimestre"
  }

  return (
    <div ref={selectRef} className="relative ">
      <div
        onClick={() => setOpen(!open)}
        className={`bg-gray-100 border border-[var(--color-border)]/10 px-3 py-1 text-[var(--color-text-secondary)] text-sm ${style} cursor-pointer hover:bg-green-600 hover:text-white transition flex justify-between`}
      >
        Filtro ({filterAliase[filter]}): {value || label}
        <span>▼</span>
      </div>

      {open && (
        <ul className="absolute w-full bg-white border border-[var(--color-border)]/10 rounded-b-lg mt-1 shadow max-h-40 overflow-auto z-50">
          <li
            onClick={() => {
              onChange('Todos');
              setOpen(false);
            }}
            value={'Todos'}
            className="px-3 py-1 text-[var(--color-text-secondary)] text-sm hover:bg-green-500 hover:text-white cursor-pointer"
          >
            Todos
          </li>
          {options.map((opt, i) => (
            <li
              key={i}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="px-3 py-1 text-[var(--color-text-secondary)] text-sm hover:bg-green-500 hover:text-white cursor-pointer"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}