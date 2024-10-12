import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line, Text } from '@react-three/drei'
import { useControls, button } from "leva";
import "../style/hoverStyle.css"
import { colorType } from '../constant';
import _ from "lodash"
import { MathUtils } from 'three';
function Cylinder({ position, height, size, index, data, setShowtooltipModal, setClickedDC }) {
    let cylinderRef = useRef()
    // const [hoverDC, setHoverDC] = useState()
    // useFrame(() => {
    //     height = MathUtils.lerp(height, 20.0, 0.1);
      
    // })
    let DCcolor;
    let score = data.score;
    if (score >= 1 && score <= 40) {
        DCcolor = '#' + colorType.red;
    } else if (score > 40 && score <= 80) {
        DCcolor = '#' + colorType.yellow;
    } else if (score > 80) {
        DCcolor = '#' + colorType.green;
    }
    return (
        <group>
            <mesh
                name='DC'
                ref={cylinderRef}
                position={position}
                // onClick={(e) => {
                //     e.stopPropagation();
                //     if (clickedCylinder == cylinderRef) {
                //         setClickedCylinder(null);
                //     } else {
                //         setClickedCylinder(cylinderRef);
                //     }
                //     setDCcolor(DCcolor);
                // }}
                // onPointerOver={(e) => {
                //     setHoverDC(e.object)
                // }}
                // onPointerLeave={(e) => {
                //     setHoverDC(null)
                // }}
                onClick={(e) => {
                    setShowtooltipModal(true)
                    setClickedDC(e.object)
                }}
                userData={data}
            >
                <cylinderGeometry args={[size, size, height, 24]} />
                <meshStandardMaterial roughness={0.3} metalness={0.9} color={DCcolor} />
            </mesh>
            {data.type === "SLT" &&
                <>
                    <Text
                        rotation={[-Math.PI / 2, 0, 0]}
                        overflowWrap="break-word"
                        fontSize={0.7}
                        position={[position[0], position[1] * 2 + 0.01, position[2] - 1]}
                        anchorX="center"
                        anchorY="middle">
                        Senior
                    </Text>
                    <Text
                        rotation={[-Math.PI / 2, 0, 0]}
                        overflowWrap="break-word"
                        fontSize={0.7}
                        position={[position[0], position[1] * 2 + 0.01, position[2]]}
                        anchorX="center"
                        anchorY="middle">
                        Leadership
                    </Text>
                    <Text
                        rotation={[-Math.PI / 2, 0, 0]}
                        overflowWrap="break-word"
                        fontSize={0.7}
                        position={[position[0], position[1] * 2 + 0.01, position[2] + 1]}
                        anchorX="center"
                        anchorY="middle">
                        Team
                    </Text>
                </>
            }
        </group>
    )
}
export default function DC(props) {

    const [refresh, setRefresh] = useState(0)
    const rerender = () => setRefresh(prev => prev + 1)
    useEffect(() => {
        rerender();
    }, []);
    
    useEffect(() => {
        
    }, [props.data])

    const lines = useRef()
    const scene = useThree(({ scene }) => scene);
    // const [hoverDC, setHoverDC] = useState(null)

    let connectLines = [];
    let startingPos = {};
    const cylinders = []
    // let angleUnit ;
    const DCdata = props.data;
    
    const numCylinders = DCdata.length;
    const radius = props.radius

    // Pre-calculate angleUnit to avoid recalculating in loop
    const angleUnit = Math.PI * 2 / numCylinders;

    // Use for loop instead of forEach to optimize performance
    for (let i = 0; i < numCylinders; i++) {

        let height = (100 - DCdata[i].score) * 0.05;

        // Calculate x and z using pre-calculated angleUnit
        const angleSMT = (i / numCylinders) * Math.PI * 2;
        const x = radius * Math.cos(angleSMT + angleUnit / 2);
        const z = radius * Math.sin(angleSMT + angleUnit / 2);

        cylinders.push(
                {
                    position:[x, height / 2, z],
                    height,
                    size:props.size,
                    index:`${i}`,
                    data:DCdata[i],
                    setShowtooltipModal:props.setShowtooltipModal,
                    setClickedDC:props.setClickedDC,
            }
        );

        if (DCdata[i].OTs) {
            let x, z, angle;

            // Pre-calculate angleUnitOT to avoid recalculating in inner loop
            const angleUnitOT = angleUnit / DCdata[i].OTs.length;

            for (let j = 0; j < DCdata[i].OTs.length; j++) {

                let height = (100 - DCdata[i].OTs[j].score) * 0.05;

                if (j % 2 == 0) {
                    // Calculate x and z using pre-calculated angleUnitOT
                    angle = angleUnitOT * j;
                    x = radius * Math.cos(angle + angleUnitOT / 2 + angleUnit * i) * 2;
                    z = radius * Math.sin(angle + angleUnitOT / 2 + angleUnit * i) * 2;
                } else {
                    angle = angleUnitOT * j;
                    x = (radius + 1.5) * Math.cos(angle + angleUnitOT / 2 + angleUnit * i) * 2;
                    z = (radius + 1.5) * Math.sin(angle + angleUnitOT / 2 + angleUnit * i) * 2;
                }

                const geoArgs = [props.size / 2, props.size / 2, height, 24];

                cylinders.push(
                    {
                        position:[x, height / 2, z],
                        height,
                        size:props.size / 2,
                        index:`${i}_${j}`,
                        data:DCdata[i].OTs[j],
                        setShowtooltipModal:props.setShowtooltipModal,
                        setClickedDC:props.setClickedDC
                    }
                );
            }
        }
    }


    const colorOption = useMemo(() => {
        return {
            red: true,
            yellow: true,
            green: true,
            showlines: true
        }
    }, [])
    const visiblePerColor = useControls('Select', colorOption)

    scene.traverse(obj => {
        if (obj.isMesh && obj.name === 'DC') {
            const objColor = obj.material.color.getHexString();

            obj.visible =
                (objColor === colorType.red && visiblePerColor.red) ||
                (objColor === colorType.yellow && visiblePerColor.yellow) ||
                (objColor === colorType.green && visiblePerColor.green);

            const department = obj.userData.department;

            if (obj.userData.type === 'SMT') {
                startingPos[department] = [obj.position.x, 0.1, obj.position.z];
            }

            if (obj.userData.type === 'OT') {
                const start = startingPos[department];
                if (start) {
                    connectLines.push(
                        <Line
                            points={[start, [obj.position.x, 0.1, obj.position.z]]}
                            color={"#" + colorType.grey}
                            lineWidth={2}
                            dashed={false}
                        />
                    );
                }
            }
        }

        if (obj.isLine2) {
            if (obj.material.color.getHexString() === colorType.grey) {
                obj.visible = visiblePerColor.showlines;
            }
        }
    });

    return (
        <>
            <group>
                <group>
                    {cylinders.map((cylinder, index) => <Cylinder {...cylinder} />)}
                    {/* {hoverDC !== null && (
                        <Html position={hoverDC.position} >
                            <div class="content">
                                <div class="item-hints">
                                    <div class="hint" data-position="4">
                                        <span class="hint-radius"></span>
                                        <span class="hint-dot"></span>
                                        <div class="hint-content do--split-children">
                                            Team : {clickedCylinder.current.userData.department} Team <br />
                                            Department : {clickedCylinder.current.data.type}  <br />
                                            Size : {clickedCylinder.current.data.members} members <br />
                                            Score : {clickedCylinder.current.data.score} points <br />
                                            {dccolor == '#' + colorType.red && (
                                                <img class="image-details" src="/images/MicrosoftTeams-red.png" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Html>
                    )} */}
                </group >
                <group ref={lines}>
                    {connectLines.map((line, index) => line)}
                </group>
            </group>
        </>
    )
}
