import styles from '../styles/Home.module.css';

const MyComponent = () => (
  <div className={styles.container}>
   <img 
      src="200615-N-RD391-0001.png" 
      alt="DoN SEAL"
      width={142} 
      height={142}
      className={styles.centeredImage} /* Use the class from your CSS module */
    /> <p className={styles.description}>
      Semantic. Generative. Client-Side Rendering
      (CSR).
    </p>
    
  </div>
);

export default MyComponent;
