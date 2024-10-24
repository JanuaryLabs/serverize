import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type EmailValidationState = 'idle' | 'invalid' | 'valid';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email: string): boolean => EMAIL_REGEX.test(email);

const ErrorMessage: React.FC = () => (
  <motion.div
    className="w-full bg-red-100 rounded-lg mt-1.5 flex items-center justify-start px-3 py-2 relative z-[2]"
    key="error"
    initial={{ y: -42, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -42, opacity: 1 }}
    transition={{ duration: 0.2, delay: 0.1, ease: 'linear' }}
  >
    <p className="text-red-500 text-sm font-medium">Invalid email address</p>
  </motion.div>
);

const ContinueButton: React.FC = () => (
  <motion.button
    className="w-full bg-violet-500 rounded-lg mt-1.5 flex items-center justify-center px-2 py-3 relative z-[2]"
    key="valid"
    initial={{ y: -48, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -48, opacity: 1 }}
    transition={{ duration: 0.2, delay: 0.1, ease: 'linear' }}
  >
    <p className="text-white text-sm font-medium">Continue</p>
  </motion.button>
);

const BackgroundAnimation: React.FC<{ state: EmailValidationState }> = ({
  state,
}) => {
  const height = state === 'invalid' ? 103 : state === 'valid' ? 111 : 0;
  const bgColor =
    state === 'invalid'
      ? 'bg-gradient-to-t from-white to-red-50'
      : 'bg-gradient-to-t from-white to-violet-100';

  return (
    <motion.div
      className={`absolute right-0 left-0 w-full top-0 h-0 ${bgColor}`}
      key={`${state}-bg`}
      initial={{ height: 0 }}
      animate={{ height }}
      exit={{ height }}
      transition={{ duration: 0.5, ease: 'linear' }}
    />
  );
};

const EmailInput: React.FC<{
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ email, onChange }) => (
  <motion.input
    key="email"
    className="w-full relative z-10 rounded-lg py-3 pl-3.5 pr-9 bg-white outline-none border border-slate-200 h-[47px]"
    type="email"
    placeholder="Email"
    value={email}
    onChange={onChange}
  />
);

const EmailValidationForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [validationState, setValidationState] =
    useState<EmailValidationState>('idle');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setValidationState(
      newEmail ? (validateEmail(newEmail) ? 'valid' : 'invalid') : 'idle',
    );
  };

  const getFormHeight = (): number => {
    switch (validationState) {
      case 'invalid':
        return 104;
      case 'valid':
        return 112;
      default:
        return 61;
    }
  };

  return (
    <motion.div
      className="w-full overflow-hidden rounded-xl p-1.5 bg-white border border-slate-200 relative"
      initial={{ height: getFormHeight() }}
      animate={{ height: getFormHeight() }}
      exit={{ height: getFormHeight() }}
      transition={{ duration: 0.2, delay: 0.1, ease: 'linear' }}
    >
      <EmailInput email={email} onChange={handleEmailChange} />
      <AnimatePresence mode="wait">
        {validationState === 'invalid' && <ErrorMessage />}
        {validationState === 'valid' && <ContinueButton />}
      </AnimatePresence>
      <BackgroundAnimation state={validationState} />
    </motion.div>
  );
};

export default EmailValidationForm;
