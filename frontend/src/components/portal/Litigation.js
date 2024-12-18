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

    // const handleDownloadDocument = () => {
    //     if (!generatedResults.trim()) {
    //         showNotification('No content available in the Generated Results area.', 'error');
    //         return;
    //     }
        
    //     const doc = new jsPDF();
    
    //     const heading = 'Summon Notice';
    //     doc.setFont('Helvetica', 'bold');
    //     doc.setFontSize(16);
    //     doc.text(heading, 105, 20, { align: 'center' });
    //     const headingWidth = doc.getTextWidth(heading);
    //     doc.line(105 - headingWidth / 2, 22, 105 + headingWidth / 2, 22);
        
    //     // paragraph
    //     const paragraph = generatedResults.replace(/\n/g, ' ');
    //     doc.setFont('Helvetica', 'normal');
    //     doc.setFontSize(13);
        
    //     const marginX = 20;
    //     const marginY = 40;
    //     const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    //     const textLines = doc.splitTextToSize(paragraph, pageWidth);
        
    //     doc.text(textLines, marginX, marginY);
        
    //     doc.save('SummonNotice.pdf');
    // };
    const handleDownloadDocument = () => {
        if (!generatedResults.trim()) {
            showNotification('No content available in the Generated Results area.', 'error');
            return;
        }
    
        const doc = new jsPDF();
    
        // Add a heading
        const heading = 'Summon Notice';
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(heading, 105, 20, { align: 'center' });
        const headingWidth = doc.getTextWidth(heading);
        doc.line(105 - headingWidth / 2, 22, 105 + headingWidth / 2, 22);
    
        // Paragraph content
        const paragraph = generatedResults;
    
        const lines = paragraph.split('\n'); // Split the content into lines based on newlines
        let cursorY = 40; // Starting Y position for text
    
        const marginX = 20;
        const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(13);
    
        lines.forEach((line) => {
            // Check for bold markers or headers in the content
            if (line.includes('COURT SUMMONS')) {
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(14);
            } else if (line.trim() === '') {
                // Empty line (adds a blank line for spacing)
                cursorY += 6;
                return;
            } else {
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(13);
            }
    
            // Split long lines to fit page width
            const textLines = doc.splitTextToSize(line, pageWidth);
    
            // Check if we need a new page
            if (cursorY + textLines.length * 6 > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                cursorY = 20; // Reset Y position
            }
    
            // Add the text to the PDF
            doc.text(textLines, marginX, cursorY);
            cursorY += textLines.length * 6; // Move cursor down for next lines
        });
    
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
               
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
            const response = await fetch(`${API_BASE_URL}/legal-doc-generation-html/`, {
                method: 'POST',
                body: formData,
            });
        
            if (!response.ok) {
                throw new Error('Failed to fetch data from the API');
            }
        
            const data = await response.json();
            console.log('Response',data.response)
            // parsing the response
            let htmlString = data.response;
            htmlString = htmlString.replace(/^```html\s*/, '').replace(/```$/, '');

            const firstIndex = htmlString.indexOf('Court Summons');
            if (firstIndex !== -1) {
                htmlString = htmlString.replace(/Court Summons/g, (match, offset) => 
                    offset === firstIndex ? match : ''
                );
            }

            htmlString = htmlString.replace(/(\n\s*){2,}/g, '\n');
            htmlString = htmlString.trim();
            const lines = htmlString.split('\n');
            const indentedLines = lines.map(line => line.trimStart());
            htmlString = indentedLines.join('\n');

            htmlString = htmlString.replace(/`{3,}/g, '');
            const plainString = htmlString.replace(/<[^>]+>/g, '');

            setGeneratedResults(plainString || 'No results found.');
        
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
