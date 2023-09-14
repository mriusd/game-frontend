import styles from './Skills.module.scss'
import { useState, useEffect, useRef, useCallback } from 'react';
import type { Skill } from 'interfaces/skill.interface';

import { useFighter } from 'Scene/Fighter/useFighter';
import { useEvents } from 'store/EventStore';

const Skills = () => {
    const fighter = useFighter(state => state.fighter)
    const [ selectedSkill, setSelectedSkill ] = useEvents(state => [state.selectedSkill, state.setSelectedSkill]);

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