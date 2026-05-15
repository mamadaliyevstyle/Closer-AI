import React, { useState } from 'react';
import { Copy, CheckCircle2, UserCircle, Briefcase, Tag, Code2, Sparkles, HelpCircle } from 'lucide-react';
import Widget from './Widget';

export default function Dashboard() {
  const [companyName, setCompanyName] = useState('Closer AI');
  const [productInfo, setProductInfo] = useState('high-end AI solutions');
  const [agentName, setAgentName] = useState('Sarah');
  const [copied, setCopied] = useState(false);

  const config = { companyName, productInfo, agentName };

  const embedCode = `<!-- Closer AI Widget -->
<script>
  window.CloserAIConfig = {
    companyName: "${companyName}",
    productInfo: "${productInfo}",
    agentName: "${agentName}"
  };
</script>
<link rel="stylesheet" href="https://your-domain.com/assets/widget.css">
<script type="module" src="https://your-domain.com/assets/widget.js"></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-logo">
          <Sparkles size={32} color="var(--accent)" />
          <h1>Closer AI <span className="subtitle">Setup Guide</span></h1>
        </div>
        <p className="header-desc">Welcome! Follow the simple steps below to train your new AI Sales Representative and install it on your website in under 5 minutes.</p>
      </div>

      <div className="dashboard-content">
        <div className="config-panel">
          
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-number">1</div>
              <h3>Name Your AI Representative</h3>
            </div>
            <p className="step-instruction">Give your AI a friendly, human-sounding name. Customers trust agents with real names more than generic "chatbots".</p>
            <div className="input-group">
              <UserCircle className="input-icon" size={20} />
              <input 
                type="text" 
                value={agentName} 
                onChange={e => setAgentName(e.target.value)} 
                placeholder="e.g. Sarah, Michael, Jessica"
              />
            </div>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-number">2</div>
              <h3>Your Business Name</h3>
            </div>
            <p className="step-instruction">What is the name of your company or store? The AI will use this when greeting and reassuring customers.</p>
            <div className="input-group">
              <Briefcase className="input-icon" size={20} />
              <input 
                type="text" 
                value={companyName} 
                onChange={e => setCompanyName(e.target.value)} 
                placeholder="e.g. Super Sneakers"
              />
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-header">
              <div className="step-number">3</div>
              <h3>What do you sell?</h3>
            </div>
            <p className="step-instruction">Explain what your business offers in simple, plain English. The AI will use this knowledge to answer questions and naturally pitch your product.</p>
            <div className="input-group align-top">
              <Tag className="input-icon" size={20} style={{ marginTop: '12px' }} />
              <textarea 
                rows={4}
                value={productInfo} 
                onChange={e => setProductInfo(e.target.value)} 
                placeholder="e.g. We sell custom, high-quality running shoes for professional athletes and casual runners."
              />
            </div>
          </div>

          {/* Step 4 */}
          <div className="step-card highlight-card">
            <div className="step-header">
              <div className="step-number success">4</div>
              <h3>Install on your Website</h3>
            </div>
            <p className="step-instruction">You are all set! Just click the button below to copy your unique code. Paste this code directly into your website (like Shopify, WordPress, or Webflow).</p>
            
            <div className="info-box">
              <HelpCircle size={18} />
              <span><strong>Where do I paste this?</strong> Paste it anywhere inside your website's HTML code. Usually right before the closing <code>&lt;/head&gt;</code> or <code>&lt;/body&gt;</code> tag works best!</span>
            </div>

            <div className="code-block-wrapper">
              <pre><code>{embedCode}</code></pre>
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copied ? 'Copied to Clipboard!' : 'Copy My Code'}
              </button>
            </div>
          </div>

        </div>

        <div className="preview-panel">
          <div className="sticky-preview">
            <div className="preview-header">
              <Sparkles size={24} color="var(--accent)" />
              <h2>Live Preview</h2>
            </div>
            <p>Your AI Sales Agent is sitting right there in the bottom right corner of your screen! Click the floating button to test it out.</p>
            <div className="preview-features">
              <div className="feature-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Currently named <strong>{agentName}</strong></span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Working for <strong>{companyName}</strong></span>
              </div>
              <div className="feature-item">
                <CheckCircle2 size={16} color="var(--success)" />
                <span>Trained to sell your product</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Widget config={config} />
    </div>
  );
}
