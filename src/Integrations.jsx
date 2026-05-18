import React from 'react';
import { Zap, Code, Database, Mail, Webhook, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const integrations = [
  { id: 'zapier', name: 'Zapier', icon: <Zap size={24} color="#FF4A00" />, desc: 'Connect to 5000+ apps and automate workflows.', status: 'Connected' },
  { id: 'hubspot', name: 'HubSpot', icon: <Database size={24} color="#FF7A59" />, desc: 'Sync leads and call notes automatically.', status: 'Connect' },
  { id: 'salesforce', name: 'Salesforce', icon: <Database size={24} color="#00A1E0" />, desc: 'Push call recordings and transcripts to CRM.', status: 'Connect' },
  { id: 'mailchimp', name: 'Mailchimp', icon: <Mail size={24} color="#FFE01B" />, desc: 'Add new leads directly to mailing lists.', status: 'Connect' },
  { id: 'webhook', name: 'Webhooks', icon: <Webhook size={24} color="#6C5CE7" />, desc: 'Send real-time call events to any endpoint.', status: 'Configure' },
  { id: 'api', name: 'REST API', icon: <Code size={24} color="#00B894" />, desc: 'Build custom integrations with our API.', status: 'View Docs' },
];

export default function Integrations() {
  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="dashboard-header">
        <div className="header-logo">
          <Zap size={32} color="var(--accent)" />
          <h1>App <span className="subtitle">Integrations</span></h1>
        </div>
        <p className="header-desc">Connect your AI Agent to your favorite tools. Sync leads, push transcripts to your CRM, and automate workflows seamlessly.</p>
      </div>

      <div className="integrations-grid">
        {integrations.map((intg, i) => (
          <motion.div 
            key={intg.id} 
            className="integration-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="integration-header">
              <div className="integration-icon">
                {intg.icon}
              </div>
              <h3>{intg.name}</h3>
            </div>
            <p>{intg.desc}</p>
            <button className={`intg-btn ${intg.status === 'Connected' ? 'connected' : ''}`}>
              {intg.status}
              {intg.status !== 'Connected' && <ArrowRight size={16} />}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
