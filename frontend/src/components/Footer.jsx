import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} Market & Co. Built as a portfolio project.</span>
      </div>
    </footer>
  );
}
