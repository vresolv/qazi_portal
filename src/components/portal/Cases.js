import React, { useState } from 'react';
import styles from './Cases.module.css';
import hardcodedContent from '../../assets/Portal/CasesHarcode.png';

const Cases = () => {

    return (
        <div className={styles.container}> 
            {/* <div className={styles.subContainer}> */}
                <img className={styles.hardcodedContent} src={hardcodedContent}></img>
            {/* </div> */}
        </div>
    );
};

export default Cases;
