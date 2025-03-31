import React from 'react';
import { Canvas } from 'react-three-fiber'; // Importing 3D rendering library
import { useFrame } from 'react-three-fiber';
import { useRef } from 'react';

const ArmourOfGod = () => {
    const meshRef = useRef();

    // Animation for the 3D model
    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01; // Rotate the model
        }
    });

    return (
        <div>
            <h1>Armour of God AI Jewelry Clothing and Suits</h1>
            <p>Experience the ultimate protection and style with our Armour of God clothing and suits, designed with advanced AI technology.</p>
            <h2>Features:</h2>
            <ul>
                <li>Durable and lightweight materials</li>
                <li>Customizable designs for personal expression</li>
                <li>AI-enhanced features for comfort and functionality</li>
                <li>Available in various styles and colors</li>
            </ul>
            <Canvas>
                {/* Render 3D models representing the Armour of God */}
                <mesh ref={meshRef}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color={'#ff0000'} />
                </mesh>
            </Canvas>
            <p>Embrace your strength and style with our unique offerings!</p>
        </div>
    );
};

export default ArmourOfGod;
