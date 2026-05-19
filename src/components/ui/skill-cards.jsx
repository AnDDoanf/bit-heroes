export function SkillCards({ skills }) {
  if (!skills?.length) return null;

  return (
    <div className="skill-grid">
      {skills.map((skill) => (
        <div
          key={`${skill.name}-${skill.sp_consume}-${skill.effect}`}
          className="skill-card"
        >
          <div className="skill-card-head">
            <span>{skill.name}</span>
            <strong>{skill.sp_consume}SP</strong>
          </div>
          <p>{skill.description || "-"}</p>
          <div className="skill-effect">{skill.effect || "-"}</div>
        </div>
      ))}
    </div>
  );
}
