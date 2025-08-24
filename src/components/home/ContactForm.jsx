import React, { useRef, useState, useEffect } from "react";
import supabase from "../../supabase/supabase-client";

import emailjs from "@emailjs/browser";
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from "react-router";
export default function ContactForm() {
    const { t } = useTranslation();
    const form = useRef();
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);

    const getSession = async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
        } else {
            setSession(null);
            setUser(null);
        }
    };

    useEffect(() => {
        getSession();

        // Facoltativo: listener per cambiamenti di login/logout
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            getSession();
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);



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
            .then(() => {
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
            }, () => {
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

    // Variants Framer Motion
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, when: "beforeChildren", staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
    };

    return (
        <motion.section
            className="connect flex-col-wise p-2"
            is="contact"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container">
                <div className="row d-flex align-items-between">
                    <motion.div className="col-lg-6 col-12 connectMessage d-flex flex-column pt-5" variants={itemVariants}>
                        <h3 className="text-md-end text-lg-end">
                            Contact Me <i className="bi bi-arrow-right-circle p-2"></i>
                        </h3>
                        <p>{t('subtitle')}</p>
                    </motion.div>

                    <motion.div className="col-lg-6 col-12" variants={itemVariants}>
                        <p className="titleFont mx-2 my-2">{t('formTitle')}</p>
                        <div className="row gap-2 contactForm">
                            <form ref={form} onSubmit={sendEmail}>
                                <motion.div className="contactForm mb-2" variants={itemVariants}>
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder={t('name')}
                                    />
                                </motion.div>
                                <motion.div className="mb-2" variants={itemVariants}>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder={t('email')}
                                    />
                                </motion.div>
                                <motion.div className="col-12" variants={itemVariants}>
                                    <textarea
                                        name="user_message"
                                        placeholder={t('message')}
                                        rows="6"
                                        cols="50"
                                    ></textarea>
                                </motion.div>
                                {user ? (
                                    <motion.div className="mb-2 fs-5" variants={buttonVariants}>
                                        <button type="submit">
                                            {t('send')} <i className="bi bi-arrow-up-right-square"></i>
                                        </button>
                                        <motion.p variants={itemVariants}>
                                            <span className="legend footer">
                                                <span className="dot"></span>{t('guide3')}
                                            </span>
                                        </motion.p>
                                    </motion.div>

                                ) : (
                                    <p className="text-white-50 small text-end">
                                        <Link to="/login" className="me-1">
                                            {t('form14')}
                                        </Link>
                                        /
                                        <Link to="/register" className="mx-1">
                                            {t('form11')}
                                        </Link>
                                        {t('loginToSendMessage')} {/* es. "Please log in to send a message" */}
                                    </p>
                                )}

                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
}
