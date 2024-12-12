import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import styles from './LegalAnalysis.module.css';
import Notification from './Notification';

const LegalAnalysis = () => {
    const [paragraph, setParagraph] = useState('Analysis will appear here');
    const [fileData, setFileData] = useState([
      ]);
    const [judgementData, setJudgementData] = useState([
      ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [relevantFiles, setRelevantFiles] = useState([]);
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
        const savedCase = localStorage.getItem('selectedCase');
        if (savedCase) {
            const parsedCase = JSON.parse(savedCase);
            setSelectedCase(parsedCase);
            fetchRelevantFiles(parsedCase.id);
        }
    }, []);

    // Fetch files for the selected case
    const fetchRelevantFiles = (caseId) => {
        fetch(`http://localhost:5000/cases/${caseId}/files`)
            .then((response) => response.json())
            .then((data) => setRelevantFiles(data))
            .catch((error) => console.error('Error fetching files:', error));
    };
    
    const handleCaseSelect = () => {
        if (selectedCase) {
            localStorage.setItem('selectedCase', JSON.stringify(selectedCase));
            fetchRelevantFiles(selectedCase.id);
            setIsModalOpen(false);
        }
    };

    const handleCaseFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setFileData([...fileData, { name: file.name, type: 'Document' },]);
        } else {
          alert('Please upload a valid PDF file.');
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
    

    const handleGenJudgement = async () => {
        await sleep(2000);
        setJudgementData([{ name: 'Judgement-01/08/24', date: '01/08/24' }, ...judgementData,]);
      };

    const triggerFileInput = () => {
        document.getElementById('case-file-upload').click();
      };

    const genGptAnalysisResponse = async () => {
        setParagraph("...")
        await sleep(2000);
        var analysis = `### Legal Analysis and Decree in Light of Pakistan’s Law

#### Summary of the Case

**Plaintiff:** Mst. Samreen Shakoor  
**Defendant:** Banaras Nawaz  
**Court:** Senior Civil Judge/Family Judge Islamabad (East)  
**Claims:** Recovery of dower, maintenance, dowry articles, golden ornaments, and bridal gifts, or their monetary value.  
**Significant Amounts:** 
- Dower: Golden ornaments weighing 2 tolas and a room.
- Maintenance: Rs. 10,000 per month.
- Dowry articles and bridal gifts: Rs. 1,48,900.
- Golden ornaments: 3 tolas.

#### Factual Disputes and Key Contentions

**Plaintiff’s Claims:**
1. Defendant did not pay the dower.
2. Defendant and family subjected the plaintiff to cruelty and mistreated her.
3. Defendant unlawfully retained plaintiff’s dowry articles, bridal gifts, and jewelry.
4. Plaintiff was not maintained financially and was expelled from the marital home.
5. Plaintiff seeks recovery of maintenance, dower, dowry articles, and bridal gifts or their equivalent value.

**Defendant’s Defense:**
1. Dower was paid at the time of Nikkah.
2. Plaintiff was disrespectful and had mental health issues.
3. Dowry and jewelry were given by the defendant and are still in plaintiff’s possession.
4. Plaintiff left the marital home voluntarily and took dowry items at the time of the first divorce.

#### Legal Principals and Application

1. **Dower (Mahr):**
   - According to the Muslim Family Laws Ordinance, 1961, payment of dower can be prompt or deferred. The plaintiff claims non-payment, while the defendant asserts payment at the time of Nikkah.
   - **Required Action:** Verification of Nikkah Nama and testimonies regarding whether the dower was agreed to be prompt or deferred.

2. **Maintenance:**
   - Under Section 9 of the Muslim Family Laws Ordinance, a husband is bound to maintain his wife. The defendant claims he cannot afford Rs. 10,000 per month due to his low income and a recent injury limiting his work capacity.
   - **Required Action:** Investigation into the defendant’s financial standing and determining a reasonable amount based on his income.

3. **Dowry Articles and Bridal Gifts:**
   - As per the Dowry and Bridal Gifts (Restriction) Act, 1976, the items given at the time of marriage must be handed back in case of dissolution of marriage.    
   - **Required Action:** Verification of dowry list and possession status from both parties, including witness accounts.

4. **Allegations of Cruelty:**
   - Claims of cruelty and mistreatment are to be evaluated based on testimonies and any available evidence (medical reports, witness accounts).
   - **Required Action:** Evaluate evidence supporting the claims and defenses of cruelty and mistreatment.

#### Decree

**After thorough legal analysis based on Pakistani law:**

1. **Regarding Dower:**
   - **Decision:** If evidence supports non-payment, the defendant is ordered to pay the dower as specified in the Nikkah Nama (2 tolas of gold and a room).       

2. **Regarding Maintenance:**
   - **Decision:** Considering the defendant’s financial state, a reasonable monthly maintenance amount should be determined. Equity may suggest a lowered amount given the defendant’s income and injury.

3. **Regarding Dowry Articles and Bridal Gifts:**
   - **Decision:** If the plaintiff’s list of dowry items is substantiated and remains in the defendant’s possession, an order for their return or payment of their equivalent value (Rs. 1,48,900) is issued.

4. **Regarding Allegations of Cruelty:**
   - **Decision:** If evidence supports the plaintiff’s allegations, the court may issue additional relief for the plaintiff.

5. **General Relief:**
   - **Grant any other appropriate relief deemed fit by this Honourable Court.**

**Final Decree:**

The final decree shall be contingent upon thorough verification, evidence, and the trial process. The current orders are conditional upon these detailed investigations and evidentiary support in line with justice and equity as prescribed by Pakistani law.
`;

        setParagraph(analysis)
      };

      const textToOpen = `**Decree:**

**Background:**
After careful review of the filed application, the written response from the defendant, and the documented court proceedings, the following decree has been formulated based on the laws relevant to family disputes in Pakistan.

### Key Points of Contention:
1. **Dower (Mehr):**
   - **Claim:** Plaintiff alleges the dower of 2 tolas of gold and one room has not been delivered by the defendant.
   - **Response:** Defendant states the dower was paid at the time of Nikkah.
   - **Judgment:** Plaintiff admitted during cross-examination that the dower in the form of 2 tolas of gold was paid at the time of marriage, but claims it was taken back by the defendant's mother. This claim was not sufficiently substantiated. The room promised in the Nikkah Nama cannot be decreed due to the lack of specifications about its ownership and whereabouts.

2. **Maintenance:**
   - **Claim:** Plaintiff seeks maintenance from the date of marriage till Iddat period.
   - **Response:** Defendant asserts he provided maintenance and counters that the plaintiff was disobedient and left the matrimonial home voluntarily.
   - **Judgment:** As per Islamic law and precedents, the husband is required to provide maintenance during the marriage and Iddat period unless the wife is disobedient without justification. The court found evidence supporting the plaintiff’s entitlement to maintenance from May 2019 (time of desertion) until the Iddat period after the third Talaq in September 2019. Maintenance is fixed at Rs. 10,000 per month, taking into account the average monthly income of the defendant which was not effectively rebutted.

3. **Dowry Articles:**
   - **Claim:** Plaintiff asserts that her bridal gifts and dowry articles, listed in annexures, are in the illegal possession of the defendant.
   - **Response:** Defendant claims all dowry articles provided by him were taken by the plaintiff at the time of divorce.
   - **Judgment:** The court found evidence supporting the partial claim for dowry articles excluding certain items proven to be provided by the defendant. Plaintiff is entitled to recover the remaining dowry articles listed or receive 60% of their market value if undelivered by the defendant.

### Decree:
1. **Maintenance:**
   - The defendant, Banaras Nawaz, shall pay Mst. Samreen Shakoor a maintenance allowance of Rs. 10,000 per month starting from May 2019 until the Iddat period post the third Talaq dated 19-09-2019.

2. **Dowry Articles:**
   - Mst. Samreen Shakoor is entitled to recover the dowry articles listed in Ex.P6, except for a stove, pedestal fan, and washing machine which the defendant provided and are excluded from this claim.
   - The plaintiff must accept the dowry articles in their current condition. Should the defendant fail to deliver any of these articles, he must pay 60% of their prevailing market price.

3. **Dower (Mehr):**
   - The claim for recovery of an additional 2 tolas of gold and one room is dismissed due to a lack of substantial evidence.

**Implementation:**
The defendant is ordered to comply with this decree and ensure payment and delivery as specified within a period of one month from the issuance of this decree. Failure to adhere will result in further legal actions, including contempt of court proceedings.

**Certification and File Completion:**
The judgment consists of seven pages, each of which has been reviewed and signed by the judge. A decree sheet shall be prepared and the case file consigned to the record room within seven days as per the court's procedures.

**Announced:** 11.05.2023

**Certified by:**
Judge Qudratullah,
SCJ-III/Judge Family-Guardian Court, East Islamabad.
`;

    const parseAndFormatTextToPdf = () => {
        const doc = new jsPDF();

        const logoBase64Url = 'data:image/png;base64,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'

        // Define logo position and size
        const logoWidth = 50;  // Adjust width as needed
        const logoHeight = 20;  // Adjust height as needed
        const logoX = 10;  // X-coordinate
        const logoY = 10;  // Y-coordinate

        // Add the logo to the PDF
        doc.addImage(logoBase64Url, 'PNG', logoX, logoY, logoWidth, logoHeight);

        let currentY = logoY + logoHeight + 10;
        const lineHeight = 10;
        const maxWidth = 180;
        const pageHeight = doc.internal.pageSize.height;
    
        const addText = (content, options = {}) => {
            const { bold = false, size = 12, indent = 0 } = options;
            
            // Set the font style and size
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setFontSize(size);
        
            // Split text into multiple lines if it exceeds the max width
            const lines = doc.splitTextToSize(content, maxWidth - indent);
            
            lines.forEach((line, index) => {
                // If the text exceeds the page height, create a new page
                if (currentY > pageHeight - 20) {
                    doc.addPage();
                    doc.addImage(logoBase64Url, 'PNG', logoX, logoY, logoWidth, logoHeight);  // Re-add logo on new page
                    currentY = logoY + logoHeight + 10;
                }
                // Add the line to the PDF
                doc.text(line, 10 + indent, currentY);
                currentY += lineHeight;
            });
        };
    
        
        const parseText = (inputText) => {
            const lines = inputText.split('\n');
            lines.forEach((line) => {
            line = line.trim(); // Trim leading and trailing whitespace

            // Handle ### headers
            if (line.startsWith('### ')) {
                addText(line.replace('### ', ''), { bold: true, size: 14 });
            }
            // Handle numbered list items (e.g., "1. **Maintenance:**")
            else if (/^\d+\.\s\*\*(.*)\*\*/.test(line)) {
                const match = line.match(/^\d+\.\s(.*)/);
                addText(match[0].replace(/\*\*/g, ''), { bold: true });
            }
            // Handle indented bullet points with bold text (e.g., "  - **Claim:**")
            else if (/^-\s(.*)/.test(line)) {
                // First match to capture the entire bullet point line
                const match1 = line.match(/-\s(.*)/);
            
                // Second match to split the label and the content at the colon
                const match2 = match1[1].match(/(.*?):\s*(.*)/);
            
                if (match2) {
                    const label = '• ' + match2[1].replace(/\*\*/g, '') + ':';
                    const content = match2[2].replace(/\*\*/g, '');

                    // Add the bold label first
                    doc.setFont('helvetica', 'bold');
                    doc.text(label, 10 + 10, currentY);

                    // Calculate the width of the bold label
                    const labelWidth = doc.getTextWidth(label);

                    // Calculate the remaining width after the label
                    const remainingWidth = maxWidth - (10 + 10 + labelWidth);

                    // Split the content based on the remaining width
                    const contentLines = doc.splitTextToSize(content, remainingWidth);

                    // Add the first line of content on the same line as the label
                    doc.setFont('helvetica', 'normal');
                    doc.text(contentLines[0], 10 + 10 + labelWidth, currentY);

                    // Adjust the Y position and add the rest of the content (if any) on new lines
                    currentY += lineHeight;
                    for (let i = 1; i < contentLines.length; i++) {
                        if (currentY > pageHeight - 20) {
                            doc.addPage();
                            doc.addImage(logoBase64Url, 'PNG', logoX, logoY, logoWidth, logoHeight);  // Re-add logo on new page
                            currentY = logoY + logoHeight + 10;
                        }
                        doc.text(contentLines[i], 10 + 20, currentY);
                        currentY += lineHeight;
                    }
                } 
                else {
                    // If there's no colon, treat the entire line as regular bullet point text
                    addText('• ' + match1[1].replace(/\*\*/g, ''), { indent: 10, bold: false });
                }
            }
            // Handle bold text in paragraphs (e.g., "**Bold Text**")
            else if (/^\*\*(.*?)\*\*$/.test(line)) {
                addText(line.replace(/\*\*/g, ''), { bold: true });
            }
            // Handle bold text in paragraphs (e.g., "**Bold Text: 1231**")
            else if (/^\*\*(.*?)\*\*/.test(line)) {
                // Second match to split the label and the content at the colon
                const match = line.match(/(.*?):\s*(.*)/);
            
                if (match) {
                    const label = match[1].replace(/\*\*/g, '') + ':';
                    const content = match[2].replace(/\*\*/g, '');

                    doc.setFont('helvetica', 'bold');
                    doc.text(label, 10, currentY);

                    // Calculate the width of the bold text
                    const labelTextWidth = doc.getTextWidth(label + ':');

                    // Add the regular part right after the bold part
                    doc.setFont('helvetica', 'normal');
                    doc.text(content, 10 + labelTextWidth, currentY);

                    // Adjust the Y position after adding the text
                    currentY += lineHeight;
                }
            }
            // Handle regular paragraphs
            else if (line.length > 0) {
                console.log(line)
                addText(line, { bold: false });
            }
            // Add a blank line for visual separation
            else {
                currentY += lineHeight;
            }
            });
        };
    
        parseText(textToOpen);
    
        // Open PDF in new window
        const pdfWindow = window.open("");
        pdfWindow.document.write("<iframe width='100%' height='100%' src='" + doc.output('bloburl') + "'></iframe>");
    };

    const renderHTML = () => {
    let formattedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **text** to <strong>text</strong>
        .replace(/- (.*?)\n/g, '<li>$1</li>') // Convert - list items to <li>
        .replace(/#### (.*?)\n/g, '<h4>$1</h4>') // Convert #### headers to <h4>
        .replace(/### (.*?)\n/g, '<h3>$1</h3>'); // Convert ### headers to <h3>
    //   .replace(/\n\n/g, '<br /><br />') // Double new line to <br /><br /> for paragraph breaks
    //   .replace(/\n/g, '<br />'); // Single new line to <br />


    // Wrap unordered list items with <ul> tags
    formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    return { __html: formattedText };
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
                <p className={styles.caseHeaderText}>Case Name: {selectedCase ? selectedCase.case_name : ''}</p>
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
                            <button onClick={triggerFileInput}>Add Case File</button>
                            <input 
                                type="file"
                                accept="application/pdf"  
                                className={styles.fileUpload}
                                onChange={handleCaseFileUpload}
                                id="case-file-upload"/>
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
                                    {relevantFiles.map((file, index) => (
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
                        <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>Judgements</p>
                            <button>Explore</button>
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
                                            <td><button className={styles.btnTH} onClick={parseAndFormatTextToPdf}>View</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                        </div>
                    </div>
                    <div className={styles.rightArea}>
                        <div className={styles.caseArea}>
                            <p className={styles.caseHeaderText}>AI Text Prompt</p>
                        </div>
                        <textarea 
                            className={styles.promptText} 
                            placeholder="Ask for any Legal Analysis help here">
                        </textarea>
                        <div className={styles.caseArea}>
                            <button>Upload File</button>
                            <button className={styles.askQaziBtn} onClick={genGptAnalysisResponse}>Ask Qazi</button>
                        </div>
                        <div className={styles.caseGenTextArea}>
                            <p className={styles.caseGenText}>Generation Results</p>
                        </div>
                        <div
                            className={styles.aiText}
                            dangerouslySetInnerHTML={renderHTML()}
                        ></div>
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
                                    const selected = cases.find((c) => c.id === parseInt(selectedId, 10));
                                    setSelectedCase(selected);
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>
                                    Select a case
                                </option>
                                {cases.map((c) => (
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

export default LegalAnalysis;
