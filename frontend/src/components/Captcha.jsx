import ReCAPTCHA from "react-google-recaptcha";
import { forwardRef, useRef, useImperativeHandle } from "react";

const Captcha = forwardRef(({ onChange }, ref) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  const recaptchaRef = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    },
  }));

  if (!siteKey) {
    return (
      <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
        VITE_RECAPTCHA_SITE_KEY is not set in .env — captcha disabled.
      </div>
    );
  }

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      onChange={onChange}
      theme="dark"
    />
  );
});

export default Captcha;
