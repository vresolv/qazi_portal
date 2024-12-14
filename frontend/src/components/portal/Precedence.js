import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import styles from './Precedence.module.css';
import Notification from './Notification';

const PrecedenceAnalysis = () => {
    const [precedenceQuery, setLegalQuery] = useState('');
    const [precedenceAnalysis, setAnalysisResult] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [iscase, setCases] = useState([]);
    const [selectedCases, setSelectedCase] = useState(null);
    const [caseRelevantFiles, setRelevantFiles] = useState([]);
    const [pdfFileset, setPdfFile] = useState(null);
    const [isfileNameSet, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState({ legalDocuments: [], evidence: [] });
    const [currentCaseId, setCurrentCaseId] = useState(null);
    const [tempSelectedCase, setTempSelectedCase] = useState(null);
    const [notification, setNotification] = useState(null);
    
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    
    useEffect(() => {
        // Fetch cases from the backend
        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
        fetch(`${EXPRESS_API_BASE_URL}/cases`)
            .then((response) => response.json())
            .then((data) => setCases(data))
            .catch((error) => console.error('Error fetching cases:', error));

        // Load selected case and relevant files from localStorage
        const savedCase = sessionStorage.getItem('selectedCases');
        if (savedCase) {
            const parsedCase = JSON.parse(savedCase);
            setSelectedCase(parsedCase);
            fetchRelevantFiles(parsedCase.id);
        }
    }, []);

    // Load state from sessionStorage
    useEffect(() => {
        const savedQuery = sessionStorage.getItem('precedenceQuery');
        const savedAnalysis = sessionStorage.getItem('precedenceAnalysis');

        if (savedQuery) setLegalQuery(savedQuery);
        if (savedAnalysis) setAnalysisResult(savedAnalysis);
    }, []);

    useEffect(() => {
        const saveToSessionStorage = () => {
            sessionStorage.setItem('precedenceQuery', precedenceQuery);
            sessionStorage.setItem('precedenceAnalysis', precedenceAnalysis);
        };
    
        saveToSessionStorage();
    }, [precedenceQuery, precedenceAnalysis]);



    // Fetch attched files for case
    const fetchRelevantFiles = (caseId) => {
        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
        fetch(`${EXPRESS_API_BASE_URL}/cases/${caseId}/files`)
            .then((response) => response.json())
            .then((data) => setRelevantFiles(data))
            .catch((error) => console.error('Error fetching files:', error));
    };
    
    const handleCaseSelect = () => {
        if (tempSelectedCase) {
            setSelectedCase(tempSelectedCase);
            sessionStorage.setItem('selectedCases', JSON.stringify(tempSelectedCase));
            fetchRelevantFiles(tempSelectedCase.id);
        }
        setIsModalOpen(false); // Close the modal
    };

    const handleSelectFile = (fileId) => {
        if (!fileId) {
            console.error('File ID is undefined');
            return;
        }
    
        // If the file is already selected, unselect it
        if (selectedFileId === fileId) {
            setSelectedFileId(null);
            setPdfFile(null);
            setFileName('');
            showNotification('File unselected successfully.', 'info');
            return;
        }
    
        // Select the file
        const selectedFile = caseRelevantFiles.find((file) => file.id === fileId);
        if (!selectedFile) {
            console.error('File not found in the list.');
            return;
        }
        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
        fetch(`${EXPRESS_API_BASE_URL}/files/${selectedFile.file_name}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch the selected file');
                }
                return response.blob();
            })
            .then((blob) => {
                const file = new File([blob], selectedFile.file_name, { type: selectedFile.file_type });
                setPdfFile(file);
                setFileName(file.name);
                setSelectedFileId(fileId);
                showNotification(`File "${file.name}" selected successfully.`, 'success');
            })
            .catch((error) => console.error('Error selecting file:', error));
    };

    const handleDeleteFile = (fileId) => {
        if (!fileId) {
            console.error('File ID is undefined');
            return;
        }
        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
        fetch(`${EXPRESS_API_BASE_URL}/files/${fileId}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete file');
                }
                setRelevantFiles((prevFiles) =>
                    prevFiles.filter((file) => file.id !== fileId)
                );
                showNotification('File deleted successfully!','success');
            })
            .catch((error) => console.error('Error deleting file:', error));
    };

    const handleSaveFiles = () => {
        if (!currentCaseId) {
            showNotification('No case selected.', 'error');
            return;
        }
    
        const formData = new FormData();
        uploadedFiles.legalDocuments.forEach((file) => formData.append('legalDocuments', file));
        uploadedFiles.evidence.forEach((file) => formData.append('evidence', file));
        
        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
        fetch(`${EXPRESS_API_BASE_URL}/cases/${currentCaseId}/upload-files`, {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error uploading files');
                }
                return response.json();
            })
            .then(() => {
                showNotification('Files uploaded successfully!', 'success');
                setIsFileModalOpen(false);
                setUploadedFiles({ legalDocuments: [], evidence: [] });
    
                fetchRelevantFiles(currentCaseId);
            })
            .catch((error) => console.error('Error uploading files:', error));
    };
    
    const handleFileChange = (e, type) => {
        setUploadedFiles((prevState) => ({
            ...prevState,
            [type]: [...prevState[type], ...e.target.files],
        }));
    };
    
    const genPrecendenceAnalysisResponse = async () => {
        if (!precedenceQuery.trim()) {
            showNotification('Please enter a query', 'error');
            return;
        }
    
        setLoading(true);
        setAnalysisResult('Generating...');
    
        try {
            const formData = new FormData();
            formData.append('query', precedenceQuery);
    
            // Only append the file if it's present
            if (pdfFileset) {
                formData.append('case_file', pdfFileset);
            }
            
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
            const response = await fetch(`${API_BASE_URL}/precedence-analysis/`, {
                method: 'POST',
                body: formData,
            });
    
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error(`Failed to fetch analysis. Status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Parsed Data:', data);
            setAnalysisResult(data.response || 'No result returned');
        } catch (error) {
            console.error('Error fetching analysis:', error);
            setAnalysisResult('Error fetching analysis');
        } finally {
            setLoading(false);
        }
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
            <div className={styles.subContainer}>
                <div className={styles.caseHeader}>
                    <p className={styles.caseHeaderText}>
                        Case Name: <span className={styles.caseName}>
                            {selectedCases?.case_name || 'No Case Selected'}
                        </span>
                    </p>
                    <button
                        className={styles.caseHeaderButton}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Select Case
                    </button>
                </div>
                <div className={styles.areaDivider}>
                    <div className={styles.leftArea}>
                        <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>Relevant Case Files</p>
                            <button
                                className={styles.addCaseFileButton}
                                onClick={() => {
                                    if (!selectedCases) {
                                        showNotification('Please select a case first!', 'error');
                                        return;
                                    }
                                    setCurrentCaseId(selectedCases.id);
                                    setIsFileModalOpen(true);
                                }}
                            >
                                Add Case File
                            </button>
                        </div>
                        <div className={styles.caseTableArea}>
                            <table className={styles.fileTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.fileNameTH}>FILE NAME</th>
                                        <th className={styles.fileTypeTH}>TYPE</th>
                                        <th className={styles.btnTH}></th>
                                        <th className={styles.btnTH}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caseRelevantFiles.map((file, index) => (
                                        <tr key={index}
                                            style={{
                                                backgroundColor: selectedFileId === file.id ? 'rgb(0, 170, 255)' : 'transparent',
                                            }}>
                                            <td className={styles.fileNameTD}>{file.file_name}</td>
                                            <td className={styles.fileTypeTD}>{file.file_type}</td>
                                            <td>
                                                <button
                                                    className={`${styles.btnTH} ${styles.delete}`}
                                                    onClick={() => handleSelectFile(file.id)}
                                                >
                                                    {selectedFileId === file.id ? 'Unselect' : 'Select'}
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className={`${styles.btnTH} ${styles.delete}`}
                                                    onClick={() => handleDeleteFile(file.id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                            <td>
                                                <button
                                                    className={`${styles.btnTH} ${styles.view}`}
                                                    onClick={() => {
                                                        const EXPRESS_API_BASE_URL = process.env.REACT_APP_EXPRESS_API_BASE_URL;
                                                        window.open(`${EXPRESS_API_BASE_URL}/files/${file.file_name}`, '_blank');
                                                    }}                                                    
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className={styles.rightArea}>
                        <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>Precedent Query</p>
                        </div>
                        <textarea
                            className={styles.promptText}
                            placeholder={`Enter your query for precedent analysis here.
You can also select a relevant case file from the file section on the left to include with your query.`}
                            value={precedenceQuery}
                            onChange={(e) => setLegalQuery(e.target.value)}
                        ></textarea>
                        <div className={styles.caseArea}>
                            <p className={styles.fileNameText}>
                                {isfileNameSet ? `Selected File: ${isfileNameSet}` : 'Selected File: No file selected'}
                            </p>
                            <button className={styles.askQaziBtn} onClick={genPrecendenceAnalysisResponse}>
                                Ask Qazi
                            </button>
                        </div>
                        <div className={styles.caseGenTextArea}>
                            <p className={styles.caseGenText}>Qazi Says</p>
                        </div>
                        <div className={styles.aiText}>{precedenceAnalysis || <span className={styles.placeholder}>Your analysis will appear here...</span>}</div>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Select a Case</h3>
                        <label>
                            Cases:
                            <select
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    const selected = iscase.find((c) => c.id === parseInt(selectedId, 10));
                                    setTempSelectedCase(selected); // Use temporary state
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a case
                                </option>
                                {iscase.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.case_name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div className={styles.modalActions}>
                            <button onClick={handleCaseSelect}>Select</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {isFileModalOpen && (
                <div className={styles.fileModal}>
                    <div className={styles.fileModalContent}>
                        <h3>Attach a File</h3>
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
                        <div className={styles.fileModalActions}>
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

export default PrecedenceAnalysis;
