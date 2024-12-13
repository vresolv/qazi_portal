import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import styles from './Precedence.module.css';
import Notification from './Notification';

const PrecedenceAnalysis = () => {
    const [paragraph, setParagraph] = useState('Analysis will appear here');
    const [precedenceQuery, setLegalQuery] = useState('');
    const [precedenceAnalysis, setAnalysisResult] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [iscase, setCases] = useState([]);
    const [selectedCases, setSelectedCase] = useState(null);
    const [caseRelevantFiles, setRelevantFiles] = useState([]);
    const [pdfFileset, setPdfFile] = useState(null);
    const [isfileNameSet, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    
    useEffect(() => {
        // Fetch cases from the backend
        fetch('http://localhost:5000/cases')
            .then((response) => response.json())
            .then((data) => setCases(data))
            .catch((error) => console.error('Error fetching cases:', error));

        // Load selected case and relevant files from localStorage
        const savedCase = localStorage.getItem('selectedCases');
        if (savedCase) {
            const parsedCase = JSON.parse(savedCase);
            setSelectedCase(parsedCase);
            fetchRelevantFiles(parsedCase.id);
        }
    }, []);

    // // Load state from sessionStorage
    // useEffect(() => {
    //     const savedQuery = sessionStorage.getItem('precedenceQuery');
    //     const savedAnalysis = sessionStorage.getItem('precedenceAnalysis');
    //     const savedFileName = sessionStorage.getItem('isfileNameSet');

    //     if (savedQuery) setLegalQuery(savedQuery);
    //     if (savedAnalysis) setAnalysisResult(savedAnalysis);
    //     if (savedFileName) setFileName(savedFileName);
    // }, []);

    // useEffect(() => {
    //     const saveToSessionStorage = () => {
    //         sessionStorage.setItem('precedenceQuery', precedenceQuery);
    //         sessionStorage.setItem('precedenceAnalysis', precedenceAnalysis);
    //         if (fileName) {
    //             sessionStorage.setItem('fileName', fileName);
    //         } else {
    //             sessionStorage.removeItem('fileName');
    //         }
    //     };
    
    //     saveToSessionStorage();
    // }, [precedenceQuery, precedenceAnalysis, fileName]);



    // Fetch attched files for case
    const fetchRelevantFiles = (caseId) => {
        fetch(`http://localhost:5000/cases/${caseId}/files`)
            .then((response) => response.json())
            .then((data) => setRelevantFiles(data))
            .catch((error) => console.error('Error fetching files:', error));
    };
    
    const handleCaseSelect = () => {
        if (selectedCases) {
            localStorage.setItem('selectedCases', JSON.stringify(selectedCases));
            fetchRelevantFiles(selectedCases.id);
            setIsModalOpen(false);
        }
    };

    const handleDeleteFile = (fileId) => {
        if (!fileId) {
            console.error('File ID is undefined');
            return;
        }
    
        fetch(`http://localhost:5000/files/${fileId}`, {
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
    
    const triggerFileInput = () => {
        document.getElementById('file-upload').click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
          setPdfFile(file);
          setFileName(file.name);
        } else {
          showNotification('Please upload a valid PDF file.','error');
          setPdfFile(null);
          setFileName(null);
        }
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
    
            const response = await fetch('http://127.0.0.1:8000/legal-analysis/', {
                method: 'POST',
                body: formData, // Send FormData
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
                        Case Name: <span className={styles.caseName}>{caseRelevantFiles.length > 0 ? caseRelevantFiles[0].case_name : 'No Case Selected'}</span>
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
                                        <tr key={index}>
                                            <td className={styles.fileNameTD}>{file.file_name}</td>
                                            <td className={styles.fileTypeTD}>{file.file_type}</td>
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
                                                    onClick={() =>
                                                        window.open(`http://localhost:5000/files/${file.file_name}`, '_blank')
                                                    }
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>Judgements</p>
                            <button onClick={handleGenJudgement}>Generate Judgement</button>
                        </div>
                        <div className={styles.caseTableArea}>
                            <table className={styles.fileTable}>
                                    <thead>
                                        <tr>
                                            <th className={styles.fileNameTH}>FILE NAME</th>
                                            <th className={styles.fileTypeTH}>DATE</th>
                                            <th className={styles.btnTH}></th>
                                            <th className={styles.btnTH}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {judgementData.map((judgement, index) => (
                                            <tr key={index}>
                                            <td className={styles.fileNameTD}>{judgement.name}</td>
                                            <td className={styles.fileTypeTD}>{judgement.date}</td>
                                            <td><button className={styles.btnTH}>Delete</button></td>
                                            <td><button className={styles.btnTH}>View</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div> */}
                    </div>
                    <div className={styles.rightArea}>
                        <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>Legal Query</p>
                        </div>
                        <textarea
                            className={styles.promptText}
                            placeholder="Ask for any Legal Analysis help here"
                            value={precedenceQuery}
                            onChange={(e) => setLegalQuery(e.target.value)}
                        ></textarea>
                        <div className={styles.caseArea}>
                            <button onClick={triggerFileInput}>Upload File</button>
                            <p className={styles.fileNameText}>{isfileNameSet}</p>
                                <input 
                                    type="file"
                                    accept="application/pdf"  
                                    className={styles.fileUpload}
                                    onChange={handleFileChange}
                                    id="file-upload"/>
                            <button className={styles.askQaziBtn} onClick={genPrecendenceAnalysisResponse}>
                                Ask Qazi
                            </button>
                        </div>
                        <div className={styles.caseGenTextArea}>
                            <p className={styles.caseGenText}>Generation Results</p>
                        </div>
                        <div className={styles.aiText}>{precedenceAnalysis}</div>
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
                                    setSelectedCase(selected);
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
        </div>
    );
};

export default PrecedenceAnalysis;
