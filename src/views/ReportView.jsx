import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, useGLTF, Center, OrbitControls, Html } from '@react-three/drei';
import { Camera, AlertCircle, RefreshCw, Loader2, Mic } from 'lucide-react';
import { useStore } from '../store';
import * as THREE from 'three';

// Part name mapping for the default bus model
const PART_NAMES_BUS = {
    // Body / Runko
    'Cubo028_Cubo060': 'Katto',
    'Cubo020_Cubo058': 'Runko (pohja)',
    'Cubo053_Cubo056': 'Etupää',
    'Cubo052_Cubo043': 'Alapuskurit',
    'Cubo048': 'Kattopaneeli',
    'Cubo036_Cubo049': 'Runkorakenne',
    'Cubo027_Cubo047': 'Sivupaneelit',
    'Cubo032_Cubo038': 'Takapaneelit',
    'Cubo029_Cubo033': 'Takarunko',
    'Cubo017_Cubo015': 'Pohjalevyt',
    'Cubo009_Cubo025': 'Alatuki',

    // Windows / Ikkunat
    'Cubo012': 'Tuulilasi',
    'Cubo006': 'Sivuikkunat',

    // Tires / Renkaat
    'Pneu_Dianteiro_D001_Cylinder006': 'Eturenkaat',
    'Pneu_Tracao_Et_Cylinder004': 'Takarenkaat',

    // Interior / Sisätilat
    'Poltronas01000_Cubo039': 'Matkustajapenkit (vasen)',
    'Poltronas01001_Cubo008': 'Matkustajapenkit (oikea)',
    'Plano': 'Verhot',
    'Plano004': 'Lattia',
    'Plano006_Plano002': 'Kojetaulu',

    // Lights / Valot
    'Cubo043_Cubo009': 'Ajovalot',
    'Cubo042_Cubo022': 'Takavalot (puna)',
    'Cubo041_Cubo003': 'Vilkut',
    'Cubo021_Cubo026': 'Jarruvalot',

    // Structure / Alumiinirakenteet
    'Cubo025_Cubo002': 'Ikkunakehykset',
    'Cubo002_Cubo045': 'Muoviverhoilu',
    'Círculo': 'Pyörännavat',
    'Cubo003_Cubo024': 'Kumilistat',

    // ---- Multi-mesh groups ----
    // Mirrors / Peilit
    'Cubo001-Mesh': 'Sivupeilit (runko)',
    'Cubo001-Mesh_1': 'Sivupeilit (lasi)',
    'Cubo001-Mesh_2': 'Sivupeilit (peili)',

    // Engine / Moottori
    'Cubo047_Cubo023-Mesh': 'Moottoritila',
    'Cubo047_Cubo023-Mesh_1': 'Moottoritila (alumiini)',
    'Cubo047_Cubo023-Mesh_2': 'Moottoritila (suoja)',

    // Front section
    'Cubo022_Cubo031-Mesh': 'Etupaneelit',
    'Cubo022_Cubo031-Mesh_1': 'Etupaneelit (pohja)',
    'Cubo022_Cubo031-Mesh_2': 'Etupaneelit (listat)',
    'Cubo022_Cubo031-Mesh_3': 'Etupaneelit (valot)',
    'Cubo022_Cubo031-Mesh_4': 'Etupaneelit (alumiini)',
    'Cubo022_Cubo031-Mesh_5': 'Etupaneelit (kehys)',
    'Cubo022_Cubo031-Mesh_6': 'Etupaneelit (musta)',

    // Dashboard area
    'Cubo046_Cubo020-Mesh': 'Kojelauta (muovi)',
    'Cubo046_Cubo020-Mesh_1': 'Kojelauta (pohja)',

    // Door panels
    'Cubo040_Cubo054-Mesh': 'Ovipaneelit',
    'Cubo040_Cubo054-Mesh_1': 'Ovipaneelit (listat)',

    // Rear window area
    'Cubo034_Cubo041-Mesh': 'Takaikkuna (kehys)',
    'Cubo034_Cubo041-Mesh_1': 'Takaikkuna (lasi)',

    // Side structure
    'Cubo033_Cubo040-Mesh': 'Sivurakenne (alumiini)',
    'Cubo033_Cubo040-Mesh_1': 'Sivurakenne (pohja)',
    'Cubo033_Cubo040-Mesh_2': 'Sivurakenne (listat)',

    // Various body parts
    'Cubo035_Cubo050-Mesh': 'Keskiosa (pohja)',
    'Cubo035_Cubo050-Mesh_1': 'Keskiosa (alumiini)',
    'Cubo031_Cubo042-Mesh': 'Kylkipaneelit (muovi)',
    'Cubo031_Cubo042-Mesh_1': 'Kylkipaneelit (kangas)',
    'Cubo051_Cubo028-Mesh': 'Penkkialueet (kangas)',
    'Cubo051_Cubo028-Mesh_1': 'Penkkialueet (pohja)',
    'Cubo051_Cubo028-Mesh_2': 'Penkkialueet (muovi)',
    'Cubo051_Cubo028-Mesh_3': 'Penkkialueet (alumiini)',

    // Headlights and details
    'Plano001-Mesh': 'Valopaneelit (muovi)',
    'Plano001-Mesh_1': 'Valopaneelit (alumiini)',
    'Plano001-Mesh_2': 'Valopaneelit (valo)',

    // Window assemblies
    'Plano005_Plano006-Mesh': 'Ikkunat (lasi)',
    'Plano005_Plano006-Mesh_1': 'Ikkunat (kehys)',
    'Plano003_Plano007-Mesh': 'Kattoluukut (kehys)',
    'Plano003_Plano007-Mesh_1': 'Kattoluukut (lasi)',
    'Plano002_Plano003-Mesh': 'Sisäpaneelit (muovi)',
    'Plano002_Plano003-Mesh_1': 'Sisäpaneelit (kangas)',

    // Wheel hub
    'Círculo002_Círculo003-Mesh': 'Vannekeskiöt (muovi)',
    'Círculo002_Círculo003-Mesh_1': 'Vannekeskiöt (muovi)',
    'Círculo002_Círculo003-Mesh_2': 'Vannekeskiöt (alumiini)',

    // Chassis / base
    'Cubo-Mesh': 'Alusta (muovi)',
    'Cubo-Mesh_1': 'Alusta (alumiini)',
    'Cubo024_Cubo036-Mesh': 'Pohjarakenne (alumiini)',
    'Cubo024_Cubo036-Mesh_1': 'Pohjarakenne (pohja)',
    'Cubo023_Cubo032-Mesh': 'Tukipalkki (alumiini)',
    'Cubo023_Cubo032-Mesh_1': 'Tukipalkki (pohja)',
    'Cubo023_Cubo032-Mesh_2': 'Tukipalkki (listat)',

    // Rear sections
    'Cubo019-Mesh': 'Takaosa (pohja)',
    'Cubo019-Mesh_1': 'Takaosa (valot)',
    'Cubo019-Mesh_2': 'Takaosa (muovi)',
    'Cubo016_Cubo017-Mesh': 'Takakulma (pohja)',
    'Cubo016_Cubo017-Mesh_1': 'Takakulma (muovi)',
    'Cubo016_Cubo017-Mesh_2': 'Takakulma (valot)',
    'Cubo013-Mesh': 'Takapuskuri (pohja)',
    'Cubo013-Mesh_1': 'Takapuskuri (muovi)',
    'Cubo013-Mesh_2': 'Takapuskuri (valot)',
    'Cubo013-Mesh_3': 'Takapuskuri (alumiini)',
    'Cubo010-Mesh': 'Kylkilistat (pohja)',
    'Cubo010-Mesh_1': 'Kylkilistat (muovi)',
    'Cubo010-Mesh_2': 'Kylkilistat (valot)',
    'Cubo005-Mesh': 'Edessä alhaalla (pohja)',
    'Cubo005-Mesh_1': 'Edessä alhaalla (alumiini)',
    'Cubo004-Mesh': 'Etukulma (alumiini)',
    'Cubo004-Mesh_1': 'Etukulma (pohja)',
};

function getPartName(modelFile, nodeName, materialName) {
    if (modelFile === '/bus.glb') {
        return PART_NAMES_BUS[nodeName] || nodeName;
    } else if (modelFile === '/byd.glb') {
        const mat = (materialName || '').toLowerCase();
        if (mat.includes('mirror')) return 'Sivupeilit';
        if (mat.includes('vidro') || mat.includes('window')) return 'Ikkunat';
        if (mat.includes('tire') || mat.includes('wheel') || mat.includes('pneu')) return 'Renkaat';
        if (mat.includes('farol') || mat.includes('luz')) return 'Valot';
        if (mat.includes('banco')) return 'Matkustajapenkit';
        if (mat.includes('floor')) return 'Lattia';
        if (mat.includes('plastic')) return 'Muoviosat';
        if (mat.includes('metal')) return 'Metalliosat';
        if (mat.includes('mascara')) return 'Puskuri';
        return 'Kori (BYD)';
    } else if (modelFile === '/yutang.glb') {
        const mat = (materialName || '').toLowerCase();
        if (mat.includes('glass')) return 'Ikkunat';
        if (mat.includes('aluminum') || mat.includes('steel') || mat.includes('metal')) return 'Metalliosat';
        if (mat.includes('fabric')) return 'Matkustajapenkit';
        if (mat.includes('asphalt')) return 'Lattia';
        if (mat.includes('color')) return 'Kori (Solaris)';
        if (mat.includes('charcoal')) return 'Muoviosat';
        if (mat.includes('aim') || mat.includes('ftv')) return 'Ulkokuori';
        return 'Kori (Solaris)';
    }
    return nodeName;
}

// Loading spinner while 3D model loads
function LoadingSpinner() {
    return (
        <Html center>
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                color: 'var(--accent-color)', fontFamily: 'Inter, sans-serif'
            }}>
                <div className="animate-pulse" style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: '3px solid var(--accent-color)', borderTopColor: 'transparent',
                    animation: 'spin 1s linear infinite'
                }} />
                <span style={{ fontSize: '1rem', color: '#94a3b8' }}>Ladataan 3D-mallia...</span>
            </div>
        </Html>
    );
}

// Real Dynamic Bus Model — loads right .glb for the active vehicle
function DynamicBusModel({ modelFile, onPartClick }) {
    const group = useRef();
    const { nodes } = useGLTF(modelFile);
    const [hovered, setHovered] = useState(null);

    // Force computation of bounding boxes for every imported mesh
    useEffect(() => {
        Object.values(nodes).forEach(node => {
            if (node.isMesh && node.geometry) {
                if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
                if (!node.geometry.boundingSphere) node.geometry.computeBoundingSphere();
            }
        });
    }, [nodes]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.position.y = (Math.sin(t) * 0.005) - 1.5;
        }
    });

    const handlePointerOver = (e, nodeName, materialName) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered({ nodeName, materialName });
        if (e.object.material) {
            e.object.material = e.object.material.clone();
            e.object.material.emissiveIntensity = 0.5;
            e.object.material.emissive = new THREE.Color(0x38bdf8);
        }
    };

    const handlePointerOut = (e) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        setHovered(null);
        if (e.object.material) {
            e.object.material.emissiveIntensity = 0;
            e.object.material.emissive = new THREE.Color(0x000000);
        }
    };

    const handleClick = (e, nodeName, materialName) => {
        e.stopPropagation();
        const localPoint = e.object.worldToLocal(e.point.clone());
        const clickPoint = [localPoint.x, localPoint.y, localPoint.z];

        onPartClick(getPartName(modelFile, nodeName, materialName), clickPoint);
    };

    // Build all meshes dynamically from the nodes object
    const meshes = Object.entries(nodes)
        .filter(([, node]) => node.isMesh)
        .filter(([, node]) => {
            const matName = (node.material?.name || '').toLowerCase();
            // Nämä näkymättömät massiiviset asvalttitasot ja valokeilat rikkovat 3D-mallin keskityksen!
            if (matName.includes('asphalt')) return false;
            if (matName.includes('beam') || matName.includes('luz_high')) return false;
            return true;
        })
        .map(([name, node]) => (
            <mesh
                key={name}
                frustumCulled={false}
                geometry={node.geometry}
                material={node.material}
                onClick={(e) => handleClick(e, name, node.material?.name)}
                onPointerOver={(e) => handlePointerOver(e, name, node.material?.name)}
                onPointerOut={handlePointerOut}
            />
        ));

    // Determine scale and rotation per model format
    let containerScale = [1.4, 1.4, 1.4];
    let containerRot = [0, Math.PI / 2, 0];
    let meshesRot = [0, 0, 0];
    let meshesScale = [1, 1, 1];
    let meshesPos = [0, 0, 0];

    if (modelFile === '/byd.glb') {
        containerScale = [1.0, 1.0, 1.0]; // Tweaked scale to fit camera
        meshesRot = [-Math.PI / 2, 0, 0];
        meshesScale = [1.3, 1.3, 1.3]; // BYD model geometry is tiny, but don't overscale
    } else if (modelFile === '/yutang.glb') {
        containerScale = [1.2, 1.2, 1.2];
        meshesRot = [-Math.PI / 2, 0, 0];
        meshesPos = [0, -4.5, 0]; // Shift Yutang origin from front bumper to center
    }

    return (
        <group ref={group} dispose={null} scale={containerScale} position={[0, -1.5, 0]} rotation={containerRot} frustumCulled={false}>
            <group rotation={meshesRot} scale={meshesScale} position={meshesPos}>
                {meshes}

                {/* Defect Markers rendered INSIDE the mesh group so they inherit rotation and scaling */}
                <DefectMarkers modelFile={modelFile} />
            </group>

            {/* Hover Tooltip rendered at root to stay upright */}
            {hovered && (
                <Html position={[0, 3.5, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '0.75rem',
                        padding: '0.5rem 1rem',
                        color: '#f8fafc',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 4px 20px rgba(56, 189, 248, 0.2)',
                        textAlign: 'center',
                    }}>
                        <span style={{ color: '#38bdf8' }}>🔍</span> {getPartName(modelFile, hovered.nodeName, hovered.materialName)}
                    </div>
                </Html>
            )}
        </group>
    );
}

useGLTF.preload('/bus.glb');
useGLTF.preload('/byd.glb');
useGLTF.preload('/yutang.glb');

// Single pulsing defect marker sphere
function PulsingMarker({ color, position, number }) {
    const meshRef = useRef();
    const ringRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
        }
        if (ringRef.current) {
            ringRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.3);
            ringRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.15;
        }
    });

    return (
        <group position={position}>
            {/* Core sphere */}
            <mesh ref={meshRef} frustumCulled={false}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Outer glow ring */}
            <mesh ref={ringRef} frustumCulled={false}>
                <ringGeometry args={[0.12, 0.18, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
            {/* Number Label */}
            <Html distanceFactor={8} center style={{ pointerEvents: 'none' }} position={[0, 0.25, 0]}>
                <div style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: color, boxShadow: `0 0 12px ${color}`,
                    color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.2)'
                }}>
                    {number}
                </div>
            </Html>
        </group>
    );
}

// Markers indicating existing defects — rendered INSIDE the RealBusModel group
function DefectMarkers({ modelFile }) {
    const { defects, activeVehicle } = useStore();
    const { nodes } = useGLTF(modelFile);
    const colorMap = { red: '#ef4444', yellow: '#eab308', green: '#22c55e' };

    const getPosition = (partName) => {
        if (!partName) return null;

        let targetName = null;
        if (modelFile === '/bus.glb') {
            targetName = Object.entries(PART_NAMES_BUS).find(([, name]) => name === partName)?.[0];
            if (!targetName) {
                targetName = Object.entries(PART_NAMES_BUS).find(([, name]) => partName.includes(name) || name.includes(partName))?.[0];
            }
        } else {
            // Reverse mapping using material heuristics for new models
            targetName = Object.entries(nodes).find(([, node]) => {
                const matName = node.material?.name;
                return getPartName(modelFile, node.name, matName) === partName;
            })?.[0];
        }

        if (!targetName || !nodes[targetName] || !nodes[targetName].isMesh) return null;

        const mesh = nodes[targetName];
        if (!mesh.geometry.boundingBox) {
            mesh.geometry.computeBoundingBox();
        }

        const center = new THREE.Vector3();
        mesh.geometry.boundingBox.getCenter(center);

        // Since we are inside the bus group, we just use the raw geometry center (local coordinates).
        // Added a tiny offset to prevent Z-fighting with the geometry.
        return [center.x, center.y + 0.1, center.z];
    };

    return (
        <>
            {defects.filter(d => d.vehicle === activeVehicle?.id).map((d, index) => {
                // Use exact click coordinates if available, otherwise fallback to mesh center
                const position = d.coordinates || getPosition(d.part);
                if (!position) return null;

                return (
                    <PulsingMarker
                        key={d.id}
                        color={colorMap[d.status]}
                        position={position}
                        number={index + 1}
                    />
                );
            })}
        </>
    );
}

// Generate a simulated defect photo using canvas
function generateDefectPhoto(partName, severity) {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    // Simulated damage area
    const colors = { red: '#ef4444', yellow: '#eab308', green: '#22c55e' };
    ctx.beginPath();
    ctx.arc(200 + Math.random() * 60 - 30, 150 + Math.random() * 40 - 20, 40 + Math.random() * 30, 0, Math.PI * 2);
    ctx.fillStyle = colors[severity] + '44';
    ctx.fill();
    ctx.strokeStyle = colors[severity];
    ctx.lineWidth = 2;
    ctx.stroke();

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(180, 150);
    ctx.lineTo(220, 150);
    ctx.moveTo(200, 130);
    ctx.lineTo(200, 170);
    ctx.strokeStyle = '#38bdf833';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText(`📸 ${partName}`, 15, 25);
    ctx.fillText(new Date().toLocaleString('fi-FI'), 15, 285);
    ctx.fillStyle = colors[severity];
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('● VIKA HAVAITTU', 280, 25);

    return canvas.toDataURL('image/png');
}

// Report Modal Component — shows existing defects AND allows new reports
function ReportModal({ part, clickPoint, onClose }) {
    const {
        activeVehicle, setActiveVehicle, setActiveVehicleByQR,
        addDefect, defects, addToast, user, vehicles
    } = useStore();
    const [mode, setMode] = useState('overview'); // overview, newReport, camera, analyzing, result
    const [result, setResult] = useState(null);
    const [description, setDescription] = useState('');
    const [mediaPreview, setMediaPreview] = useState(null); // base64 data URL
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [severity, setSeverity] = useState(null);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const chunksRef = useRef([]);
    const [isListening, setIsListening] = useState(false);

    // Find existing defects for this part (also filter by physical distance if both have coordinates)
    const existingDefects = defects.filter(d => {
        if (d.vehicle !== activeVehicle?.id) return false;

        const nameMatch = d.part === part || (d.part && d.part.includes(part)) || (d.part && part.includes(d.part));
        if (!nameMatch) return false;

        // If we have exact coordinates for both the existing defect and the current click,
        // ensure they are physically close (e.g. less than 2 meters apart).
        // This prevents clicking the left mirror from showing the right mirror's defects.
        if (d.coordinates && clickPoint) {
            const dx = d.coordinates[0] - clickPoint[0];
            const dy = d.coordinates[1] - clickPoint[1];
            const dz = d.coordinates[2] - clickPoint[2];
            const distSq = dx * dx + dy * dy + dz * dz;
            if (distSq > 4.0) return false; // 2.0 meters squared
        }

        return true;
    });

    // Cleanup camera on unmount or mode change
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // ---- Camera functions ----
    const openCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false,
            });
            setCameraStream(stream);
            setMode('camera');
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            }, 100);
        } catch (err) {
            addToast('Kamera ei ole käytettävissä. Valitse tiedosto galleriasta.', 'warning');
            fileInputRef.current?.click();
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Add timestamp overlay
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`📸 ${part} — ${new Date().toLocaleString('fi-FI')}`, 10, canvas.height - 10);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setMediaPreview(dataUrl);
        setMediaType('image');
        stopCamera();
        setMode('newReport');
    };

    const startVideoRecording = () => {
        if (!cameraStream) return;
        chunksRef.current = [];
        const recorder = new MediaRecorder(cameraStream, { mimeType: 'video/webm' });
        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
                setMediaType('video');
                stopCamera();
                setMode('newReport');
            };
            reader.readAsDataURL(blob);
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setIsRecording(true);

        // Auto-stop after 15 seconds
        setTimeout(() => {
            if (recorder.state === 'recording') {
                recorder.stop();
                setIsRecording(false);
            }
        }, 15000);
    };

    const stopVideoRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            setCameraStream(null);
        }
    };

    // ---- File upload ----
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1280;
                const MAX_HEIGHT = 1280;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
                setMediaPreview(dataUrl);
                setMediaType('image');
                setMode('newReport');
            };
            img.src = URL.createObjectURL(file);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
                setMediaType('video');
                setMode('newReport');
            };
            reader.readAsDataURL(file);
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            addToast('Selaimesi ei tue puheentunnistusta.', 'warning');
            return;
        }
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'fi-FI';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setDescription(prev => prev ? prev + ' ' + transcript : transcript);
        };
        recognition.start();
    };

    // ---- Analyze & Submit ----
    const handleAnalyze = () => {
        setMode('analyzing');
        setTimeout(() => {
            const severities = ['green', 'yellow', 'red'];
            const analysisResult = severities[Math.floor(Math.random() * severities.length)];
            setResult(analysisResult);
            setSeverity(analysisResult);
            setMode('result');
        }, 2000);
    };

    const handleSubmit = () => {
        const finalSeverity = severity || result || 'yellow';
        addDefect({ part, status: finalSeverity, description, photo: mediaPreview, mediaType, coordinates: clickPoint });
        onClose();
    };

    const severityLabels = {
        green: { label: 'Lievä', desc: 'Kosmeettinen vika. Voi jatkaa ajoa, korjataan seuraavassa huollossa.', color: '#22c55e' },
        yellow: { label: 'Keskivakava', desc: 'Vaatii korjaamon huomiota lähipäivinä.', color: '#eab308' },
        red: { label: 'Kriittinen', desc: 'Turvallisuusriski! Ajokielto, korvaava auto tilattu.', color: '#ef4444' },
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffH = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffH < 1) return 'Juuri nyt';
        if (diffH < 24) return `${diffH}h sitten`;
        return `${Math.floor(diffH / 24)}pv sitten`;
    };

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.85)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '480px', margin: '0 1rem', padding: '1.5rem', borderRadius: '1.25rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                >&times;</button>

                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                    {existingDefects.length > 0 ? '🔍 Osan tiedot' : '📋 Uusi vikailmoitus'}
                </h2>
                <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Osa: {part}
                </p>

                {/* ====== OVERVIEW MODE: Show existing defects ====== */}
                {mode === 'overview' && (
                    <>
                        {existingDefects.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={18} style={{ color: '#eab308' }} />
                                    Aiemmat vikailmoitukset ({existingDefects.length})
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {existingDefects.map(defect => {
                                        const sev = severityLabels[defect.status];
                                        // To get the correct global index, filter by vehicle first to match what DefectMarkers does
                                        const vehicleDefects = defects.filter(d => d.vehicle === activeVehicle?.id);
                                        const globalIndex = vehicleDefects.findIndex(d => d.id === defect.id) + 1;
                                        return (
                                            <div key={defect.id} className="glass-panel" style={{
                                                padding: '1rem', borderRadius: '0.75rem',
                                                borderLeft: `3px solid ${sev.color}`,
                                            }}>
                                                {/* Header with Number and Status */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '50%',
                                                            background: sev.color, color: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 'bold', fontSize: '0.85rem',
                                                            boxShadow: `0 0 8px ${sev.color}66`
                                                        }}>
                                                            {globalIndex}
                                                        </div>
                                                        <span style={{
                                                            background: `${sev.color}22`, color: sev.color,
                                                            padding: '0.2rem 0.6rem', borderRadius: '2rem',
                                                            fontSize: '0.75rem', fontWeight: '600',
                                                        }}>{sev.label}</span>
                                                    </div>
                                                    <span style={{ color: '#64748b', fontSize: '0.75rem', textAlign: 'right' }}>
                                                        Odotteluaika: {formatTime(defect.reportedAt)}
                                                    </span>
                                                </div>

                                                {/* Media (photo or video) */}
                                                {defect.photo && (
                                                    defect.mediaType === 'video' ? (
                                                        <video src={defect.photo} controls style={{
                                                            width: '100%', height: '160px', objectFit: 'cover',
                                                            borderRadius: '0.5rem', marginBottom: '0.75rem',
                                                            border: `1px solid ${sev.color}33`,
                                                        }} />
                                                    ) : (
                                                        <img src={defect.photo} alt="Vikakuva" style={{
                                                            width: '100%', height: '160px', objectFit: 'cover',
                                                            borderRadius: '0.5rem', marginBottom: '0.75rem',
                                                            border: `1px solid ${sev.color}33`,
                                                        }} />
                                                    )
                                                )}

                                                {/* Description */}
                                                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                                    {defect.description || 'Ei kuvausta'}
                                                </p>

                                                {/* Info banner */}
                                                <div style={{
                                                    marginTop: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                                    background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.15)',
                                                    fontSize: '0.75rem', color: '#94a3b8',
                                                }}>
                                                    ✅ Tämä vika on jo raportoitu — ei tarvitse soittaa ylläpidolle.
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Button to create new report */}
                        <button
                            className="btn btn-primary"
                            onClick={() => setMode('newReport')}
                            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: '600' }}
                        >
                            {existingDefects.length > 0 ? '➕ Ilmoita uusi vika tähän osaan' : '📸 Ota valokuva ja ilmoita viasta'}
                        </button>
                    </>
                )}

                {/* ====== NEW REPORT MODE: Choose media source ====== */}
                {mode === 'newReport' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />

                        {/* Media preview if already captured */}
                        {mediaPreview && (
                            <div style={{ position: 'relative' }}>
                                {mediaType === 'video' ? (
                                    <video src={mediaPreview} controls style={{
                                        width: '100%', height: '200px', objectFit: 'cover',
                                        borderRadius: '0.75rem', border: '2px solid rgba(56, 189, 248, 0.3)',
                                    }} />
                                ) : (
                                    <img src={mediaPreview} alt="Esikatselu" style={{
                                        width: '100%', height: '200px', objectFit: 'cover',
                                        borderRadius: '0.75rem', border: '2px solid rgba(56, 189, 248, 0.3)',
                                    }} />
                                )}
                                <button onClick={() => { setMediaPreview(null); setMediaType(null); }} style={{
                                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                                    background: 'rgba(239, 68, 68, 0.8)', border: 'none', color: 'white',
                                    width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                                    fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>&times;</button>
                            </div>
                        )}

                        {/* Media capture buttons (only if no media yet) */}
                        {!mediaPreview && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <button onClick={openCamera} style={{
                                    padding: '1.25rem', borderRadius: '1rem', cursor: 'pointer',
                                    background: 'rgba(56, 189, 248, 0.08)', border: '2px dashed rgba(56, 189, 248, 0.3)',
                                    color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s',
                                }}>
                                    <Camera size={32} style={{ color: '#38bdf8' }} />
                                    📸 Ota kuva
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} style={{
                                    padding: '1.25rem', borderRadius: '1rem', cursor: 'pointer',
                                    background: 'rgba(168, 85, 247, 0.08)', border: '2px dashed rgba(168, 85, 247, 0.3)',
                                    color: '#94a3b8', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                                    transition: 'all 0.2s',
                                }}>
                                    <Loader2 size={32} style={{ color: '#a855f7', animation: 'none' }} />
                                    📁 Galleriasta
                                </button>
                            </div>
                        )}

                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Kuvaile vika omin sanoin (valinnainen)..."
                                style={{
                                    width: '100%', minHeight: '80px', background: 'rgba(30, 41, 59, 0.8)',
                                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem',
                                    padding: '0.75rem', paddingRight: '2.5rem', color: '#f8fafc', fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.875rem', resize: 'vertical', outline: 'none',
                                }}
                                onFocus={e => e.target.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button 
                                onClick={startListening}
                                style={{
                                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                                    background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.05)',
                                    border: isListening ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                    color: isListening ? '#ef4444' : '#94a3b8',
                                    padding: '0.4rem', borderRadius: '0.5rem', cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                title="Sanele kuvaus"
                            >
                                <Mic size={18} />
                            </button>
                        </div>

                        {/* Severity selector */}
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Vakavuusaste:</div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {['green', 'yellow', 'red'].map(st => (
                                    <button key={st} onClick={() => setSeverity(st)} style={{
                                        flex: 1, padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer',
                                        background: severity === st ? severityLabels[st].color + '22' : 'transparent',
                                        border: severity === st ? `2px solid ${severityLabels[st].color}` : '1px solid rgba(255,255,255,0.1)',
                                        color: severityLabels[st].color, fontFamily: 'Inter, sans-serif',
                                        fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s',
                                    }}>
                                        {severityLabels[st].label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit or analyze */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {mediaPreview && (
                                <button className="btn btn-primary" onClick={handleAnalyze} style={{
                                    flex: 1, justifyContent: 'center', padding: '0.75rem',
                                }}>
                                    🔍 Analysoi automaattisesti
                                </button>
                            )}
                            <button className="btn btn-primary" onClick={handleSubmit} style={{
                                flex: 1, justifyContent: 'center', padding: '0.75rem',
                                opacity: (!mediaPreview && !description) ? 0.5 : 1,
                            }} disabled={!mediaPreview && !description}>
                                ✅ Lähetä
                            </button>
                        </div>

                        <button onClick={() => { stopCamera(); setMode('overview'); }} style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8', padding: '0.5rem', borderRadius: '0.5rem',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                        }}>
                            ← Takaisin
                        </button>
                    </div>
                )}

                {/* ====== CAMERA MODE: Live viewfinder ====== */}
                {mode === 'camera' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative', borderRadius: '0.75rem', overflow: 'hidden', background: '#000' }}>
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                            />
                            {/* Crosshair overlay */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '60px', height: '60px', border: '2px solid rgba(56, 189, 248, 0.5)',
                                borderRadius: '50%', pointerEvents: 'none',
                            }} />
                            {isRecording && (
                                <div style={{
                                    position: 'absolute', top: '0.75rem', left: '0.75rem',
                                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                                    background: 'rgba(239, 68, 68, 0.8)', padding: '0.3rem 0.6rem',
                                    borderRadius: '2rem', fontSize: '0.75rem', color: '#fff',
                                }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: '#fff', animation: 'pulse 1s infinite',
                                    }} />
                                    Nauhoittaa...
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={capturePhoto} style={{
                                flex: 1, justifyContent: 'center', padding: '0.75rem',
                            }}>
                                📸 Ota kuva
                            </button>
                            {!isRecording ? (
                                <button className="btn" onClick={startVideoRecording} style={{
                                    flex: 1, justifyContent: 'center', padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                }}>
                                    🔴 Nauhoita video
                                </button>
                            ) : (
                                <button className="btn" onClick={stopVideoRecording} style={{
                                    flex: 1, justifyContent: 'center', padding: '0.75rem',
                                    background: 'rgba(239, 68, 68, 0.3)', borderColor: '#ef4444',
                                    color: '#fff',
                                }}>
                                    ⬛ Lopeta nauhoitus
                                </button>
                            )}
                        </div>

                        <button onClick={() => { stopCamera(); setMode('newReport'); }} style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            color: '#94a3b8', padding: '0.5rem', borderRadius: '0.5rem',
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                        }}>
                            ← Takaisin
                        </button>
                    </div>
                )}

                {/* ====== ANALYZING MODE ====== */}
                {mode === 'analyzing' && (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                        <RefreshCw size={48} className="animate-pulse" style={{ color: 'var(--accent-color)', marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Analysoidaan vikaa...</p>
                        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Määritetään vakavuusastetta.</p>
                    </div>
                )}

                {/* ====== RESULT MODE: Photo preview + severity + submit ====== */}
                {mode === 'result' && result && (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Photo preview */}
                        {mediaPreview && (
                            <img src={mediaPreview} alt="Vikakuva" style={{
                                width: '100%', height: '180px', objectFit: 'cover',
                                borderRadius: '0.75rem', border: `2px solid ${severityLabels[result].color}`,
                            }} />
                        )}

                        {/* Severity */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 1rem auto',
                                background: `var(--status-${result})`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 0 30px var(--status-${result})`,
                            }}>
                                <AlertCircle size={30} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>
                                {severityLabels[result].label}
                            </h3>
                            <p style={{ color: '#94a3b8', marginBottom: '0.75rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                                {severityLabels[result].desc}
                            </p>
                        </div>

                        {/* Description */}
                        {description && (
                            <div style={{
                                background: 'rgba(30, 41, 59, 0.6)', padding: '0.75rem', borderRadius: '0.5rem',
                                color: '#cbd5e1', fontSize: '0.85rem',
                            }}>
                                💬 {description}
                            </div>
                        )}

                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem', fontWeight: '600' }} onClick={handleSubmit}>
                            ✅ Lähetä vikailmoitus
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReportView() {
    const { activePart, setActivePart, activeVehicle, vehicles } = useStore();
    const [clickPoint, setClickPoint] = useState(null);

    // Resolve the modelFile for the current vehicle from vehicles array, or fallback
    const vehicleDef = vehicles.find(v => v.id === activeVehicle?.id);
    const modelFile = vehicleDef?.modelFile || '/bus.glb';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Overlay UI */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 1, pointerEvents: 'none' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', textShadow: '0 2px 10px rgba(0,0,0,0.5)', lineHeight: 1.2 }}>
                    🚌 Interaktiivinen 3D-tarkastus
                </h2>
                <p style={{ fontSize: '1rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                    Pyöritä bussia ja klikkaa osaa ilmoittaaksesi viasta.
                </p>
            </div>

            {/* Controls hint, bottom right */}
            <div style={{
                position: 'absolute', bottom: '1.5rem', right: '1.5rem', zIndex: 1,
                pointerEvents: 'none', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(10px)',
                padding: '0.6rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem', color: '#64748b',
                border: '1px solid rgba(255,255,255,0.05)',
            }}>
                🖱️ Vasen = pyöritä &nbsp;|&nbsp; 🔄 Rulla = zoomaa &nbsp;|&nbsp; 🖱️ Oikea = siirrä
            </div>

            {/* 3D Canvas Container */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}>
                <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 2000 }} gl={{ preserveDrawingBuffer: true }}>
                    <color attach="background" args={['#0f172a']} />
                    {/* Lights */}
                    <ambientLight intensity={0.6} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                    <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
                    <pointLight position={[0, 5, 0]} intensity={0.3} />

                    <Suspense fallback={<LoadingSpinner />}>
                        {/* Environment for reflections */}
                        <Environment preset="city" />
                        <Center key={modelFile}>
                            <DynamicBusModel modelFile={modelFile} onPartClick={(part, point) => {
                                setActivePart(part);
                                setClickPoint(point);
                            }} />
                        </Center>
                    </Suspense>

                    <OrbitControls
                        makeDefault
                        enablePan={true}
                        enableZoom={true}
                        minDistance={2}
                        maxDistance={60}
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2 + 0.1}
                    />

                    <ContactShadows position={[0, -1.8, 0]} scale={20} blur={2} far={4.5} />
                </Canvas>
            </div>

            {/* Modal overlays over the canvas */}
            {activePart && (
                <ReportModal
                    part={activePart}
                    clickPoint={clickPoint}
                    onClose={() => {
                        setActivePart(null);
                        setClickPoint(null);
                    }}
                />
            )}
        </div>
    );
}
