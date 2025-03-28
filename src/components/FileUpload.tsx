import React from 'react';
import PDFIcon from './PDFIcon';

interface FileUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload = ({ fileInputRef, onFileChange }: FileUploadProps) => (
  <label 
    htmlFor="file" 
    className="h-[200px] w-[200px] flex flex-col items-center justify-center gap-5 cursor-pointer border-2 border-dashed border-[#cacaca] bg-white p-6 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center justify-center">
      <PDFIcon />
    </div>
    <div className="text-gray-600 font-normal">
      <span>Click to upload resume</span>
    </div>
    <input 
      type="file" 
      id="file" 
      accept="application/pdf"
      className="hidden" 
      ref={fileInputRef}
      onChange={onFileChange}
    />
  </label>
);

export default FileUpload; 