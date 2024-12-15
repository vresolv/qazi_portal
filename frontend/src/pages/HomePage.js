import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
import logo from '../assets/logos/Qazi_Logo_Default.png';

const HomePage = () => {

    const navigate = useNavigate();

    const handleLogIn = () => {
        navigate('/login');
        };

    return (
        <div className={styles.container}> 
            <div className={styles.subContainer}>
                <img src={logo} alt="Logo" />
                <div className={styles.features}>
                    <p>Litigation Docs</p>
                    <div className={styles.dividerCircle}></div>
                    <p>Judgments</p>
                    <div className={styles.dividerCircle}></div>
                    <p>Case Management</p>
                </div>
                <button className={styles.loginBtn} onClick={handleLogIn}>
                    Log in
                </button>
            </div>
        </div>
    );
};

export default HomePage;
