import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import styles from './LegalAnalysis.module.css';

const LegalAnalysis = () => {
    const [paragraph, setParagraph] = useState('');
    const [fileData, setFileData] = useState([
        { name: 'Client Testimony', type: 'Audio Transcript' },
        { name: 'Past Cases', type: 'Document' },
        { name: 'Court Appeals', type: 'Document' },
        { name: 'Faizan Shah', type: 'Audio Transcript' },
      ]);
    const [judgementData, setJudgementData] = useState([
        { name: 'Judgement-30/07/24', date: '30/07/24' },
        { name: 'Judgement-28/07/24', date: '28/07/24' },
        { name: 'Judgement-17/07/24', date: '17/07/24' },
        { name: 'Judgement-16/07/24', date: '16/07/24' },
      ]);

      const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    const handleCaseFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setFileData([...fileData, { name: file.name, type: 'Document' },]);
        } else {
          alert('Please upload a valid PDF file.');
        }
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

      const handleOpenPdf = () => {
        const doc = new jsPDF();
        doc.text(textToOpen, 10, 10);
        const pdfWindow = window.open("");
        pdfWindow.document.write("<iframe width='100%' height='100%' src='" + doc.output('bloburl') + "'></iframe>");
        // doc.save('Judgement-01/08/24');
      };

    return (
        <div className={styles.container}> 
            <div className={styles.subContainer}>
                <div className={styles.caseHeader}>
                    <p className={styles.caseHeaderText}>Case Name: Ch. Muhammad Faizan Vs Mst. Sana Aslam, Chaudhary Muhammad Akbar</p>
                    <button className={styles.caseHeaderButton}>Case Timeline</button>
                    <button>Change Case</button>
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
                                    {fileData.map((file, index) => (
                                        <tr key={index}>
                                        <td className={styles.fileNameTD}>{file.name}</td>
                                        <td className={styles.fileTypeTD}>{file.type}</td>
                                        <td><button className={styles.btnTH}>Delete</button></td>
                                        <td><button className={styles.btnTH}>View</button></td>
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
                                            <td><button className={styles.btnTH} onClick={handleOpenPdf}>View</button></td>
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
                        <textarea 
                            className={styles.aiText} 
                            placeholder="Analysis will appear here"
                            value={paragraph} 
                            readOnly>
                        </textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LegalAnalysis;
