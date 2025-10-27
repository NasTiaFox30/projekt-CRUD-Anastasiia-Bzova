import './Home.css';

export default function Home() {
return (
    <div className="home-container">
        <div className="hero-section">
            
            <div className="features-grid">
                <div className="feature-card">
                    <div className="feature-icon">📝</div>
                    <h3>Twórz zadania</h3>
                    <p>Dodawaj zadania o różnych priorytetach i kategoriach</p>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">🔄</div>
                    <h3>Śledź postęp</h3>
                    <p>Aktualizuj status zadań i obserwuj swój postęp</p>
                </div>
                
                <div className="feature-card">
                    <div className="feature-icon">📅</div>
                    <h3>Planuj terminy</h3>
                    <p>Ustalaj terminy i otrzymuj przypomnienia</p>
                </div>
            </div>
            
            <div className="cta-section">
                <h2>Zacznij korzystać już dziś!</h2>
                <p>Dołącz do tysięcy użytkowników, którzy już poprawili swoją produktywność</p>
            </div>
        </div>
    </div>
);
}