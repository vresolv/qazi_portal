import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import styles from './Litigation.module.css';
import Notification from './Notification';



const Litigation = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isNoticeClicked, setIsNoticeClicked] = useState(false);
    const [aiText, setAiText] = useState('');
    const [generatedResults, setGeneratedResults] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
    };
    
    // Load state from sessionStorage
    useEffect(() => {
        const savedaiText = sessionStorage.getItem('aiText');
        const savedgeneratedText = sessionStorage.getItem('generatedResults');
        // const savedDocType = sessionStorage.getItem('isNoticeClicked');

        if (savedaiText) setAiText(savedaiText);
        if (savedgeneratedText) setGeneratedResults(savedgeneratedText);
        // if (savedDocType) setIsNoticeClicked(savedDocType);
    }, []);

    useEffect(() => {
        const saveToSessionStorage = () => {
            sessionStorage.setItem('aiText', aiText);
            sessionStorage.setItem('generatedResults', generatedResults);
            // sessionStorage.setItem('isNoticeClicked', isNoticeClicked);
        };
    
        saveToSessionStorage();
    }, [aiText, generatedResults]);


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
      

    const triggerFileInput = () => {
        document.getElementById('file-upload').click();
    };

    const handleDownloadDocument = () => {
        if (!generatedResults.trim()) {
            showNotification('No content available in the Generated Results area.', 'error');
            return;
        }
        
        const doc = new jsPDF();
    
        const heading = 'Summon Notice';
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(heading, 105, 20, { align: 'center' });
        const headingWidth = doc.getTextWidth(heading);
        doc.line(105 - headingWidth / 2, 22, 105 + headingWidth / 2, 22);
        
        // paragraph
        const paragraph = generatedResults.replace(/\n/g, ' ');
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(13);
        
        const marginX = 20;
        const marginY = 40;
        const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
        const textLines = doc.splitTextToSize(paragraph, pageWidth);
        
        doc.text(textLines, marginX, marginY);
        
        doc.save('SummonNotice.pdf');
    };
        

    const genGptResponse = async () => {
        if (!isNoticeClicked){
            showNotification('Please Select Type of Document !','error')
            return;
         }

        if (!aiText) {
            showNotification('Please add details !','error');
            return;
        }
        
        if (!pdfFile) {
            showNotification('Please upload a valid PDF file !','error');
            return;
        }

        setLoading(true);
        setGeneratedResults('Generating...');
            
        try {
                
            const formData = new FormData();
            formData.append('details', aiText);
            formData.append('case_file', pdfFile);
               
        
            const response = await fetch('http://127.0.0.1:8000/legal-doc-generation/', {
                method: 'POST',
                body: formData,
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch data from the API');
            }
        
            const data = await response.json();
            setGeneratedResults(data.response || 'No results found.');
        } catch (error) {
            setGeneratedResults(`Failed to Fetch Results !`);
        } finally {
            setLoading(false);
        }
    };
    

    const handleNoticeClick = () => {
        setIsNoticeClicked((prevState) => !prevState);
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
                <div className={styles.buttonsArea}>
                    <div className={styles.centeredContent}>
                        <p>Type of Document: </p>
                    </div>
                    <button
                        className={`${styles.noticeBtn} ${isNoticeClicked ? styles.blue : ''}`}
                        onClick={handleNoticeClick}>Notice</button>
                    <select className={styles.dropdown}>
                        <option value="option1">Summon Notice Template</option>
                    </select>
                </div>
                <p>Details</p>
                <textarea
                    className={styles.aiText}
                    placeholder={`Name
Address
Date and time`}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                ></textarea>
                <div className={styles.buttonsArea}>
                    <button onClick={triggerFileInput}>Upload Petition</button>
                    <p>{fileName}</p>
                    <input 
                        type="file"
                        accept="application/pdf"  
                        className={styles.fileUpload}
                        onChange={handleFileChange}
                        id="file-upload"/>
                    <button className={styles.genBtn} onClick={genGptResponse}>Generate</button>
                    </div>
                    <p>Generated Document</p>
                    <div
                        className={styles.aiText}
                        dangerouslySetInnerHTML={{
                            __html: generatedResults || '<span style="color: #888;">Your analysis will appear here...</span>',
                        }}
                    ></div>
                <div className={styles.buttonsArea}>
                    <button className={styles.genBtn} onClick={handleDownloadDocument}>
                        Download Document
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Litigation;
