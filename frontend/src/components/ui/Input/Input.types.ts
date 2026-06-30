import { InputHTMLAttributes } from 'react';

export type InputType = 'text' | 'email' | 'tel' | 'password' | 'number';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  type?: InputType;
  error?: string;
  success?: boolean;
}
