import React, { useRef, useEffect, useState } from 'react';
import { X, Eraser, Pencil, Type, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Whiteboard({ socket, meetingId, onClose }) {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#3b82f6');
    const [lineWidth, setLineWidth] = useState(5);
    const [tool, setTool] = useState('pencil');

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        contextRef.current = context;

        // Socket listener for remote drawing
        if (socket) {
            socket.on('whiteboard-draw', (data) => {
                const { x, y, type, color: remoteColor, width: remoteWidth } = data;
                const ctx = contextRef.current;
                
                ctx.strokeStyle = remoteColor;
                ctx.lineWidth = remoteWidth;

                if (type === 'start') {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                } else if (type === 'draw') {
                    ctx.lineTo(x, y);
                    ctx.stroke();
                } else if (type === 'end') {
                    ctx.closePath();
                }
                
                // Restore local settings
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
            });
        }

        return () => {
            if (socket) socket.off('whiteboard-draw');
        };
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth, tool]);

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);

        socket.emit('whiteboard-draw', { x: offsetX, y: offsetY, type: 'start', color: contextRef.current.strokeStyle, width: lineWidth }, meetingId);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();

        socket.emit('whiteboard-draw', { x: offsetX, y: offsetY, type: 'draw', color: contextRef.current.strokeStyle, width: lineWidth }, meetingId);
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
        socket.emit('whiteboard-draw', { x: 0, y: 0, type: 'end' }, meetingId);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col"
        >
            {/* Toolbar */}
            <div className="h-20 bg-slate-900 border-b border-white/10 px-8 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10">
                        <ToolBtn icon={Pencil} active={tool === 'pencil'} onClick={() => setTool('pencil')} />
                        <ToolBtn icon={Eraser} active={tool === 'eraser'} onClick={() => setTool('eraser')} />
                    </div>

                    <div className="flex gap-3">
                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#000000'].map(c => (
                            <button 
                                key={c} 
                                onClick={() => { setColor(c); setTool('pencil'); }}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c && tool !== 'eraser' ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-white/10" />

                    <div className="flex items-center gap-3">
                        <input 
                            type="range" 
                            min="1" max="20" 
                            value={lineWidth} 
                            onChange={(e) => setLineWidth(e.target.value)}
                            className="w-32 accent-blue-600"
                        />
                        <span className="text-white font-mono text-xs w-6">{lineWidth}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={clearCanvas} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <canvas 
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                ref={canvasRef}
                className="flex-1 cursor-crosshair"
            />
        </motion.div>
    );
}

function ToolBtn({ icon: Icon, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-white'}`}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}
