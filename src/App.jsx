// App.jsx
import './App.css';
import { useState, useEffect, useRef } from 'react';



const Ballbeam =() => {

//values for pid control
const[pvalue, setPvalue] = useState(0);
const[ivalue, setIvalue] = useState(0);
const[dvalue, setDvalue] = useState(0);

//what the user gives as input for desired position
const [inputValue, setInputValue] = useState('');

//ball position , center on start up
const [ballX, setBallX] = useState(200);
const [ballY, setBallY] = useState(92);

const [theta, setTheta] = useState(0);

/* Beam is centered at (200, 100) with length 300.
 When theta = 0 -> beam is horizontal from (50, 100) to (350, 100)
 Positive theta tilts the right end up, negative theta tilts the left end up*/
const beamLength = 300; 
const centerX = 200;
const centerY = 100;
const x1 = centerX - (beamLength / 2) * Math.cos(theta);
const y1 = centerY - (beamLength / 2) * Math.sin(theta);
const x2 = centerX + (beamLength / 2) * Math.cos(theta);
const y2 = centerY + (beamLength / 2) * Math.sin(theta);



const [targetPosition, setTargetPosition] = useState(200);


const integralSumRef = useRef(0);
const previousErrorRef = useRef(0);



const handleSetTarget = () => {
  const parsed = parseFloat(inputValue);
  if (!isNaN(parsed)) {
    const svgX = 50 + parsed;
    setTargetPosition(svgX);
    setDisplayTarget(parsed.toFixed(0)); // Store the display value
    setInputValue(''); // Clear input
  }
};





//bottom of the screen - target display
const [displayTarget, setDisplayTarget] = useState('');




useEffect(() => {
  const interval = setInterval(() => {

    
    
    const error = targetPosition - ballX;
    
    const proportional = pvalue * error * 0.01;
    
    integralSumRef.current += error;

    const integral = ivalue * integralSumRef.current * 0.01;

    const previousError = previousErrorRef.current;
    const dT = 0.05;
    const derivative = 0.005* dvalue * (error - previousError) / dT;
    previousErrorRef.current = error;

    const delta = proportional + integral + derivative;
    /* this is for clamping the total movement, making sure that visually the ball doesn't move to suddenly, but instead more smoothly*/
    const maxStep = 2; // maximum pixels allowed per update

    let clampedDelta = delta;
    if (delta > maxStep) clampedDelta = maxStep;
    if (delta < -maxStep) clampedDelta = -maxStep;

    //The PID formula
    let newX = ballX + clampedDelta;




    /* updating the angle */
    const maxAngle = Math.PI / 6; //max angle 30 degrees,but in radians
    let newTheta = proportional * 0.01
    if (newTheta > maxAngle) newTheta = maxAngle;
    if (newTheta < -maxAngle) newTheta = -maxAngle;


  // Calculate new beam endpoints with the updated theta
  const updatedX1 = centerX - (beamLength / 2) * Math.cos(newTheta);
  const updatedY1 = centerY - (beamLength / 2) * Math.sin(newTheta);
  const updatedX2 = centerX + (beamLength / 2) * Math.cos(newTheta);
  const updatedY2 = centerY + (beamLength / 2) * Math.sin(newTheta);
  
  // Ensure the ball stays on the beam by clamping its position
  if (newX < 50) newX = 50;
  if (newX > 350) newX = 350;

    //we set the new beam angle
    setTheta(newTheta);

    /* When newX = 50 -> ball is on the left end of the beamWhen newX = 350 -> ball is on the right end */
    const ballPositionRatio = (newX - 50) / 300;
    const baseBallX = updatedX1 + ballPositionRatio * (updatedX2 - updatedX1);
    const baseBallY = updatedY1 + ballPositionRatio * (updatedY2 - updatedY1);

    // Apply an offset to position the ball slightly above the beam
    const initialOffset = 10; // offset distance from the beam's path
    const normalAngle = theta - Math.PI / 2;  // Get the angle for the beam's tilt
    const newBallX = baseBallX + initialOffset * Math.cos(normalAngle);
    const newBallY = baseBallY + initialOffset * Math.sin(normalAngle);


    setBallX(newBallX);
    setBallY(newBallY);

  }, 50); // update every 50ms

  return () => clearInterval(interval); // clean up
}, [ballX, targetPosition, pvalue, ivalue, dvalue]);





return (
  <div className="Ballbeam">
    <div className="controls">
      <h1>Ball on Beam Simulation</h1>

      <div className="input-group">
        <label>Enter a desired position [0-300] for the ball:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSetTarget();
            }
          }}
        />
        <button onClick={handleSetTarget}>Set Target</button>
      </div>

      

      <div className="slider-group">
        <label htmlFor="p-slider">P: {pvalue}</label>
        <input
          id="p-slider"
          type="range"
          min="0"
          max="20"
          step="0.1"
          value={pvalue}
          onChange={(e) => setPvalue(parseFloat(e.target.value))}
        />

        <label htmlFor="i-slider">I: {ivalue}</label>
        <input
          id="i-slider"
          type="range"
          min="0"
          max="5"
          step="0.01"
          value={ivalue}
          onChange={(e) => setIvalue(parseFloat(e.target.value))}
        />

        <label htmlFor="d-slider">D: {dvalue}</label>
        <input
          id="d-slider"
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={dvalue}
          onChange={(e) => setDvalue(parseFloat(e.target.value))}
        />
      </div>
    </div>

    <div className="simulation">
      <svg width="400" height="200" style={{ border: '1px solid black' }}>
           <defs>
          <linearGradient id="beamGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a827c" />
            <stop offset="100%" stopColor="#969390" />
          </linearGradient>
          <radialGradient id="ballGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffaaaa" />
            <stop offset="100%" stopColor="darkred" />
          </radialGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#333" />
          </filter>
        </defs>

        <rect
          x={centerX - beamLength / 2}
          y={100 - 4}
          width={beamLength}
          height={8}
          rx={4}
          fill="url(#beamGradient)"
          transform={`rotate(${(theta * 180) / Math.PI}, ${centerX}, 100)`}
        />

        <circle
          cx={ballX}
          cy={ballY}
          r="10"
          fill="url(#ballGradient)"
          stroke="#800000"
          strokeWidth="1"
          filter="url(#shadow)"
        />
      </svg>

      <div id="position-display">
        <div>Current Position: {(ballX - 50).toFixed(0)}</div>
        <div>Target Position: {displayTarget}</div>
      </div>
    </div>
  </div>
);
}

export default Ballbeam;
