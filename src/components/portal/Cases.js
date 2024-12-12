import React, { useState, useEffect } from 'react';
import styles from './Cases.module.css';
import Notification from './Notification';

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [currentCaseId, setCurrentCaseId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [newCase, setNewCase] = useState({
        caseNumber: '',
        caseName: '',
        type: '',
        daysOpen: '',
        status: 'Pre-litigation',
    });
    const [uploadedFiles, setUploadedFiles] = useState({
        legalDocuments: [],
        evidence: [],
    });

    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    // Fetch cases from the backend
    useEffect(() => {
        fetch('http://localhost:5000/cases')
            .then((response) => response.json())
            .then((data) => setCases(data))
            .catch((error) => console.error('Error fetching cases:', error));
    }, []);


    // Fetch cases from the backend
    useEffect(() => {
        fetch('http://localhost:5000/cases')
            .then((response) => response.json())
            .then((data) => setCases(data))
            .catch((error) => console.error('Error fetching cases:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCase({ ...newCase, [name]: value });
    };

    const handleSaveCase = () => {
        if (!newCase.caseNumber || !newCase.caseName || !newCase.type || !newCase.daysOpen) {
            showNotification('Please fill in all fields before saving!','error');
            return;
        }

        fetch('http://localhost:5000/cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCase),
        })
            .then((response) => response.json())
            .then((data) => {
                setCases([...cases, data]); // Update state with new case
                setNewCase({ caseNumber: '', caseName: '', type: '', daysOpen: '', status: 'Pre-litigation' }); // Reset form
                setIsModalOpen(false); // Close modal
            })
            .catch((error) => console.error('Error saving case:', error));
    };

    const handleDeleteCase = (id) => {
        fetch(`http://localhost:5000/cases/${id}`, { method: 'DELETE' })
            .then(() => {
                setCases(cases.filter((c) => c.id !== id)); // Remove from state
            })
            .catch((error) => console.error('Error deleting case:', error));
    };

    const handleFileChange = (e, type) => {
        setUploadedFiles((prevState) => ({
            ...prevState,
            [type]: [...prevState[type], ...e.target.files],
        }));
    };

    const handleAttachFiles = (caseId) => {
        setCurrentCaseId(caseId);
        setIsFileModalOpen(true);
    };

    const handleSaveFiles = () => {
        if (!currentCaseId) return;

        const formData = new FormData();
        uploadedFiles.legalDocuments.forEach((file) => formData.append('legalDocuments', file));
        uploadedFiles.evidence.forEach((file) => formData.append('evidence', file));

        fetch(`http://localhost:5000/cases/${currentCaseId}/upload-files`, {
            method: 'POST',
            body: formData,
        })
            .then((response) => response.json())
            .then(() => {
                showNotification('Files uploaded successfully!','error');
                setIsFileModalOpen(false);
                setUploadedFiles({ legalDocuments: [], evidence: [] });
            })
            .catch((error) => console.error('Error uploading files:', error));
    };

    return (
        <div className={styles.container}>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className={styles.header}>
                <h4>Case Listing</h4>
                <button className={styles.newCaseButton} onClick={() => setIsModalOpen(true)}>New Case</button>
            </div>
            <table className={styles.caseTable}>
                <thead>
                    <tr>
                        <th>CASE NUMBER</th>
                        <th>CASE NAME</th>
                        <th>TYPE</th>
                        <th>DAYS OPEN</th>
                        <th>STATUS</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {cases.map((c) => (
                        <tr key={c.id}>
                            <td>{c.case_number}</td>
                            <td>{c.case_name}</td>
                            <td>{c.type}</td>
                            <td>{c.days_open}</td>
                            <td>{c.status}</td>
                            <td>
                                <button
                                    className={styles.attachButton}
                                    onClick={() => handleAttachFiles(c.id)}
                                >
                                    Attach Files
                                </button>
                            </td>
                            <td>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteCase(c.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Add New Case</h3>
                        <label>
                            Case Number:
                            <input
                                type="text"
                                name="caseNumber"
                                value={newCase.caseNumber}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Case Name:
                            <input
                                type="text"
                                name="caseName"
                                value={newCase.caseName}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Type:
                            <input
                                type="text"
                                name="type"
                                value={newCase.type}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Days Open:
                            <input
                                type="text"
                                name="daysOpen"
                                value={newCase.daysOpen}
                                onChange={handleInputChange}
                            />
                        </label>
                        <label>
                            Status:
                            <select
                                name="status"
                                value={newCase.status}
                                onChange={handleInputChange}
                            >
                                <option value="Pre-litigation">Pre-litigation</option>
                                <option value="Litigation">Litigation</option>
                                <option value="Post-litigation">Post-litigation</option>
                            </select>
                        </label>
                        <div className={styles.modalActions}>
                            <button onClick={handleSaveCase}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {isFileModalOpen && (
                <div className={styles.filemodal}>
                    <div className={styles.filemodalContent}>
                        <h3>Attach Files</h3>
                        <div className={styles.fileUploadSection}>
                            <div>
                                <h4>Legal Documents</h4>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'legalDocuments')}
                                />
                                <p>{uploadedFiles.legalDocuments.length} file(s) attached</p>
                                <ul className={styles.fileList}>
                                    {uploadedFiles.legalDocuments.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4>Evidence</h4>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => handleFileChange(e, 'evidence')}
                                />
                                <p>{uploadedFiles.evidence.length} file(s) attached</p>
                                <ul className={styles.fileList}>
                                    {uploadedFiles.evidence.map((file, index) => (
                                        <li key={index}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className={styles.filemodalActions}>
                            <button onClick={handleSaveFiles}>Save</button>
                            <button 
                                onClick={() => {
                                    setUploadedFiles({ legalDocuments: [], evidence: [] });
                                    setIsFileModalOpen(false);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cases;
