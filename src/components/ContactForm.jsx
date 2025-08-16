import React, { useRef } from "react";
import emailjs from "@emailjs/browser";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';

export default function ContactForm() {
    const { t } = useTranslation();
    const form = useRef();

    const sendEmail = (e) => {
        e.preventDefault();

        const name = form.current.name.value.trim();
        const email = form.current.email.value.trim();
        const message = form.current.user_message.value.trim();

        if (!name || !email || !message) {
            Swal.fire({
                title: t('allFieldsRequiredTitle'),
                text: t('allFieldsRequiredText'),
                icon: 'warning',
                confirmButtonText: t('ok'),
                background: '#1e1e1e',
                color: '#fff',
                iconColor: '#ff36a3',
                confirmButtonColor: '#ff36a3'
            });
            return;
        }

        emailjs.sendForm(
            "gmail_react",
            "template_ztn422f",
            form.current,
            "K8Qe1ecE6ix2acMPs"
        )
            .then((result) => {
                Swal.fire({
                    title: t('successTitle'),
                    text: t('successText'),
                    icon: 'success',
                    confirmButtonText: t('ok'),
                    background: '#1e1e1e',
                    color: '#fff',
                    iconColor: '#dbff00',
                    confirmButtonColor: '#ff36a3'
                });
                e.target.reset();
            }, (error) => {
                Swal.fire({
                    title: t('errorTitle'),
                    text: t('errorText'),
                    icon: 'error',
                    confirmButtonText: t('ok'),
                    background: '#1e1e1e',
                    color: '#fff',
                    iconColor: '#f44336',
                    confirmButtonColor: '#f44336'
                });
            });
    };

    return (
        <section className="connect flex-col-wise p-5">
            <div className="container">
                <div className="row d-flex align-items-between">
                    <div className="col-lg-6 col-12 connectMessage d-flex flex-column pt-5">
                        <h3 className="text-md-end text-lg-end">
                            Contact Me <i className="bi bi-arrow-right-circle p-2"></i>
                        </h3>
                        <p>{t('subtitle')}</p>

                    </div>
                    <div className="col-lg-6 col-12">
                        <p className="titleFont mx-2 my-2">{t('formTitle')}</p>
                        <div className="row gap-2 contactForm">
                            <form ref={form} onSubmit={sendEmail}>
                                <div className="contactForm mb-2">
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder={t('name')}
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={t('email')}
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea
                                        name="user_message"
                                        placeholder={t('message')}
                                        rows="6"
                                        cols="50"
                                    ></textarea>
                                </div>
                                <div className="mb-2 fs-5">
                                    <button type="submit">
                                        {t('send')} <i className="bi bi-arrow-up-right-square"></i>
                                    </button>
                                </div>
                                <p> <span className="legend footer"><span className="dot"></span>{t('guide3')} </span></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
