const CardMetricBasic = ({
  icon,
  title,
  style,
  value,
  subtitle,
  onClick,
  filterKey,
}) => {
  return (
    <div
      className="bg-white w-full md:w-60 flex-1"
      data-filtro={filterKey}
    >
      <div
        onClick={onClick}
        className={`cursor-pointer hover:bg-green-100 hover:bg-green-600 text-sm text-green-700 hover:text-white h-full flex flex-col transition ${style}`}
      >
        <div className="flex items-center p-2 h-1/3">
          <img src={icon} alt={title} className="w-6 md:w-10" />
        </div>

        <div className="flex flex-col justify-center items-center px-4 pb-2 ">
          {value && (
            <span className="text-2xl md:text-4xl font-semibold  truncate w-full text-center">
              {value}
            </span>
          )}

          <span className="text-sm md:text-2xl font-medium truncate w-full text-center">
            {title}
            {subtitle && (
              <>
                <br />
                {subtitle}
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardMetricBasic;