import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image, AlertCircle, CheckCircle2, FileImage } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  preview?: boolean;
  onFilesChange: (files: File[]) => void;
  files: File[];
  className?: string;
  containerClassName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  error,
  success,
  hint,
  required,
  disabled,
  accept = 'image/*',
  multiple = false,
  maxSize = 5,
  maxFiles = 1,
  preview = true,
  onFilesChange,
  files,
  className = '',
  containerClassName = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  // Generate previews when files change
  React.useEffect(() => {
    if (!preview || files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews: string[] = [];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === files.length) {
            setPreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, [files, preview]);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    let errorMessage = '';

    // Validate each file
    for (const file of fileArray) {
      const validation = validateFile(file);
      if (validation) {
        errorMessage = validation;
        break;
      }
      validFiles.push(file);
    }

    if (errorMessage) {
      return;
    }

    // Check max files limit
    const totalFiles = multiple ? files.length + validFiles.length : validFiles.length;
    if (totalFiles > maxFiles) {
      return;
    }

    const finalFiles = multiple ? [...files, ...validFiles] : validFiles;
    onFilesChange(finalFiles);
  }, [files, multiple, maxFiles, onFilesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  }, [files, onFilesChange]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <motion.div 
      className={`space-y-3 ${containerClassName}`}
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

      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300
          ${isDragOver 
            ? 'border-purple-400 bg-purple-400/10 scale-105' 
            : hasError 
              ? 'border-red-400/50 bg-red-400/5' 
              : hasSuccess 
                ? 'border-green-400/50 bg-green-400/5'
                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragOver ? -5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Upload className="w-6 h-6 text-purple-300" />
          </div>
          
          <p className="text-white font-medium mb-1">
            {isDragOver ? 'Drop files here' : 'Click to upload or drag & drop'}
          </p>
          
          <p className="text-white/60 text-sm">
            {accept.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
            {multiple && ` (max ${maxFiles} files)`}
          </p>
        </motion.div>

        {/* Status Icons */}
        {hasError && (
          <div className="absolute top-3 right-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
        
        {hasSuccess && (
          <div className="absolute top-3 right-3 text-green-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        )}
      </motion.div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group bg-white/10 rounded-lg p-2 backdrop-blur-sm"
                >
                  {preview && previews[index] ? (
                    <img
                      src={previews[index]}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-20 bg-gray-600/50 rounded-md flex items-center justify-center">
                      <FileImage className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <p className="text-xs text-white/80 mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                  
                  <p className="text-xs text-white/60">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </p>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <AnimatePresence >
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
};