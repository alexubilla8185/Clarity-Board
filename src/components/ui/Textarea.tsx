import * as React from 'react';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

const Textarea: React.FC<TextareaProps> = ({ label, id, className, ...props }) => {
  const textareaId = id || React.useId();

  return (
    <div className="relative">
      <textarea
        id={textareaId}
        className={`block px-3 pb-2.5 pt-4 w-full text-on-surface bg-transparent rounded-sm border border-outline appearance-none focus:outline-none focus:ring-0 focus:border-primary peer body-large resize-none ${className}`}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={textareaId}
        className="absolute text-on-surface-variant duration-300 transform -translate-y-3.5 scale-75 top-4 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3.5 body-large"
      >
        {label}
      </label>
    </div>
  );
};

export default Textarea;
