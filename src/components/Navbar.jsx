export default function Navbar() {
    return (
        <>
            <section className="navsection sticky-top">
                <nav className="navbar navbar-expand-lg navbar-dark bg-blur">
                    <div className="container-fluid">
                        <a className="navbar-brand fw-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#fff" viewBox="0 0 256 256">
                                <path
                                    d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z">
                                </path>
                            </svg>
                        </a>
                        <ul className="navbar-nav d-flex flex-row justify-content-center  mb-lg-0">
                            <li className="nav-item ml-1">
                                <a className="nav-link me-2" aria-current="page" href="https://www.instagram.com/lasignora_delpaiolo/">
                                    <i className="bi bi-instagram"></i>
                                </a>
                            </li>
                            <li className="nav-item ml-1 ">
                                <a className="nav-link me-2" href="https://github.com/MaDGiiRL">
                                    <i className="bi bi-github"></i>
                                </a>
                            </li>
                            <li className="nav-item ml-1">
                                <a className="nav-link" href="https://www.linkedin.com/in/sofia-vidotto-ba1369351">
                                    <i className="bi bi-linkedin"></i>
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </section>
        </>
    );
}