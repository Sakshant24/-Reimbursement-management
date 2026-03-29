import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OcrUpload = ({ onParsed }) => {
  const [scanning, setScanning] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m) // logging progress to console
      });
      const parsed = parseReceiptText(text);
      onParsed(parsed, file); // passes parsed fields + raw file
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to scan receipt. Please enter details manually.');
      onParsed({ amount: '', date: '', description: '', ocrRawText: '' }, file);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input 
        type="file" 
        accept="image/*,application/pdf" 
        onChange={handleFile} 
        disabled={scanning}
        className="block w-full text-sm text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-teal-500/10 file:text-teal-400
          hover:file:bg-teal-500/20 focus:outline-none transition-colors"
      />
      {scanning && <span className="text-sm text-teal-500 animate-pulse">Scanning receipt using AI... please wait.</span>}
    </div>
  );
};

function parseReceiptText(text) {
  // Amount: look for currency symbols + number
  const amountMatch = text.match(
    /(?:total|amount|rs\.?|inr|usd|\$|₹|€|£)[\s:]*([0-9,]+\.?[0-9]{0,2})/i
  );
  // Date: DD/MM/YYYY or MM-DD-YYYY or YYYY-MM-DD
  const dateMatch = text.match(
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/
  );
  // Merchant: first non-empty line (usually business name)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const merchant = lines[0] || '';

  return {
    amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : '',
    date: dateMatch ? dateMatch[1] : '',
    description: merchant,
    ocrRawText: text
  };
}

export default OcrUpload;
