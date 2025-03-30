import React, { useEffect, useState, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ActionButtons from './components/ActionButtons';

function App() {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);




  return (
    <div className="p-4">
      <FileUpload fileInputRef={fileInputRef} onFileChange={() => {}} />
      <ActionButtons 
        onSave={() => {}}
        onClear={() => {}}
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
