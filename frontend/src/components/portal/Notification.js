import React, { useEffect } from 'react';
import styles from './Notification.module.css';

const Notification = ({ message, onClose, type = 'info' }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 2000); // Automatically close after 2 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles.notification} ${styles[type]}`}>
            {message}
        </div>
    );
};

export default Notification;
