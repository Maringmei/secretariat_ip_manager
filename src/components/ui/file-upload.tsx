
'use client';

import { useState, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import { X, File as FileIcon, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: FileList | null) => void;
  fileType?: string;
  className?: string;
}

export function FileUpload({ onFileSelect, fileType = '*', className }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      onFileSelect(files);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
        const droppedFile = files[0];
        const allowedTypes = fileType.split(',').map(t => t.trim());
        if(allowedTypes.includes(droppedFile.type) || fileType === '*') {
            setFile(droppedFile);
            onFileSelect(files);
        }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer border-input hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <UploadCloud className="w-8 h-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          {fileType}
        </p>
        <Input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={fileType}
        />
      </div>
      {file && (
        <div className="flex items-center p-2 mt-2 space-x-2 border rounded-md bg-muted/50">
          <FileIcon className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-foreground truncate flex-1" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(2)} KB
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleRemoveFile}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

    