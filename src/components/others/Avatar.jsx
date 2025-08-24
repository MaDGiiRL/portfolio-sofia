import { useEffect, useState } from 'react'
import supabase from '../../supabase/supabase-client'
import { useTranslation } from "react-i18next";
import Swal from 'sweetalert2';
export default function Avatar({ url, size, onUpload }) {
    const [avatarUrl, setAvatarUrl] = useState(null)
    const [uploading, setUploading] = useState(false)
    const { t } = useTranslation();
    useEffect(() => {
        if (url) downloadImage(url)
    }, [url])

    const downloadImage = async (path) => {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error.message)
        }
    }


    const uploadAvatar = async (event) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            onUpload(event, filePath)

            // Success alert
            Swal.fire({
                icon: 'success',
                title: t('account10'),
                text: t('account11'),
                background: '#1e1e1e',
                color: '#fff',
                iconColor: '#dbff00',
                confirmButtonColor: '#dbff00',
                timer: 2000,
                showConfirmButton: false
            })

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                background: '#1e1e1e',
                color: '#fff',
                iconColor: '#ff36a3',
                confirmButtonColor: '#ff36a3',
                text: error.message,
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div
            className="avatar-wrapper"
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                padding: '1rem',
                boxSizing: 'border-box',
            }}
        >
            <div className="avatar-container" style={{ textAlign: 'center', position: 'relative', width: size }}>
                {/* Avatar Circle */}
                <div
                    className="avatar-preview"
                    style={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => document.getElementById('avatar-input').click()}
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #ff7eb9, rgb(219, 255, 0))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '4rem',
                                zIndex: '100'
                            }}
                        >
                            +
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    id="avatar-input"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    style={{ display: 'none' }}
                />

                {uploading && (
                    <p style={{ marginTop: '0.5rem', color: '#ff758c', fontWeight: '500' }}>{t('account4')}</p>
                )}

            </div>
        </div>



    )
}