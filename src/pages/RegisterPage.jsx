import { useState } from "react";
import {
    ConfirmSchema,
    getErrors,
    getFieldError,
} from '../lib/validationForm';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router";
import supabase from "../supabase/supabase-client";

import Swal from 'sweetalert2';

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [formState, setFormState] = useState({
        email: "",
        firstName: "",
        lastName: "",
        username: "",
        password: "",
    });

    const onSubmit = async (event) => {
        event.preventDefault();
        setFormSubmitted(true);
        const { error, data } = ConfirmSchema.safeParse(formState);
        if (error) {
            const errors = getErrors(error);
            setFormErrors(errors);
            console.log(errors);
        } else {
            let { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        username: data.username
                    }
                }
            });
            if (error) {
                Swal.fire({
                    icon: 'error',
                    title: t('form5'),
                    text: t('form6'),
                    background: '#1e1e1e',
                    color: '#fff',
                    iconColor: '#ff36a3',
                    confirmButtonColor: '#ff36a3',
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: t('form18'),
                    text: t('form29'),
                    background: '#1e1e1e',
                    color: '#fff',
                    iconColor: '#dbff00',
                    confirmButtonColor: '#dbff00',
                });
                setTimeout(() => {
                    window.location.href = "/";
                }, 1000);
            }
        }
    };


    const onBlur = (property) => () => {
        const message = getFieldError(property, formState[property]);
        setFormErrors((prev) => ({ ...prev, [property]: message }));
        setTouchedFields((prev) => ({ ...prev, [property]: true }));
    };

    const isInvalid = (property) => {
        if (formSubmitted || touchedFields[property]) {
            return !!formErrors[property];
        }
        return undefined;
    }

    const setField = (property, valueSelector) => (e) => {
        setFormState((prev) => ({
            ...prev,
            [property]: valueSelector ? valueSelector(e) : e.target.value,
        }));
    };

    return (

        <div className="text-container">
            <div className="container text-container mt-5 px-3">
                <div className="row justify-content-center">
                    {/* ⬇️ prima era: col-6 */}
                    <div className="col-12 col-lg-6 auth-container">
                        {/* ⬇️ padding responsive: più compatto su mobile, comodo su desktop */}
                        <div className="auth-card p-4 p-sm-4 p-lg-5">
                            <div className="logo d-flex align-items-center justify-content-center">
                                <div className="logo-icon">MP</div>
                            </div>
                            <h2>{t('form20')}</h2>
                            <p>{t('form21')}</p>
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
                                        <small className="text-red-500">{formErrors.email}</small>
                                    )}
                                </div>
                                {/* Nome */}
                                <div className="input-group">
                                    <label htmlFor="firstName" className="block mb-1 font-medium">{t('form30')}</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name={t('form30')}
                                        value={formState.firstName}
                                        onChange={setField("firstName")}
                                        onBlur={onBlur("firstName")}
                                        aria-invalid={isInvalid("firstName")}
                                        required
                                    />
                                    {formErrors.firstName && (
                                        <small className="text-red-500">{formErrors.firstName}</small>
                                    )}
                                </div>
                                {/* Cognome */}
                                <div className="input-group">
                                    <label htmlFor="lastName" className="block mb-1 font-medium">{t('form31')}</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name={t('form31')}
                                        value={formState.lastName}
                                        onChange={setField("lastName")}
                                        onBlur={onBlur("lastName")}
                                        aria-invalid={isInvalid("lastName")}
                                        required
                                    />
                                    {formErrors.lastName && (
                                        <small className="text-red-500">{formErrors.lastName}</small>
                                    )}
                                </div>
                                {/* Username */}
                                <div className="input-group">
                                    <label htmlFor="username" className="block mb-1 font-medium">Username</label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formState.username}
                                        onChange={setField("username")}
                                        onBlur={onBlur("username")}
                                        aria-invalid={isInvalid("username")}
                                        required
                                    />
                                    {formErrors.username && (
                                        <small className="text-red-500">{formErrors.username}</small>
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
                                        <small className="text-red-500">{formErrors.password}</small>
                                    )}
                                </div>
                                {/* Submit Button */}
                                <div>
                                    <button
                                        type="submit"
                                        className="btn-login-auth"
                                    >
                                        {t('form11')}
                                    </button>
                                </div>
                            </form>
                            <div className="auth-footer">
                                <p>
                                    {t('form25')} <Link to="/login">
                                        {t('form14')}
                                    </Link>
                                </p>
                                <a href="/"><i className="bi bi-arrow-left-short"></i> {t('form27')}</a>
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
        </div>
    );

}