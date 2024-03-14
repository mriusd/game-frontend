import * as THREE from 'three'
import React, { useEffect, useState, useRef } from 'react';
import { Flex, Box } from '@react-three/flex';
import { Plane, Text } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber'
import { useCharStats } from 'Scene/UserInterface3D/CharStats/useCharStats';
import { memo } from 'react'

const colors = {
    COMMON_DARK: '#131313',
    COMMON_LIGHT: '#202020',

    INSERT_ALLOWED_DARK: '#183419',
    INSERT_ALLOWED_LIGHT: '#1F3D20',

    INSERT_DISALLOWED_DARK: '#351B1B',
    INSERT_DISALLOWED_LIGHT: '#442323',

    LAST_PLACEHOLDER_DARK: '#342F00', 
    LAST_PLACEHOLDER_LIGHT: '#393400', 
}

const StatControl = ({ label, value, onIncrement, positionY }) => (
    <group position={[0, positionY, 0]} onClick={(event) => { event.stopPropagation(); console.log('Click on CharStats'); }}>
        {/* Increased fontSize and adjusted positions for larger text */}
        <Text position={[0, 0, 0]} fontSize={18} color="white">{label}</Text>
        <Text position={[100, 0, 0]} fontSize={18} color="white">{value}</Text>
        <mesh position={[180, 0, 0]} onClick={onIncrement}>
            <planeBufferGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="green" />
            <Text position={[0, 0, 0.1]} fontSize={18} color="white" anchorX="center" anchorY="middle">+</Text>
        </mesh>
    </group>
);

const CharStats = memo(function CharStats() {

    const [availableStats, setAvailableStats] = useState(10); // Initialize available stats
    const [stats, setStats] = useState({
        Strength: 5,
        Agility: 5,
        Energy: 5,
        Vitality: 5,
    });

    const handleStatChange = (stat, delta) => {
        if (delta > 0 && availableStats <= 0) return; // Prevent incrementing when no available stats
        if (delta < 0 && stats[stat] <= 0) return; // Prevent decrementing below 0

        setStats(prevStats => ({
            ...prevStats,
            [stat]: prevStats[stat] + delta,
        }));

        setAvailableStats(prev => prev - delta);
    };

    const [mounted, mount] = useState<boolean>(false);
    useEffect(() => { setTimeout(() => mount(true), 1000) }, []);

    const [width, height, isOpened] = useCharStats(state => [state.width, state.height, state.isOpened]);

    console.log(isOpened)
    const get = useThree(state => state.get)
    const charStatsRef = useRef<THREE.Group | null>(null)
    const marginRight = 64
    React.useLayoutEffect(() => {
        if (!charStatsRef.current) { return }
        const canvasWidth = get().size.width
        const menuWidth = 300
        charStatsRef.current.position.x = canvasWidth / 2 - menuWidth - marginRight
    })

    console.log(charStatsRef.current)
    const handleComponentClick = (event) => {
        event.stopPropagation();
    };

    return (
        <group visible={isOpened} ref={charStatsRef} >
            <Flex flexDir="column" position={[0, 0, 0]}>
                <Plane args={[300, 300]} position={[75, -75, -1]} rotation={[0, 0, 0]}>
                    <meshBasicMaterial color={colors.COMMON_DARK} />
                </Plane>
                <Box centerAnchor>
                    <Text fontSize={18} color="gold">Available Stats: {availableStats}</Text>
                </Box>
                {Object.keys(stats).map((key, index) => (
                    <StatControl 
                        key={key} 
                        label={key} 
                        value={stats[key]} 
                        onIncrement={() => handleStatChange(key, 1)} 
                        positionY={-index * 30 - 50} // Adjust Y position based on index
                    />
                ))}
            </Flex>
        </group>
    );
});

export default CharStats;