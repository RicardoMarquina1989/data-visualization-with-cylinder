import * as THREE from 'three'
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, Html } from '@react-three/drei'
import { EffectComposer, N8AO, Bloom } from '@react-three/postprocessing'
import DC from './components/DC'
import 'react-responsive-modal/styles.css'
import { Modal } from 'react-responsive-modal'
import { colorType, radiusUnit, diameterUnit, SLT, SLT2, SMTs } from './constant'
import './style/custom-animation-tooltip.css'
import { PolarGridHelper } from './components/customPolarGridhelper'
import _ from 'lodash'
import { Stepper, Button, Group } from '@mantine/core'
import { IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconPlayerSkipBack, IconPlayerSkipForward } from '@tabler/icons-react'
import classes from './demo.stepper.css'
import { headlineNews } from './constant'

export function App() {
  const [curIndex, setCurIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [showtooltipModal, setShowtooltipModal] = useState(false)
  const [clickedDC, setClickedDC] = useState(null)
  const [clonedSLT, setUpdateData] = useState([])
  const [clonedSMTs, setUpdateSMTData] = useState([])
  const [interv, setInterv] = useState(null)

  const calc = () => {
    let cloned = _.clone(SLT)
    cloned = cloned.map((item) => {
      const length = item.score.length
      return {
        ...item,
        score: item.score[curIndex % length]
      }
    })
    setUpdateData(cloned)

    let clonedSMTs = _.clone(SMTs)
    clonedSMTs = clonedSMTs.map((item) => {
      const length = item.score.length
      let pitem = {
        ...item,
        headline: item.headline[curIndex % length],
        score: item.score[curIndex % length]
      }
      if (!_.has(pitem, 'OTs')) return pitem

      pitem.OTs = pitem.OTs.map((_item) => {
        const length = _item.score.length
        return {
          ..._item,
          score: _item.score[curIndex % length]
        }
      })
      return pitem
    })
    setUpdateSMTData(clonedSMTs)
  }

  const nextStep = () => {
    setCurIndex((current) => (current < 11 ? current + 1 : current))
  }

  const prevStep = () => setCurIndex((current) => (current > 0 ? current - 1 : current))

  const resetStep = () => {
    setCurIndex(0)
  }

  const handlePauseBtnClick = () => {
    setPaused((state) => {
      if (state) {
        const interval = setInterval(() => setCurIndex((current) => (current == 11 ? 0 : current + 1)), 5000)
        setInterv(interval)
      } else {
        //Clearing the interval
        clearInterval(interv)
      }
      return !state
    })
  }

  const onCloseModal = () => setShowtooltipModal(false)

  useEffect(() => {
    calc()
    console.log('useEffect, curINdex')
  }, [curIndex])

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => setCurIndex((current) => (current == 11 ? 0 : current + 1)), 5000)
    setInterv(interval)
    //Clearing the interval
    return () => clearInterval(interv)
  }, [])

  return (
    <>
      <Canvas gl={{ antialias: false }} camera={{ position: [0, 26, 0] }}>
        <OrbitControls maxDistance={40} minDistance={10} />
        <color attach="background" args={['#008080']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/blue_photo_studio_1k.hdr" resolution={512}></Environment>
        <EffectComposer disableNormalPass>
          <N8AO aoRadius={0.5} intensity={1} />
          <Bloom luminanceThreshold={1} intensity={0.5} levels={9} mipmapBlur />
        </EffectComposer>
        <PolarGridHelper radius={18} divisions={8} circleDivision={3} color="#fff" clonedSMTs={clonedSMTs} />
        <DC
          radius={0 * radiusUnit}
          size={10 * diameterUnit}
          data={clonedSLT}
          setShowtooltipModal={setShowtooltipModal}
          setClickedDC={setClickedDC}
        />
        <DC
          radius={12 * radiusUnit}
          size={4 * diameterUnit}
          data={clonedSMTs}
          setShowtooltipModal={setShowtooltipModal}
          setClickedDC={setClickedDC}
        />
      </Canvas>
      <Modal
        open={showtooltipModal}
        onClose={onCloseModal}
        center
        classNames={{
          overlayAnimationIn: 'customEnterOverlayAnimation',
          overlayAnimationOut: 'customLeaveOverlayAnimation',
          modalAnimationIn: 'customEnterModalAnimation',
          modalAnimationOut: 'customLeaveModalAnimation'
        }}
        animationDuration={800}>
        {clickedDC && clickedDC.material.color.getHexString() == colorType.red && clickedDC.userData.type !== 'SLT' && (
          <img class="image-details" src="/images/red.png" />
        )}
        {clickedDC && clickedDC.material.color.getHexString() == colorType.green && clickedDC.userData.type !== 'SLT' && (
          <img class="image-details" src="/images/green.png" />
        )}
        {clickedDC && clickedDC.material.color.getHexString() == colorType.yellow && clickedDC.userData.type !== 'SLT' && (
          <img class="image-details" src="/images/yellow.png" />
        )}
        {clickedDC && clickedDC.userData.type === 'SLT' && <img class="image-details" src="/images/SLT.png" />}
      </Modal>
      <div>
        <img className="logo" src="/images/CT-logo.png"></img>
      </div>
      <div className="team-details">
        <p> TeamScape™ Beta </p>
        <ul>
          <li> Your Organization</li>
          <li> Employees: 353 </li>
          <li> Teams: 50</li>
        </ul>
        <p> Team Effectiveness</p>
        <ul className="team-effectiveness">
          <li style={{ color: '#' + colorType.red, fontWeight: 'bold' }}> At Risk</li>
          <li style={{ color: '#' + colorType.yellow, fontWeight: 'bold' }}> Opportunity</li>
          <li style={{ color: '#' + colorType.green, fontWeight: 'bold' }}> High</li>
        </ul>
      </div>

      <h1 className="stepper-title">{headlineNews[curIndex]}</h1>
      <div className="stepper">
        <Stepper classNames={classes} iconSize={32} size="xs" active={curIndex} onStepClick={setCurIndex}>
          <Stepper.Step icon="Jan" completedIcon="Jan" progressIcon="Jan" aria-label="Create an account"></Stepper.Step>
          <Stepper.Step icon="Feb" completedIcon="Feb" progressIcon="Feb" title="Create an account"></Stepper.Step>
          <Stepper.Step icon="Mar" completedIcon="Mar" progressIcon="Mar"></Stepper.Step>
          <Stepper.Step icon="Apr" completedIcon="Apr" progressIcon="Apr"></Stepper.Step>
          <Stepper.Step icon="May" completedIcon="May" progressIcon="May"></Stepper.Step>
          <Stepper.Step icon="Jun" completedIcon="Jun" progressIcon="Jun"></Stepper.Step>
          <Stepper.Step icon="Jul" completedIcon="Jul" progressIcon="Jul"></Stepper.Step>
          <Stepper.Step icon="Aug" completedIcon="Aug" progressIcon="Aug"></Stepper.Step>
          <Stepper.Step icon="Sep" completedIcon="Sep" progressIcon="Sep"></Stepper.Step>
          <Stepper.Step icon="Oct" completedIcon="Oct" progressIcon="Oct"></Stepper.Step>
          <Stepper.Step icon="Nov" completedIcon="Nov" progressIcon="Nov"></Stepper.Step>
          <Stepper.Step icon="Dec" completedIcon="Dec" progressIcon="Dec"></Stepper.Step>
        </Stepper>

        <Group justify="center" mt="xl">
          <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }} onClick={handlePauseBtnClick}>
            {paused ? <IconPlayerPlay /> : <IconPlayerPause />}
            {paused ? 'Play' : 'Pause'}
          </Button>
          <Button variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }} onClick={prevStep}>
            <IconPlayerSkipBack />
            Prev
          </Button>
          <Button onClick={nextStep} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
            Next
            <IconPlayerSkipForward />
          </Button>
          <Button onClick={resetStep} variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
            Reset
            <IconPlayerStop />
          </Button>
        </Group>
      </div>
    </>
  )
}
