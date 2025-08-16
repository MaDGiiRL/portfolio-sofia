import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase/supabase-client";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [formState, setFormState] = useState({
        email: "",
        password: "",
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        setFormSubmitted(true);

        // Validazione base: email e password non vuoti
        let errors = {};
        if (!formState.email) errors.email = t('form_error_email');
        if (!formState.password) errors.password = t('form_error_password');

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email: formState.email,
            password: formState.password,
        });

        if (error) {
            console.error("Errore login Supabase:", error);
            Swal.fire({
                icon: 'error',
                title: t('form5'),
                text: t('form32'),
                background: '#1e1e1e',
                color: '#fff',
                iconColor: '#ff36a3',
                confirmButtonColor: '#ff36a3'
            });
        } else {
            Swal.fire({
                icon: 'success',
                title: t('form33'),
                text: t('form34'),
                background: '#1e1e1e',
                color: '#fff',
                iconColor: '#dbff00',
                confirmButtonColor: '#dbff00',
            });

            setTimeout(() => {
                navigate("/");
            }, 1200);
        }
    };

    const onBlur = (property) => () => {
        const message = !formState[property] ? t('form_error_required') : "";
        setFormErrors((prev) => ({ ...prev, [property]: message }));
        setTouchedFields((prev) => ({ ...prev, [property]: true }));
    };

    const isInvalid = (property) => {
        if (formSubmitted || touchedFields[property]) {
            return !!formErrors[property];
        }
        return undefined;
    };

    const setField = (property) => (e) => {
        setFormState((prev) => ({
            ...prev,
            [property]: e.target.value,
        }));
    };

    return (
        <div className="container text-container mt-5">
            <div className="row">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="logo d-flex align-items-center justify-content-center">
                            <div className="logo-icon">MP</div>
                        </div>
                        <h2>{t('form14')}</h2>
                        <p>{t('form7')}</p>
                        <form onSubmit={onSubmit} noValidate className="space-y-5">

                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="email" className="block mb-1 font-medium">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={setField("email")}
                                    onBlur={onBlur("email")}
                                    aria-invalid={isInvalid("email")}
                                    required
                                />
                                {formErrors.email && (
                                    <small className="text-red-500">{t('form35')}</small>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label htmlFor="password" className="block mb-1 font-medium">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formState.password}
                                    onChange={setField("password")}
                                    onBlur={onBlur("password")}
                                    aria-invalid={isInvalid("password")}
                                    required
                                />
                                {formErrors.password && (
                                    <small className="text-red-500">{t('form36')}</small>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div>
                                <button
                                    type="submit"
                                    className="btn-login-auth"
                                >
                                    {t('form14')}
                                </button>
                            </div>
                        </form>

                        <div className="auth-footer">
                            <p>
                                {t('form10')} <a href="/register">{t('form11')}</a>
                            </p>
                            <a href="/"><i className="bi bi-arrow-left-short"></i> {t('form12')}</a>
                        </div>

                        <div className="pt-5">
                            <p className="small">© 2025 MaD's Portfolio. {t('form13')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="gradient-bg">
                <svg xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <filter id="goo">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                            <feColorMatrix
                                in="blur"
                                mode="matrix"
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                                result="goo"
                            />
                            <feBlend in="SourceGraphic" in2="goo" />
                        </filter>
                    </defs>
                </svg>
                <div className="gradients-container">
                    <div className="g1"></div>
                    <div className="g2"></div>
                    <div className="g3"></div>
                    <div className="g4"></div>
                    <div className="g5"></div>
                    <div className="interactive"></div>
                </div>
            </div>
        </div>
    );
}
