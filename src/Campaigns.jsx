import React, { useState, useRef, useEffect } from 'react';
import { Upload, Users, Play, CheckCircle2, AlertCircle, Phone, FileSpreadsheet, Plus, X, Settings } from 'lucide-react';
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

  // Vapi Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [vapiConfig, setVapiConfig] = useState({
    privateKey: '',
    phoneNumberId: '',
    assistantId: ''
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('vapiOutboundConfig');
    if (savedConfig) {
      setVapiConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('vapiOutboundConfig', JSON.stringify(vapiConfig));
    setShowSettings(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
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
    if (!vapiConfig.privateKey || !vapiConfig.phoneNumberId || !vapiConfig.assistantId) {
      alert("Please configure your Vapi API Settings first!");
      setShowSettings(true);
      return;
    }

    setIsCalling(true);
    
    for (let i = 0; i < contacts.length; i++) {
      if (callStatus[i] === 'completed') continue;

      const contact = contacts[i];
      // Try to find the phone number column
      const phoneKey = Object.keys(contact).find(k => k.toLowerCase().includes('phone') || k.toLowerCase().includes('number'));
      const phoneNumber = contact[phoneKey];

      if (!phoneNumber) {
        setCallStatus(prev => ({ ...prev, [i]: 'failed' }));
        continue;
      }

      setCallStatus(prev => ({ ...prev, [i]: 'calling' }));
      
      try {
        const response = await fetch('https://api.vapi.ai/call/phone', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${vapiConfig.privateKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneNumberId: vapiConfig.phoneNumberId,
            assistantId: vapiConfig.assistantId,
            customer: {
              number: phoneNumber,
              name: contact.Name || contact.name || 'Customer'
            }
          })
        });

        if (!response.ok) {
          throw new Error('Call failed to initiate');
        }

        setCallStatus(prev => ({ ...prev, [i]: 'completed' }));
        
        // Wait 2 seconds before dialing the next person to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      } catch (error) {
        console.error("Vapi Error:", error);
        setCallStatus(prev => ({ ...prev, [i]: 'failed' }));
      }
    }

    setIsCalling(false);
  };

  const handleAddManualContact = () => {
    if (!manualContact.Name || !manualContact.Phone) return;
    
    const newIndex = contacts.length;
    setContacts([...contacts, manualContact]);
    setCallStatus(prev => ({ ...prev, [newIndex]: 'pending' }));
    
    setManualContact({ Name: '', Phone: '', Email: '' });
    setIsAddingManual(false);
  };

  const headers = contacts.length > 0 
    ? Object.keys(contacts[0]) 
    : ['Name', 'Phone', 'Email'];

  return (
    <div className="campaigns-container">
      <div className="dashboard-header" style={{ position: 'relative' }}>
        <button 
          className="secondary-btn icon-only" 
          style={{ position: 'absolute', right: 0, top: 0 }}
          onClick={() => setShowSettings(true)}
          title="API Settings"
        >
          <Settings size={20} />
        </button>
        <div className="header-logo">
          <Phone size={32} color="var(--accent)" />
          <h1>Auto <span className="subtitle">Dialer</span></h1>
        </div>
        <p className="header-desc">Upload a CSV list of contacts, or add them manually. Your AI Agent will automatically call them to pitch your product and book meetings.</p>
      </div>

      {showSettings && (
        <div className="settings-modal" style={modalOverlayStyle}>
          <div className="settings-content" style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Vapi API Settings</h3>
              <button className="icon-only" onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              To make real phone calls, you must provide your Vapi Private API Key, the Phone Number ID to dial from, and your Assistant ID.
            </p>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <input 
                type="password" 
                placeholder="Vapi Private API Key" 
                value={vapiConfig.privateKey}
                onChange={e => setVapiConfig({...vapiConfig, privateKey: e.target.value})}
                style={{ width: '100%', paddingLeft: '16px' }}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Vapi Phone Number ID" 
                value={vapiConfig.phoneNumberId}
                onChange={e => setVapiConfig({...vapiConfig, phoneNumberId: e.target.value})}
                style={{ width: '100%', paddingLeft: '16px' }}
              />
            </div>
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Vapi Assistant ID" 
                value={vapiConfig.assistantId}
                onChange={e => setVapiConfig({...vapiConfig, assistantId: e.target.value})}
                style={{ width: '100%', paddingLeft: '16px' }}
              />
            </div>
            <button className="primary-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={saveConfig}>
              Save Settings
            </button>
          </div>
        </div>
      )}

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

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
};

const modalContentStyle = {
  background: 'var(--bg-panel)',
  padding: '30px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '400px',
  border: '1px solid var(--border)',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
};
