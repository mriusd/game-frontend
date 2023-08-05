import styles from './Skills.module.scss'
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Skill } from 'interfaces/skill.interface';
import { useEventCloud } from 'store/EventCloudContext';

const Skills = () => {
    const { fighter, selectedSkill, setSelectedSkill } = useEventCloud();
    const skills = useRef<Record<number, Skill>>({})

    const toggleSkill = useCallback((skillId: number) => {
        setSelectedSkill(skillId);
    }, [setSelectedSkill])

    useEffect(() => {
        skills.current = { ...fighter.skills }
    }, [fighter]);

    return (
        <div className={styles.Skills}>
            {Object.values(skills.current).map((skill) => (
                <button
                    key={skill.skillId}
                    className={selectedSkill === skill.skillId ? styles.SkillSelected : ''}
                    onClick={() => toggleSkill(skill.skillId)}
                >
                    {skill.name}
                </button>
            ))}
        </div>
    )
}

export default Skills