import React, { useState, useRef } from 'react';
import { Upload, Users, Play, CheckCircle2, AlertCircle, Phone, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

export default function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState({}); // { index: 'pending' | 'calling' | 'completed' | 'failed' }
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setContacts(results.data);
          const initialStatus = {};
          results.data.forEach((_, index) => {
            initialStatus[index] = 'pending';
          });
          setCallStatus(initialStatus);
        },
      });
    }
  };

  const startCampaign = async () => {
    setIsCalling(true);
    
    // Simulate dialing each contact one by one
    for (let i = 0; i < contacts.length; i++) {
      if (callStatus[i] === 'completed') continue; // Skip already called

      setCallStatus(prev => ({ ...prev, [i]: 'calling' }));
      
      // Simulate API call to Vapi Outbound (POST /call/phone)
      // In a real app, you would use fetch() with your Vapi Private Key
      // fetch('https://api.vapi.ai/call/phone', { ... })
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      setCallStatus(prev => ({ ...prev, [i]: 'completed' }));
    }

    setIsCalling(false);
  };

  return (
    <div className="campaigns-container">
      <div className="dashboard-header">
        <div className="header-logo">
          <Phone size={32} color="var(--accent)" />
          <h1>Auto <span className="subtitle">Dialer</span></h1>
        </div>
        <p className="header-desc">Upload a CSV list of contacts, and your AI Agent will automatically call them to pitch your product and book meetings.</p>
      </div>

      <div className="campaign-content">
        <div className="campaign-panel">
          <div className="campaign-header-actions">
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input 
                type="text" 
                value={campaignName} 
                onChange={(e) => setCampaignName(e.target.value)} 
                placeholder="Campaign Name"
                className="campaign-name-input"
              />
            </div>
            <div className="action-buttons">
               <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileUpload} 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                />
                <button className="secondary-btn" onClick={() => fileInputRef.current.click()}>
                  <Upload size={18} />
                  Upload CSV
                </button>
                <button 
                  className={`primary-btn ${isCalling ? 'pulse' : ''}`} 
                  onClick={startCampaign}
                  disabled={contacts.length === 0 || isCalling}
                >
                  <Play size={18} />
                  {isCalling ? 'Dialing...' : 'Start Campaign'}
                </button>
            </div>
          </div>

          {contacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileSpreadsheet size={48} />
              </div>
              <h3>No Contacts Uploaded</h3>
              <p>Upload a .csv file containing columns like Name, Phone Number, and Email to begin.</p>
              <button className="primary-btn mt-4" onClick={() => fileInputRef.current.click()}>
                <Upload size={18} />
                Select CSV File
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    {Object.keys(contacts[0] || {}).map((header, i) => (
                      <th key={i}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, i) => (
                    <tr key={i} className={`status-${callStatus[i]}`}>
                      <td className="status-cell">
                        {callStatus[i] === 'pending' && <span className="badge badge-pending">Pending</span>}
                        {callStatus[i] === 'calling' && <span className="badge badge-calling pulse"><Phone size={12}/> Dialing</span>}
                        {callStatus[i] === 'completed' && <span className="badge badge-completed"><CheckCircle2 size={12}/> Completed</span>}
                        {callStatus[i] === 'failed' && <span className="badge badge-failed"><AlertCircle size={12}/> Failed</span>}
                      </td>
                      {Object.values(contact).map((val, j) => (
                        <td key={j}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
