module.exports = (req, res) => {
    return res.json({
        ok: true,
        hasEnv: {
            SENDGRID_API_KEY: !!process.env.SENDGRID_API_KEY,
            SENDGRID_SINGLE_SENDER: !!process.env.SENDGRID_SINGLE_SENDER,
            SITE_URL: !!process.env.SITE_URL
        },
        fromRaw: process.env.SENDGRID_SINGLE_SENDER || null
    });
};
