{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const CardMetric = ({
  icon,
  title,
  style = "",
  value,
  subtitle,
  onClick,
  filterKey,
}) => {
  const isList = Array.isArray(value);

  return (
    <div
      className="flex-1 min-h-0 w-full"
      data-filtro={filterKey} 
    >
      <div
        onClick={onClick}
        className={`
          h-full
          w-full
          flex
          flex-col
          overflow-hidden
          cursor-pointer
          hover:bg-[var(--color-emphasis)]
          hover:text-[var(--color-text-secondary)]
          text-green-700
          transition-all
          duration-300
          ${style}
        `}
      >
        {/* ================= HEADER */}
        <div className="flex items-center gap-2 p-2 border-b border-gray-100 flex-shrink-0">
          <img
            src={icon}
            alt={title}
            className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full p-1"
          />

          <div className="leading-tight">
            <div className="font-semibold text-sm md:text-base">
              {title}
            </div>

            {subtitle && (
              <div className="text-xs opacity-80">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* ================= CONTENT */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* ---------- VALOR SIMPLE ---------- */}
          {!isList && (
            <div className="h-full flex items-center justify-center px-3">
              <span className="text-xl md:text-5xl font-bold text-center break-words">
                {value ?? 0}
              </span>
            </div>
          )}

          {/* ---------- LISTADO ---------- */}
          {isList && (
            <div className="h-full overflow-y-auto px-3 py-2 space-y-1">
              {value.length > 0 ? (
                value.map(([label, count], idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start text-xs md:text-sm border-b border-gray-100 pb-1"
                  >
                    <span
                      className="truncate max-w-[75%]"
                      title={label}
                    >
                      {label}
                    </span>

                    <span className="font-semibold">
                      {count}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center text-sm">
                    <span className="text-xl md:text-5xl font-bold text-center break-words">
                      Sin datos
                    </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardMetric;