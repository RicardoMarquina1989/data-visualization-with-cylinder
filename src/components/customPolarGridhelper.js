import React from 'react';
import { extend } from '@react-three/fiber';
import { Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { SMTs, } from '../constant';

extend({ Line });

export const PolarGridHelper = ({ radius = 10, divisions = 16, circleDivision = 3, color = '#000000', clonedSMTs }) => {
    console.log("clonedSMTs", clonedSMTs)
    const lines = [];
    const headLineTexts = [];
    const departmentTitle = [];
    const headlineRadius = radius + 0.8;
    const smtlineRadius = radius / 2;
    // Generate concentric circles
    for (let i = 1; i <= circleDivision; i++) {
        const circleRadius = (radius / circleDivision) * i;
        const points = [];
        for (let j = 0; j <= 360; j += 360 / 128) { // Increase the last value for more detail
            const rad = THREE.MathUtils.degToRad(j);
            points.push(new THREE.Vector3(Math.cos(rad) * circleRadius, 0, Math.sin(rad) * circleRadius));
        }
        lines.push(<Line key={`circle-${i}`} points={points} color={color} />);
    }

    // Generate radial lines
    for (let i = 0; i < divisions; i++) {
        const angle = (2 * Math.PI / divisions) * i;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, 0, z)];
        lines.push(<Line key={`radial-${i}`} lineWidth={5} points={linePoints} color={color} />);
    }

    for (let i = 0; i < divisions; i++) {
        const angle = (2 * Math.PI / divisions) * i + Math.PI / divisions;
        const headlineX = Math.cos(angle) * headlineRadius;
        const headlineZ = Math.sin(angle) * headlineRadius;

        const departTitleX = Math.cos(angle) * smtlineRadius;
        const departTitleZ = Math.sin(angle) * smtlineRadius;

        headLineTexts.push({
            rotation: [-Math.PI / 2, 0, -angle + 4 * Math.PI / divisions],
            overflowWrap: "break-word",
            fontSize: 0.5,
            position: [headlineX, 0, headlineZ],
            anchorX: "center",
            anchorY: "middle",
            text: clonedSMTs[i].headline
        }
        )

        departmentTitle.push(
            <Text
                rotation={[-Math.PI / 2, 0, -angle + 4 * Math.PI / divisions]}
                overflowWrap="break-word"
                fontSize={0.8}
                position={[departTitleX, 0.0, departTitleZ]}
                anchorX="center"
                anchorY="middle">
                {SMTs[i].department}
            </Text>)
    }

    return <>
        <group>
            {lines}
            {headLineTexts.map((item) => {
                return (
                <Text
                    {...item}
                >{item.text}
                </Text>)
            })}
            {departmentTitle}
            <mesh position={[0, -0.28, 0]}>
                <cylinderGeometry args={[20, 20, 0.5, 128]} />
                {/* <circleGeometry args={[20, 128]} /> */}
                <meshStandardMaterial roughness={0.5} metalness={0.5} color={'#4F5857'} transparent />
            </mesh>
        </group>
    </>;
};
