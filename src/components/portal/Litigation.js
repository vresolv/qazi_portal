import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import styles from './Litigation.module.css';

const Litigation = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isNoticeClicked, setIsNoticeClicked] = useState(false);
    const [aiText, setAiText] = useState('');
    const [generatedResults, setGeneratedResults] = useState('');
    

    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
          setPdfFile(file);
          setFileName(file.name);
        } else {
          alert('Please upload a valid PDF file.');
          setPdfFile(null);
          setFileName(null);
        }
      };
      

      const triggerFileInput = () => {
        document.getElementById('file-upload').click();
      };


      const extractDateAndAddress = () => {
            const lines = aiText.trim().split('\n').filter(line => line.trim() !== '');
            let date = '';
            let address = '';
        
            for (const line of lines) {
                if (/^\d{2}-\d{2}-\d{4}$/.test(line.trim())) {
                    date = line.trim();
                } else {
                    address = line.trim();
                }
            }
        
            console.log('Extracted Date:', date);
            console.log('Extracted Address:', address);
        
            return { date, address };
        };
    
    
        const handleDownloadDocument = () => {
            if (!generatedResults) {
                alert('No content available in the Generated Results area.');
                return;
            }
    
            // first line as the heading and remaining lines as data
            const lines = generatedResults.split('\n').filter(line => line.trim() !== '');
            const heading = lines[0];
            const date = lines[1]?.replace(/^Date:\s*/, '') || 'Date not available';
            const address = lines[2]?.replace(/^Address:\s*/, '') || 'Address not available';
            const documentType = lines[3]?.replace(/^Document Type:\s*/, '') || 'Type of Document not defined';

            const doc = new jsPDF();
    
            // Heading
            doc.setFontSize(16);
            doc.text(heading, 105, 20, { align: 'center' });
            const headingWidth = doc.getTextWidth(heading);
            doc.line(105 - headingWidth / 2, 22, 105 - headingWidth / 2 + headingWidth, 22);
    
            doc.setFontSize(12);
            doc.text('This is a test document for Digital Notices ', 20, 40);
            // doc.autoTable({
            //     startY: 50,
            //     head: [['Field', 'Value']],
            //     body: [
            //         ['Date', date],
            //         ['Address', address]
            //     ],
            // });
            // Table position
            const startX = 20;
            const startY = 50;
            const column1Width = 50;
            const column2Width = 120;
            const rowHeight = 10;

            // First row for Date
            doc.rect(startX, startY, column1Width, rowHeight);
            doc.text('Date:', startX + 5, startY + 7);
            doc.rect(startX + column1Width, startY, column2Width, rowHeight);
            doc.text(date, startX + column1Width + 5, startY + 7);

            // Second row for Address
            doc.rect(startX, startY + rowHeight, column1Width, rowHeight);
            doc.text('Address:', startX + 5, startY + rowHeight + 7);
            doc.rect(startX + column1Width, startY + rowHeight, column2Width, rowHeight);
            doc.text(address, startX + column1Width + 5, startY + rowHeight + 7);

             // Third row for Document Type
            doc.rect(startX, startY + rowHeight * 2, column1Width, rowHeight);
            doc.text('Document Type:', startX + 5, startY + rowHeight * 2 + 7);
            doc.rect(startX + column1Width, startY + rowHeight * 2, column2Width, rowHeight);
            doc.text(documentType, startX + column1Width + 5, startY + rowHeight * 2 + 7);

            // "Terms and Conditions"
            const termsStartY = startY + rowHeight * 2 + 20;
            doc.setFontSize(14);
            doc.setFont('Helvetica', 'bold');
            doc.text('Terms and Conditions', startX, termsStartY);

            doc.setFontSize(12);
            doc.setFont('Helvetica', 'normal');
            const termsText = [
                '1. This is Term 1.',
                '2. This is Term 2.',
            ];
            termsText.forEach((term, index) => {
                doc.text(term, startX, termsStartY + (index + 1) * 10);
            });

            doc.save('GeneratedDocument.pdf');
        };

        const genGptResponse = async () => {
            const { date, address } = extractDateAndAddress();

            if (!isNoticeClicked){
                alert('Please Select Type of Document !')
                return;
            }

            if (!date || !address) {
                alert('Please include both Date and Address in the AI Text area.');
                return;
            }
        
            if (!pdfFile) {
                alert('Please upload a valid PDF file.');
                return;
            }

            const documentType = isNoticeClicked ? 'Notice' : 'Other';
            
            try {
                
                const formData = new FormData();
                formData.append('date', date);
                formData.append('address', address);
                formData.append('file', pdfFile); // Add the uploaded file
                formData.append('documentType', documentType)
        
                const response = await fetch('https://api.example.com/generate', {
                    method: 'POST',
                    body: formData, // Send FormData instead of JSON
                });
        
                if (!response.ok) {
                    throw new Error('Failed to fetch data from the API');
                }
        
                const data = await response.json();
                setGeneratedResults(data.result || 'No results found.');
            } catch (error) {
                setGeneratedResults(`Failed to Fetch From API !!!!\nDate: ${date}\nAddress: ${address}\nDocument Type: ${documentType}`);
            }
        };
    

//       const genGptResponse = async () => {
//         setParagraph("...")
//         await sleep(2000);
//         var notice = `SUMMON / NOTICE
// **In The Court of:**
// SYED ZAHID HUSSAIN TIRMIZI, LEARNED JUDGE FAMILY COURT, ISLAMABAD (EAST)
// **Case Title:**
// Ch. Muhammad Faizan
// **Versus**
// Mst. Sana Aslam & Another
// **Summon issued to:**
// Mst. Sana Aslam, Sector XYZ Islamabad.
// You are directed to appear before this Court in the above-titled case personally or through attorney, pursue the case against you, and submit your reply for the same on 20th August 2024 at 9:00 am. Otherwise, the case shall proceed ex parte against you.
// **Note:** This summon relates to the petition filed under Section 25 of the Guardian and Ward Act, 1890 for the custody of minor, which has been consolidated with the suit for dissolution of marriage and related matters filed by you. Your presence is crucial for the just and proper adjudication of these interconnected cases.
// **Copy is attached.**`;

//         setParagraph(notice)
//       };

      const handleNoticeClick = () => {
        setIsNoticeClicked((prevState) => !prevState);
      };

    return (
        <div className={styles.container}> 
            <div className={styles.subContainer}>
                <div className={styles.buttonsArea}>
                    <div className={styles.centeredContent}>
                        <p>Type of Document: </p>
                    </div>
                    <button
                        className={`${styles.noticeBtn} ${isNoticeClicked ? styles.green : ''}`}
                        onClick={handleNoticeClick}>Notice</button>
                    <select className={styles.dropdown}>
                        <option value="option1">Summon Notice Template</option>
                    </select>
                </div>
                <p>AI Text Prompt</p>
                <textarea
                    className={styles.aiText}
                    placeholder={`Date and time
Address`}
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                ></textarea>
                <div className={styles.buttonsArea}>
                    <button onClick={triggerFileInput}>Upload File</button>
                    <p>{fileName}</p>
                    <input 
                        type="file"
                        accept="application/pdf"  
                        className={styles.fileUpload}
                        onChange={handleFileChange}
                        id="file-upload"/>
                    <button className={styles.genBtn} onClick={genGptResponse}>Generate</button>
                    </div>
                    <p>Generation Results</p>
                    <div
                        className={styles.aiText}
                        dangerouslySetInnerHTML={{
                            __html: generatedResults || 'Your analysis will appear here',
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
