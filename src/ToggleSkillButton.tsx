import React, { useState, useEffect } from 'react';
import { useEventCloud } from './EventCloudContext';
import type { Skill } from 'interfaces/skill.interface';

import './ToggleSkillButton.css';

const ToggleSkillButton = () => {
  const { fighter, selectedSkill, setSelectedSkill } = useEventCloud();
  const [skills, setSkills] = useState<Record<number, Skill>>({});

  const toggleSkill = (skillId) => {
    setSelectedSkill(skillId);
  };

  useEffect(() => {
    setSkills({ ...fighter.skills });
  }, [fighter]);

  if (!skills) {
    return <p>Waiting for skills object</p>;
  }

  return (
    <div>
      {Object.values(skills).map((skill) => (
        <button
          key={skill.skillId}
          className={selectedSkill === skill.skillId ? 'selected' : ''}
          onClick={() => toggleSkill(skill.skillId)}
        >
          {skill.name}
        </button>
      ))}
    </div>
  );
};

export default ToggleSkillButton;