import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Nav.module.css';
import logo from '../../assets/logos/Qazi_Logo_Default.png';
import searchIcon from '../../assets/Portal/search.png';
import notificationIcon from '../../assets/Portal/notifiaction.png';

const Nav = () => {
    const [searchText, setSearchText] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleNotificationClick = () => {
        setShowDropdown(false);
        setShowNotification(true);
        setTimeout(() => {
            setShowNotification(false);
        }, 2000);
    };

    const handleUserDPClick = () => {
        setShowNotification(false);
        setShowDropdown((prev) => !prev);
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className={styles.container}> 
            <img className={styles.logo} src={logo}></img>
            <div className={styles.searchBox}>
                <img className={styles.searchIcon} src={searchIcon}></img>
                <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className={styles.inputBox}
                />
            </div>
            <img 
                className={styles.notiIcon} 
                src={notificationIcon} 
                alt="Notification Icon"
                onClick={handleNotificationClick}
            />
            <div className={styles.userDP} onClick={handleUserDPClick}></div>
            {showNotification && (
                <div className={styles.notificationPopup}>
                    You are up to date!
                </div>
            )}
            {showDropdown && (
                <div className={styles.dropdown}>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Nav;
