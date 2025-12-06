import React, { InputHTMLAttributes, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id?: string;
};

export default function PasswordField(props: Props) {
  const { id, className: wrapperClass, ...rest } = props as any;
  const [show, setShow] = useState(false);

  // Extract any className accidentally passed in rest for the input
  const { className: inputClassFromProps, ...inputRest } = rest;

  const inputClass = `${inputClassFromProps ? inputClassFromProps + ' ' : ''}pr-10`;

  return (
    <div className={`relative ${wrapperClass || ''}`}>
      <Input id={id} type={show ? 'text' : 'password'} className={inputClass} {...inputRest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center p-0 text-muted-foreground"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
