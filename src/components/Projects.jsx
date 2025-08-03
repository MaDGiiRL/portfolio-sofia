export default function Projects() {
    return (
        <section className="flex-col-wise py-5 my-5">
            <div className="container flex-col-wise mb-5">
                <div className="projectContainer row g-3">
                    <div className="col-lg-12 col-12">
                        <h2 className="text-white text-left mt-5 display-5 text-uppercase">Projects</h2>
                    </div>

                    {/* Project 1 */}
                    <div className="projectItem col-lg-8 col-12">
                        <div className="card item1">
                            <div className="image-container">
                                <img src="/src/assets/1.png" alt="Project 1" />
                                <div className="buttons">
                                    <button>View</button>
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#modal1">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade mt-5 pt-5" id="modal1" tabIndex="-1" aria-labelledby="modal1Label" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modal1Label">Project 1 Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Contenuto del progetto 1.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project 2 */}
                    <div className="projectItem col-lg-4 col-6">
                        <div className="card item2">
                            <div className="image-container">
                                <img src="/src/assets/2.png" alt="Project 2" />
                                <div className="buttons">
                                    <button>View</button>
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#modal2">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade mt-5 pt-5" id="modal2" tabIndex="-1" aria-labelledby="modal2Label" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modal2Label">Project 2 Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Contenuto del progetto 2.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project 3 */}
                    <div className="projectItem col-lg-4 col-6">
                        <div className="card item3">
                            <div className="image-container">
                                <img src="/src/assets/3.png" alt="Project 3" />
                                <div className="buttons">
                                    <button>View</button>
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#modal3">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade mt-5 pt-5" id="modal3" tabIndex="-1" aria-labelledby="modal3Label" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modal3Label">Project 3 Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Contenuto del progetto 3.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project 4 */}
                    <div className="projectItem col-lg-4 col-6">
                        <div className="card item4">
                            <div className="image-container">
                                <img src="/src/assets/4.png" alt="Project 4" />
                                <div className="buttons">
                                    <button>View</button>
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#modal4">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade mt-5 pt-5" id="modal4" tabIndex="-1" aria-labelledby="modal4Label" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modal4Label">Project 4 Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Contenuto del progetto 4.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Project 5 */}
                    <div className="projectItem col-lg-4 col-6">
                        <div className="card item5">
                            <div className="image-container">
                                <img src="/src/assets/5.png" alt="Project 5" />
                                <div className="buttons">
                                    <button>View</button>
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#modal5">Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal fade mt-5 pt-5" id="modal5" tabIndex="-1" aria-labelledby="modal5Label" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="modal5Label">Project 5 Details</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    Contenuto del progetto 5.
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
