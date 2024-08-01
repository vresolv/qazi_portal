import React, { useState } from 'react';
import styles from './Portal.module.css';
import NavBar from '../components/portal/Nav';
import Litigation from '../components/portal/Litigation';
import LegalAnalysis from '../components/portal/LegalAnalysis';
import Cases from '../components/portal/Cases';
import dashboardIcon from '../assets/Portal/dashboard.png';
import litigationIcon from '../assets/Portal/litigation.png';
import legalIcon from '../assets/Portal/legal.png';
import casesIcon from '../assets/Portal/cases.png';
import settingsIcon from '../assets/Portal/settings.png';

const Portal = () => {

    const [selectedButton, setSelectedButton] = useState(2);

    const handleMenuChange = (buttonIndex) => {
        setSelectedButton(buttonIndex);
      };

    return (
        <div className={styles.container}> 
            <NavBar />
            <div className={styles.portalArea}>
                <div className={styles.portalMenu}>
                    <div className={selectedButton === 1 ? styles.menuButtonAreaSelected : styles.menuButtonArea} onClick={() => handleMenuChange(1)}>
                        <img className={styles.buttonIcon} src={dashboardIcon} alt="Logo" />
                        <p className={styles.menuButton}>Dashboard</p>
                    </div>
                    <div className={selectedButton === 2 ? styles.menuButtonAreaSelected : styles.menuButtonArea} onClick={() => handleMenuChange(2)}>
                        <img className={styles.buttonIcon} src={litigationIcon} alt="Logo" />
                        <p className={styles.menuButton}>Litigation Docs</p>
                    </div>
                    <div className={selectedButton === 3 ? styles.menuButtonAreaSelected : styles.menuButtonArea} onClick={() => handleMenuChange(3)}>
                        <img className={styles.buttonIcon} src={legalIcon} alt="Logo" />
                        <p className={styles.menuButton}>Legal Analysis</p>
                    </div>
                    <div className={selectedButton === 4 ? styles.menuButtonAreaSelected : styles.menuButtonArea} onClick={() => handleMenuChange(4)}>
                        <img className={styles.buttonIcon} src={casesIcon} alt="Logo" />
                        <p className={styles.menuButton}>Cases</p>
                    </div>
                    <div className={selectedButton === 5 ? styles.menuButtonAreaSelected : styles.menuButtonArea} onClick={() => handleMenuChange(5)}>
                        <img className={styles.buttonIcon} src={settingsIcon} alt="Logo" />
                        <p className={styles.menuButton}>Settings</p>
                    </div>
                </div>
            {selectedButton === 2 && <Litigation />}
            {selectedButton === 3 && <LegalAnalysis />}
            {selectedButton === 4 && <Cases />}
            </div>
        </div>
    );
};

export default Portal;
