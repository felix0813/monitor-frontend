interface ComingSoonPageProps {
  title: string;
  description: string;
}

function ComingSoonPage({ title, description }: ComingSoonPageProps) {
  return (
    <section className="coming-soon-page">
      <div className="coming-soon-card">
        <p className="coming-soon-kicker">Placeholder Route</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}

export default ComingSoonPage;
