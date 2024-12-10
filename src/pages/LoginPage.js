import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import logo from '../assets/logos/Qazi_Logo_Light.png';
import bgVideo from '../assets/LogInPage/home_bg_video.mp4'

const LogInPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
  
    const handleLogIn = () => {
        if (username === 'admin' && password === 'admin') {
            navigate('/portal');
        } else {
            setErrorMessage('Invalid username or password');
        }
    };

    return (
        <div className={styles.container}> 
            <video src={bgVideo} autoPlay loop muted />
            <div className={styles.subContainer}>
                <img src={logo} alt="Logo" />
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputBox}
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputBox}
                />
                <div className={styles.errorContainer}>
                    {errorMessage && <p className={styles.error}>{errorMessage}</p>}
                </div>
                <button className={styles.loginBtn} onClick={handleLogIn}>
                    Log in
                </button>
            </div>
        </div>
        );
    };

export default LogInPage;
