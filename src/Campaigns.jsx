import React, { useState, useRef } from 'react';
import { Upload, Users, Play, CheckCircle2, AlertCircle, Phone, FileSpreadsheet, Plus, X } from 'lucide-react';
import Papa from 'papaparse';

export default function Campaigns() {
  const [contacts, setContacts] = useState([]);
  const [campaignName, setCampaignName] = useState('New Campaign');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState({}); // { index: 'pending' | 'calling' | 'completed' | 'failed' }
  const fileInputRef = useRef(null);
  
  // Manual Contact State
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualContact, setManualContact] = useState({ Name: '', Phone: '', Email: '' });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // If we already have contacts, append. Otherwise, set.
          const newData = results.data;
          setContacts(prev => [...prev, ...newData]);
          
          setCallStatus(prev => {
            const newStatus = { ...prev };
            const startIndex = Object.keys(prev).length;
            newData.forEach((_, index) => {
              newStatus[startIndex + index] = 'pending';
            });
            return newStatus;
          });
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
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      setCallStatus(prev => ({ ...prev, [i]: 'completed' }));
    }

    setIsCalling(false);
  };

  const handleAddManualContact = () => {
    if (!manualContact.Name || !manualContact.Phone) return;
    
    const newIndex = contacts.length;
    setContacts([...contacts, manualContact]);
    setCallStatus(prev => ({ ...prev, [newIndex]: 'pending' }));
    
    // Reset form
    setManualContact({ Name: '', Phone: '', Email: '' });
    setIsAddingManual(false);
  };

  // Dynamically get headers. Default to Name, Phone, Email if empty.
  const headers = contacts.length > 0 
    ? Object.keys(contacts[0]) 
    : ['Name', 'Phone', 'Email'];

  return (
    <div className="campaigns-container">
      <div className="dashboard-header">
        <div className="header-logo">
          <Phone size={32} color="var(--accent)" />
          <h1>Auto <span className="subtitle">Dialer</span></h1>
        </div>
        <p className="header-desc">Upload a CSV list of contacts, or add them manually. Your AI Agent will automatically call them to pitch your product and book meetings.</p>
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
                <button className="secondary-btn" onClick={() => setIsAddingManual(true)}>
                  <Plus size={18} />
                  Add Contact
                </button>
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

          {isAddingManual && (
            <div className="manual-add-form">
              <h4>Add New Contact</h4>
              <div className="manual-inputs">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={manualContact.Name}
                  onChange={e => setManualContact({...manualContact, Name: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="Phone Number" 
                  value={manualContact.Phone}
                  onChange={e => setManualContact({...manualContact, Phone: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  value={manualContact.Email}
                  onChange={e => setManualContact({...manualContact, Email: e.target.value})}
                />
                <button className="primary-btn" onClick={handleAddManualContact}>Save</button>
                <button className="secondary-btn icon-only" onClick={() => setIsAddingManual(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>
          )}

          {contacts.length === 0 && !isAddingManual ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileSpreadsheet size={48} />
              </div>
              <h3>No Contacts Added</h3>
              <p>Upload a .csv file or manually add contacts to begin.</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button className="secondary-btn" onClick={() => setIsAddingManual(true)}>
                  <Plus size={18} />
                  Add Manually
                </button>
                <button className="primary-btn" onClick={() => fileInputRef.current.click()}>
                  <Upload size={18} />
                  Select CSV File
                </button>
              </div>
            </div>
          ) : contacts.length > 0 ? (
            <div className="table-container">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    {headers.map((header, i) => (
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
                      {headers.map((header, j) => (
                        <td key={j}>{contact[header] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
