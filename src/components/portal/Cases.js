import React, { useState, useEffect } from 'react';
import styles from './Cases.module.css';

const Cases = () => {
    const [cases, setCases] = useState(() => {
        // Load from localStorage on initial render
        const storedCases = localStorage.getItem('cases');
        return storedCases ? JSON.parse(storedCases) : [];
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCase, setNewCase] = useState({
        caseNumber: '',
        caseName: '',
        type: '',
        daysOpen: '',
        status: 'Pre-litigation',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCase({ ...newCase, [name]: value });
    };

    const handleSaveCase = () => {
        if (!newCase.caseNumber || !newCase.caseName || !newCase.type || !newCase.daysOpen) {
            alert('Please fill in all fields before saving.');
            return;
        }

        const updatedCases = [...cases, newCase];
        setCases(updatedCases); // Add the new case to the list
        localStorage.setItem('cases', JSON.stringify(updatedCases)); // Save to localStorage
        setNewCase({ caseNumber: '', caseName: '', type: '', daysOpen: '', status: 'Pre-litigation' }); // Reset the form
        setIsModalOpen(false); // Close the modal
    };

    const handleDeleteCase = (index) => {
        const updatedCases = cases.filter((_, i) => i !== index); // Handle deletion of cases
        setCases(updatedCases); // Update state
        localStorage.setItem('cases', JSON.stringify(updatedCases)); // Save updated cases to localStorage
    };

    return (
        <div className={styles.container}>
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
                        <th>ACTION</th> {/* Added Action Column */}
                    </tr>
                </thead>
                <tbody>
                    {cases.map((c, index) => (
                        <tr key={index}>
                            <td>{c.caseNumber}</td>
                            <td>{c.caseName}</td>
                            <td>{c.type}</td>
                            <td>{c.daysOpen}</td>
                            <td>{c.status}</td>
                            <td>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDeleteCase(index)}
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
        </div>
    );
};

export default Cases;
