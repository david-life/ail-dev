import { useState } from 'react';
import styles from '../styles/InfoButton.module.css';

const InfoButton = () => {
    const [active, setActive] = useState(false);

    const toggleButton = () => {
        setActive(!active);
    };

    return (
        <div className={styles.container}>
            <button
                className={`${styles.infoButton} ${active ? styles.active : ''}`}
                onClick={toggleButton}
            >
                <i>i</i>
            </button>
            {active && <span className={styles.infoText}>AIL is developed and maintained by DoN NAVSEA Command. If you encounter any issues, contact us at ail.poc@us.navy.mil. We will do our best to respond to you as soon as possible.</span>}
        </div>
        
    );
};

export default InfoButton;
