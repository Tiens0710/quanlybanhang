/**
 * Email Service using EmailJS REST API
 * Compatible with React Native (no browser APIs)
 */

// EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_otwaiha';
const EMAILJS_TEMPLATE_ID = 'template_serpc6e';
const EMAILJS_PUBLIC_KEY = '5VR2O6hPF2JbFVVsz';
const EMAILJS_PRIVATE_KEY = 'dNE1ZDIykqn5VwSIggO_U';
const EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

/**
 * Send login notification email using EmailJS REST API
 * @param email - User's email address
 * @param name - User's display name
 */
export const sendLoginNotificationEmail = async (
    email: string,
    name: string
): Promise<boolean> => {
    try {
        const loginTime = new Date().toLocaleString('vi-VN', {
            dateStyle: 'full',
            timeStyle: 'medium',
        });

        const templateParams = {
            to_email: email,
            user_name: name || email.split('@')[0],
            login_time: loginTime,
        };

        console.log('[EmailService] Sending login notification to:', email);

        const response = await fetch(EMAILJS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_TEMPLATE_ID,
                user_id: EMAILJS_PUBLIC_KEY,
                accessToken: EMAILJS_PRIVATE_KEY,
                template_params: templateParams,
            }),
        });

        if (response.ok) {
            console.log('[EmailService] Email sent successfully');
            return true;
        } else {
            const errorText = await response.text();
            console.error('[EmailService] Email failed:', errorText);
            return false;
        }
    } catch (error) {
        console.error('[EmailService] Failed to send email:', error);
        return false;
    }
};

export default {
    sendLoginNotificationEmail,
};
