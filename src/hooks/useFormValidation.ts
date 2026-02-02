import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FieldConfig {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: FormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  clearErrors: () => void;
  clearError: (field: keyof T) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FieldConfig
): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: keyof T): boolean => {
    const value = values[field];
    const rules = validationRules[field as string];
    
    if (!rules) return true;

    let error: string | null = null;

    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      error = `${String(field)} is required`;
    }
    
    // Min length validation
    else if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      error = `${String(field)} must be at least ${rules.minLength} characters`;
    }
    
    // Max length validation
    else if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      error = `${String(field)} must be no more than ${rules.maxLength} characters`;
    }
    
    // Pattern validation
    else if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      error = `${String(field)} format is invalid`;
    }
    
    // Custom validation
    else if (rules.custom) {
      error = rules.custom(value);
    }

    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    return !error;
  }, [values, validationRules]);

  const validateAll = useCallback((): boolean => {
    let isFormValid = true;

    Object.keys(validationRules).forEach(field => {
      const isFieldValid = validateField(field as keyof T);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }, [validateField, validationRules]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  }, []);

  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = useMemo((): boolean => {
    return Object.values(errors).every(error => !error) && 
           Object.keys(validationRules).every(field => {
             const rules = validationRules[field];
             const value = values[field as keyof T];
             return !rules.required || (value && (typeof value !== 'string' || value.trim()));
           });
  }, [errors, values, validationRules]);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setValues,
    validateField,
    validateAll,
    clearErrors,
    clearError,
    setSubmitting,
    reset
  };
}