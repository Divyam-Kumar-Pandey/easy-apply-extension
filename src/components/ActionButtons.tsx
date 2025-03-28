import React from 'react';
import CloudIcon from './CloudIcon';

interface ActionButtonsProps {
  onSave: () => void;
  onClear: () => void;
  statusMessage: string;
}

const ActionButtons = ({ onSave, onClear, statusMessage }: ActionButtonsProps) => (
  <div className="mt-4 flex items-center justify-between gap-4">
    <button 
      onClick={onSave}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      <div className="flex items-center justify-center">
        <CloudIcon />
      </div>
      <span>Save</span>
    </button>

    <div className="text-sm text-gray-600">{statusMessage}</div>
    <button 
      onClick={onClear}
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
    >
      Clear
    </button>
  </div>
);

export default ActionButtons; 