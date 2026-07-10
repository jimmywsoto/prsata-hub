import { useState, useRef, useEffect } from "react";
import { DATA_FILTERS } from "../data/dataFilters";

export default function MultiSelect({
  filter,
  label = "Seleccionar",
  value = [],
  onChange,
  style = "",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const options = DATA_FILTERS[filter] || [];

  // 🔹 Normalizador (clave para evitar bugs)
  const normalize = (v) => String(v);

  // 🔹 Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Filtrado por búsqueda (soporta number/string)
  const filteredOptions = options.filter((opt) =>
    normalize(opt).toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Verificar si está seleccionado
  const isSelected = (opt) => {
    return value?.some((v) => normalize(v) === normalize(opt));
  };

  // 🔹 Toggle opción
  const toggleOption = (opt) => {
    let newValue = value || [];

    const exists = newValue.some(
      (v) => normalize(v) === normalize(opt)
    );

    if (exists) {
      newValue = newValue.filter(
        (v) => normalize(v) !== normalize(opt)
      );
    } else {
      newValue = [...newValue, opt];
    }

    onChange(newValue);
  };

  // 🔹 Seleccionar todos
  const isAllSelected =
    options.length > 0 &&
    options.every((opt) =>
      value?.some((v) => normalize(v) === normalize(opt))
    );

  const toggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(options);
    }
  };

  // 🔹 Texto visible en el select
  const displayText = () => {
    if (!value || value.length === 0) return label;
    if (value.length === 1) return value[0];
    return `${value.length} seleccionados`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className={`
          bg-gray-100 border border-[var(--color-border)]/10 px-3 py-2 text-sm
          cursor-pointer flex justify-between items-center
          hover:bg-green-600 hover:text-white transition
          ${style}
        `}
      >
        <span className="truncate">{displayText()}</span>
        <span className={`text-xs transition ${open ? "rotate-180" : ""}`}>
          ▼
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute w-full bg-white border border-[var(--color-border)] rounded-lg mt-1 shadow-lg z-50">

          {/* 🔍 Buscador */}
          <div className="p-2 border-b border-[var(--color-border)]">
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded outline-none focus:ring-2 ring-green-200"
            />
          </div>

          {/* ✔ Select All */}
          <div
            onClick={toggleAll}
            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-[var(--color-border)]"
          >
            <input type="checkbox" checked={isAllSelected} readOnly />
            <span>Seleccionar todos</span>
          </div>

          {/* 📋 Opciones */}
          <ul className="max-h-48 overflow-auto">
            {filteredOptions.map((opt, i) => {
              const checked = isSelected(opt);

              return (
                <li
                  key={i}
                  onClick={() => toggleOption(opt)}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-green-100"
                >
                  <input type="checkbox" checked={checked} readOnly />
                  <span className="truncate">{opt}</span>
                </li>
              );
            })}

            {filteredOptions.length === 0 && (
              <li className="px-3 py-2 text-xs text-gray-400">
                Sin resultados
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}