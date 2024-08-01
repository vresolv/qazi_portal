import React, { useState } from 'react';
import styles from './Nav.module.css';
import logo from '../../assets/logos/Qazi_Logo_Default.png';
import searchIcon from '../../assets/Portal/search.png';
import notificationIcon from '../../assets/Portal/notifiaction.png';

const Nav = () => {
    const [searchText, setSearchText] = useState('');

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
            <img className={styles.notiIcon} src={notificationIcon}></img>
            <div className={styles.userDP}></div>
        </div>
    );
};

export default Nav;
