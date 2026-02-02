import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  maxLength?: number;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

interface TextAreaProps extends BaseInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  rows?: number;
  maxLength?: number;
  resize?: boolean;
}

// Enhanced Text Input
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  error,
  success,
  hint,
  required,
  disabled,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  maxLength,
  icon,
  showPasswordToggle,
  className = '',
  containerClassName = ''
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  const inputType = type === 'password' && showPassword ? 'text' : type;
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <motion.div 
      className={`space-y-2 ${containerClassName}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="flex items-center gap-1 text-sm font-semibold text-white/90">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white/80 transition-colors">
            {icon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-md text-white placeholder-white/50
            ${icon ? 'pl-11' : ''}
            ${showPasswordToggle || hasError || hasSuccess ? 'pr-11' : ''}
            ${hasError 
              ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
              : hasSuccess 
                ? 'border-green-400/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                : 'border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}
            ${isFocused ? 'bg-white/10' : ''}
            ${className}
          `}
        />
        
        {/* Password Toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {/* Status Icons */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        
        {hasSuccess && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {/* Character Count */}
      {maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-orange-400' : 'text-white/50'}`}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}
      
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
        
        {success && !error && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-green-400 text-sm flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            {success}
          </motion.p>
        )}
        
        {hint && !error && !success && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/60 text-sm"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

// Enhanced TextArea
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  success,
  hint,
  required,
  disabled,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  rows = 4,
  maxLength,
  resize = true,
  className = '',
  containerClassName = ''
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(value.length);

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.();
  };

  return (
    <motion.div 
      className={`space-y-2 ${containerClassName}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="flex items-center gap-1 text-sm font-semibold text-white/90">
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <div className="relative group">
        <motion.textarea
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/5 backdrop-blur-md text-white placeholder-white/50
            ${hasError 
              ? 'border-red-400/50 focus:border-red-400 focus:ring-2 focus:ring-red-400/20' 
              : hasSuccess 
                ? 'border-green-400/50 focus:border-green-400 focus:ring-2 focus:ring-green-400/20'
                : 'border-white/10 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-white/20'}
            ${isFocused ? 'bg-white/10' : ''}
            ${!resize ? 'resize-none' : 'resize-y'}
            ${className}
          `}
        />
        
        {/* Status Icons */}
        {hasError && (
          <div className="absolute right-3 top-3 text-red-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        
        {hasSuccess && (
          <div className="absolute right-3 top-3 text-green-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {/* Character Count */}
      {maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${charCount > maxLength * 0.9 ? 'text-orange-400' : 'text-white/50'}`}>
            {charCount}/{maxLength}
          </span>
        </div>
      )}
      
      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
        
        {success && !error && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-green-400 text-sm flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" />
            {success}
          </motion.p>
        )}
        
        {hint && !error && !success && (
          <motion.p
            key="hint"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/60 text-sm"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

TextInput.displayName = 'TextInput';
TextArea.displayName = 'TextArea';