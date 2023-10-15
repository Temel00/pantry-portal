import styles from "../styles/Home.module.css";
import Auth from "./auth";

const Header = () => {
  return (
    <>
      <header className={styles.header}>
        <img
          className={styles.logo}
          src="../../v1.1/FC_Logo_LG.png"
          alt="A sprouting potted plant: FloraCare's logo"
        />
        <h1 className={styles.headerTitle}>
          Flora<span className={styles.headerTitleEnd}>Care</span>
        </h1>
        <Auth />
      </header>
    </>
  );
};

export default Header;
