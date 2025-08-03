import React from 'react';

export default function ContactForm() {
    return (
        <section className="connect flex-col-wise p-5">
            <div className="container">
                <div className="row d-flex align-items-between">
                    <div className="col-lg-6 col-12 connectMessage d-flex flex-column pt-5">
                        <h3 className="text-md-end text-lg-end">
                            Contact Me <i className="bi bi-arrow-right-circle p-2"></i>
                        </h3>
                        <p>
                            Whether you have a question, feedback, or just want to say hello, feel free to reach out.
                        </p>
                    </div>
                    <div className="col-lg-6 col-12">
                        <p className="titleFont mx-2 my-2">🌈 Send Me a Message!</p>
                        <div className="row gap-2 contactForm">
                            <form method="POST">
                                <div className="contactForm mb-2">
                                    <input
                                        name="name"
                                        id="nName"
                                        type="text"
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        name="email"
                                        id="email"
                                        type="email"
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea
                                        name="user_message"
                                        placeholder="Message"
                                        id="user_message"
                                        rows="6"
                                        cols="50"
                                    ></textarea>
                                </div>
                                <div className="mb-2 fs-5">
                                    <button type="submit">
                                        Send <i className="bi bi-arrow-up-right-square"></i>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
