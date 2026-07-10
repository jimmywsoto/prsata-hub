export const Loader = () => (
    <div className="loader-wrapper">
        <div className="loader-content flex flex-col items-center">
            <div className="bars">
                <div className="bar bar1"></div>
                <div className="bar bar2"></div>
                <div className="bar bar3"></div>
                <div className="bar bar4"></div>
                <div className="bar bar5"></div>
            </div>
            <p className="loader-text">Cargando ...</p>
        </div>
    </div>
)

export default Loader