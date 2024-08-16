import React, { useState } from 'react';
import styles from './Litigation.module.css';

const Litigation = () => {
    const [paragraph, setParagraph] = useState('Your Analysis will appear here.');
    const [pdfFile, setPdfFile] = useState(null);
    const [fileName, setFileName] = useState('');

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };
    
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

      const genGptResponse = async () => {
        setParagraph("...")
        await sleep(2000);
        var notice = `SUMMON / NOTICE
**In The Court of:**
SYED ZAHID HUSSAIN TIRMIZI, LEARNED JUDGE FAMILY COURT, ISLAMABAD (EAST)
**Case Title:**
Ch. Muhammad Faizan
**Versus**
Mst. Sana Aslam & Another
**Summon issued to:**
Mst. Sana Aslam, Sector XYZ Islamabad.
You are directed to appear before this Court in the above-titled case personally or through attorney, pursue the case against you, and submit your reply for the same on 20th August 2024 at 9:00 am. Otherwise, the case shall proceed ex parte against you.
**Note:** This summon relates to the petition filed under Section 25 of the Guardian and Ward Act, 1890 for the custody of minor, which has been consolidated with the suit for dissolution of marriage and related matters filed by you. Your presence is crucial for the just and proper adjudication of these interconnected cases.
**Copy is attached.**`;

        setParagraph(notice)
      };

      const renderHTML = () => {
        return { __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') };
      };

    return (
        <div className={styles.container}> 
            <div className={styles.subContainer}>
                <div className={styles.buttonsArea}>
                    <button>Notice</button>
                    <button>Petition</button>
                    <select className={styles.dropdown}>
                        <option value="option1">Preset/Template</option>
                        <option value="option2">Summon Notice Template</option>
                    </select>
                </div>
                <p>AI Text Prompt</p>
                <textarea 
                    className={styles.aiText} 
                    placeholder='<Date and time>
                    <Address>'>
                </textarea>
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
                        dangerouslySetInnerHTML={renderHTML()}
                    ></div>
                <div className={styles.buttonsArea}>
                    <button className={styles.genBtn}>Download Document</button>
                </div>
            </div>
        </div>
    );
};

export default Litigation;
