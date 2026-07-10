{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: February, 2026.
    VERSIÓN: 2.0.0
*/}

{/* -------------------------------------------------------- COMPONENTS */ }
import CardMetric from "./CardMetric";
import CardMetricBasic from "./CardMetricBasic";

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const CardsContainer = ({ data }) => {
  return (
    <section className="flex flex-col h-full w-full md:w-64 overflow-hidden">
      <CardMetric
        icon={ data.icon || "/bg-alert.png"}
        title={ data.title || "Alertas SATA"}
        subtitle={ data.subtitle || "Sistema de Alertas Tempranas Ambientales (SATA)"}
        style="bg-gray-300 rounded-t-lg"
        value={data.alertas}
        filterKey="alertas"
        onClick={() => console.log("Alertas")}
      />

      <CardMetric
        icon="/bg-anio.png"
        title="Año"
        style="bg-gray-200"
        value={data.anio.length === 0 ? "Todos" : data.anio}
        filterKey="anio"
        onClick={() => console.log("Año")}
      />

      <CardMetric
        icon="/bg-period.png"
        title="Mes"
        style="bg-gray-300"
        value={data.mes.length === 0 ? "Todos" : data.mes}
        filterKey="periodo"
        onClick={() => console.log("Mes")}
      />

      <CardMetric
        icon="/bg-ecuador.png"
        title="Provincia"
        style="bg-gray-200"
        value={data.provincia}
        filterKey="provincia"
        onClick={() => console.log("Provincia")}
      />

      <CardMetric
        icon="/bg-delimitation.png"
        title="Delimitación"
        style="bg-gray-300 rounded-b-lg"
        value={data.delimitacion}
        filterKey="delimitacion"
        onClick={() => console.log("Delimitación")}
      />
    </section>
  );
};

export default CardsContainer;