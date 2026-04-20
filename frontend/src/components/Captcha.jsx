import ReCAPTCHA from "react-google-recaptcha";

const Captcha = ({ onChange }) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    return (
      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
        VITE_RECAPTCHA_SITE_KEY is not set in .env — captcha disabled.
      </div>
    );
  }

  return <ReCAPTCHA sitekey={siteKey} onChange={onChange} theme="dark" />;
};

export default Captcha;
