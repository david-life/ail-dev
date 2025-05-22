import React from 'react';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.left}>
        <p>AIL. Hosted by Defense Media Activity - web.mil</p>
      </div>
      <div className={styles.right}>
        <a href="https://advana.data.mil/">Spork</a>
        <a href="https://advana.data.mil/">DoD Advana</a>
        <a href="https://jupiter.data.mil/">DoN Jupiter</a>
      </div>
    </footer>
  );
};

export default Footer;
