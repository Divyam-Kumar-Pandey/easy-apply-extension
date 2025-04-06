import React, { useEffect, useState, useRef } from 'react';
import FileUpload from './components/FileUpload';
import ActionButtons from './components/ActionButtons';

function App() {
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // get token from extension local storage
  useEffect(() => {
    chrome.storage.local.get('accessToken', (result) => {
      setAccessToken(result.accessToken.accessToken);
    });
  }, []);

  return (
    <div className="p-4 flex gap-4">
      <section id="resume-section">
        <h1>Hello World</h1>
      </section>
      <section id="credits-usage-section">
        <h1>Hello World</h1>
      </section>
    </div>
  );
}

export default App;
