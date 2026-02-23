import React from 'react';
import { useDropzone } from 'react-dropzone';

export default function DocumentDropzone({ onDrop, loading }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    maxFiles: 1,
    disabled: loading,
  });

  return (
    <div
      {...getRootProps()}
      className={`card p-8 text-center cursor-pointer border-2 border-dashed transition-colors ${
        loading ? 'opacity-50 cursor-not-allowed' :
        isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
      }`}
    >
      <input {...getInputProps()} />
      <div className="text-4xl mb-3">📎</div>
      <p className="text-sm text-gray-600 font-medium">
        {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
      </p>
      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, or PDF up to 10MB</p>
    </div>
  );
}
