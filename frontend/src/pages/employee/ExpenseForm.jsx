import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import OcrUpload from '../../components/OcrUpload';

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: '',
    category: 'OTHER',
    description: '',
    date: '',
    ocrRawText: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOcrParsed = (parsedData, rawFile) => {
    setFile(rawFile);
    if (parsedData.amount) setFormData(prev => ({ ...prev, amount: parsedData.amount }));
    if (parsedData.description) setFormData(prev => ({ ...prev, description: parsedData.description }));
    if (parsedData.ocrRawText) setFormData(prev => ({ ...prev, ocrRawText: parsedData.ocrRawText }));
    
    // Auto-align date formats strictly for the controlled HTML date node block
    if (parsedData.date) {
      let d = parsedData.date;
      if (d.includes('/')) {
        const parts = d.split('/');
        if (parts[0].length === 2 && parts[2]?.length === 4) {
          d = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      setFormData(prev => ({ ...prev, date: d }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = new FormData();
    payload.append('amount', formData.amount);
    payload.append('currency', formData.currency.toUpperCase());
    payload.append('category', formData.category);
    payload.append('description', formData.description);
    
    let isoDate;
    try {
      isoDate = new Date(formData.date).toISOString();
    } catch {
      isoDate = new Date().toISOString(); 
    }
    payload.append('date', isoDate);
    
    if (formData.ocrRawText) payload.append('ocrRawText', formData.ocrRawText);
    if (file) payload.append('receipt', file);

    try {
      await api.post('/expenses', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'SUBMISSION_FAILED. VERIFY CONNECTION.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold font-mono tracking-wider text-accent">Submit New Expense</h2>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-danger/10 border-l-4 border-danger text-danger text-sm font-mono tracking-wider animate-pulse">
          [ERROR] {error}
        </div>
      )}

      <div className="bg-surface border border-border p-6 rounded-lg shadow-2xl mb-6 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent/20"></div>
        <h3 className="text-xs font-mono text-muted mb-4 uppercase tracking-widest font-bold border-b border-border pb-2">AI Neural Receipt Scanner (Tesseract OCR)</h3>
        <OcrUpload onParsed={handleOcrParsed} />
        <p className="text-[10px] uppercase font-mono tracking-widest mt-3 text-muted">Neural parse auto-attaches proof receipt and pre-fills form data down below.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 rounded-lg shadow-2xl space-y-8 relative">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
        
        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Amount</label>
            <input 
              type="number" step="0.01" required min="0.01"
              className="w-full font-mono text-lg tracking-wider"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Currency Code</label>
            <input 
              type="text" required maxLength="3" minLength="3"
              className="w-full font-mono text-lg uppercase tracking-wider"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value.toUpperCase()})}
              placeholder="USD"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Category</label>
            <select 
              required
              className="w-full font-mono text-sm tracking-wider"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="TRAVEL">TRAVEL</option>
              <option value="FOOD">FOOD</option>
              <option value="ACCOMMODATION">ACCOMMODATION</option>
              <option value="OFFICE_SUPPLIES">OFFICE_SUPPLIES</option>
              <option value="CONFERENCE">CONFERENCE</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Transaction Date</label>
            <input 
              type="date" required
              className="w-full font-mono text-sm tracking-wider [color-scheme:dark]"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Description / Merchant</label>
          <input 
            type="text" required
            className="w-full font-mono text-sm tracking-widest"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Merchant name or purpose"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-border">
          <button 
            type="button" 
            onClick={() => navigate('/employee')}
            className="px-6 py-2 border border-border text-muted font-mono tracking-widest hover:text-primary hover:border-muted transition-colors rounded text-[11px] uppercase bg-base"
          >
            Cancel
          </button>
          <button 
            type="submit" disabled={loading}
            className="bg-accent/10 border border-accent text-accent px-6 py-2 font-mono text-[11px] font-bold tracking-widest hover:bg-accent hover:text-base transition-colors rounded uppercase disabled:opacity-50 shadow-[0_0_10px_rgba(0,229,160,0.2)]"
          >
            {loading ? 'Submitting...' : 'Submit Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
