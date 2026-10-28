{/* 
    DEVELOPER: Jimmy W. Cabrera Soto (jimmy.cabrera@ambienteyenergia.gob.ec - jwsingenieria@gmail.com)
    CREATE AT: October, 2026.
    VERSIÓN: 2.1.1
*/}

{/* -------------------------------------------------------- MAIN FUNCTION */ }
const Page404 = () => {
    return <>
        <div className="w-full h-full flex">
            <div className="flex flex-col w-full gap-4 items-center justify-center m-4 animate-dataWarning">
                <img src="/icon-alerta.png" alt="JWS" className="w-24 h-24" />
                <h1 className="text-5xl font-bold text-green-700/80">404</h1>
                <span>Recurso no disponible</span>
            </div>
            
        </div>
    </>
}

export default Page404;
