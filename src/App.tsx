declare const chrome: {
  storage: {
    local: {
      get: (keys: string[], callback: (result: any) => void) => void;
      set: (items: object, callback?: () => void) => void;
      remove: (keys: string, callback?: () => void) => void;
    };
  };
};

import React, { useEffect, useState, useRef } from 'react';
import pdfUtil from 'pdf-to-text';
import FileUpload from './components/FileUpload';
import ActionButtons from './components/ActionButtons';

function App() {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chrome.storage.local.get(['resumeText'], (result: { resumeText: any }) => {
      if (result.resumeText) {
        setExtractedText(result.resumeText);
      }
    });
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('file', file);
    if (file) {
      // Create a temporary URL for the file
      const filePath = URL.createObjectURL(file);

      console.log('filePath', filePath);
      
      // Extract text from all pages
      pdfUtil.pdfToText(filePath, (err: Error | null, data: string) => {
        // Clean up the temporary URL
        URL.revokeObjectURL(filePath);

        console.log('data', data);

        if (err) {
          console.error('Error extracting text:', err);
          setStatusMessage('Failed to extract text from PDF');
          setTimeout(() => setStatusMessage(''), 2000);
          return;
        }

        setExtractedText(data);
        setStatusMessage('PDF text extracted successfully!');
        setTimeout(() => setStatusMessage(''), 2000);
      });
    } else {
      setStatusMessage('Please select a PDF file first.');
      console.log('no file');
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };

  const handleSave = () => {
    if (extractedText) {
      chrome.storage.local.set({ resumeText: extractedText }, () => {
        setStatusMessage('Resume saved successfully!');
        setTimeout(() => setStatusMessage(''), 2000);
      });
    } else {
      setStatusMessage('Please select a PDF file first.');
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };

  const handleClear = () => {
    chrome.storage.local.remove('resumeText', () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setExtractedText('');
      setStatusMessage('Resume cleared successfully!');
      setTimeout(() => setStatusMessage(''), 2000);
    });
  };

  return (
    <div className="p-4">
      <FileUpload fileInputRef={fileInputRef} onFileChange={handleFileChange} />
      <ActionButtons 
        onSave={handleSave}
        onClear={handleClear}
        statusMessage={statusMessage}
      />
      {extractedText && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Extracted Text:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{extractedText}</p>
        </div>
      )}
    </div>
  );
}

export default App;
