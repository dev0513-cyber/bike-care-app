import React, { useState, useEffect } from 'react';
import { adminAPI, apiUtils } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getContacts();
      setContacts(response.data.contacts);
      setError('');
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async () => {
    try {
      await adminAPI.deleteContact(selectedContact.id);
      setContacts(contacts.filter(contact => contact.id !== selectedContact.id));
      setShowDeleteDialog(false);
      setSelectedContact(null);
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const handleToggleResolved = async (contact) => {
    try {
      const response = await adminAPI.updateContact(contact.id, {
        is_resolved: !contact.is_resolved
      });
      setContacts(contacts.map(c => 
        c.id === contact.id ? response.data.contact : c
      ));
    } catch (error) {
      setError(apiUtils.formatErrorMessage(error));
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowViewModal(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Contact Management</h1>
        <p>Manage contact form submissions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="admin-content">
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.id}</td>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td className="subject-cell">
                    {contact.subject.length > 50 
                      ? `${contact.subject.substring(0, 50)}...` 
                      : contact.subject
                    }
                  </td>
                  <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${contact.is_resolved ? 'resolved' : 'unresolved'}`}>
                      {contact.is_resolved ? 'Resolved' : 'Unresolved'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleViewContact(contact)}
                      >
                        View
                      </button>
                      <button 
                        className={`btn btn-sm ${contact.is_resolved ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleResolved(contact)}
                      >
                        {contact.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Contact Modal */}
      {showViewModal && selectedContact && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>Contact Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-details">
                <div className="detail-group">
                  <label>Name:</label>
                  <span>{selectedContact.name}</span>
                </div>
                <div className="detail-group">
                  <label>Email:</label>
                  <span>{selectedContact.email}</span>
                </div>
                <div className="detail-group">
                  <label>Subject:</label>
                  <span>{selectedContact.subject}</span>
                </div>
                <div className="detail-group">
                  <label>Date:</label>
                  <span>{new Date(selectedContact.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-group">
                  <label>Status:</label>
                  <span className={`status-badge ${selectedContact.is_resolved ? 'resolved' : 'unresolved'}`}>
                    {selectedContact.is_resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
                <div className="detail-group full-width">
                  <label>Message:</label>
                  <div className="message-content">
                    {selectedContact.message}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className={`btn ${selectedContact.is_resolved ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => {
                    handleToggleResolved(selectedContact);
                    setShowViewModal(false);
                  }}
                >
                  {selectedContact.is_resolved ? 'Mark Unresolved' : 'Mark Resolved'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Contact"
        message={`Are you sure you want to delete the contact from "${selectedContact?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteContact}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedContact(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default AdminContacts;
