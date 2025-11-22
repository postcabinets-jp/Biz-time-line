
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, LayoutGrid, MonitorUp, MessageSquare, Sparkles, Check } from 'lucide-react';
import { Meeting, MeetingMinutes } from '../types';
import { analyzeMeetingWithAI } from '../services/geminiService';
import { CURRENT_USER, MOCK_USERS } from '../constants';

interface MeetingRoomProps {
  meetings: Meeting[];
  onAddMeeting: (meeting: Meeting) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
}

export const MeetingRoom: React.FC<MeetingRoomProps> = ({ meetings, onAddMeeting, onUpdateMeeting }) => {
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  
  // Media State
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Transcription State
  const [transcript, setTranscript] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const activeMeeting = meetings.find(m => m.id === activeMeetingId);

  // Handle Video Stream
  useEffect(() => {
    if (isInCall && activeMeeting?.type === 'video') {
      const startVideo = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: isVideoEnabled, 
            audio: true 
          });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
          alert("カメラまたはマイクへのアクセスが許可されていません。");
        }
      };
      startVideo();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }, [isInCall, activeMeeting?.type]);

  // Handle Speech Recognition (Web Speech API)
  useEffect(() => {
    if (isInCall && isAudioEnabled) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ja-JP';

        recognition.onresult = (event: any) => {
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalChunk += event.results[i][0].transcript + '\n';
            }
          }
          if (finalChunk) {
            setTranscript(prev => {
              const newTranscript = prev + `[${new Date().toLocaleTimeString()}] ${CURRENT_USER.name}: ${finalChunk}`;
              return newTranscript;
            });
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch(e) {
           console.error("Failed to start recognition", e);
        }
      } else {
        console.warn("Web Speech API not supported in this browser");
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isInCall, isAudioEnabled]);

  // Toggle Video Track
  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => track.enabled = isVideoEnabled);
    }
  }, [isVideoEnabled, stream]);

  // Toggle Audio Track
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = isAudioEnabled);
    }
  }, [isAudioEnabled, stream]);

  const handleStartMeeting = (type: 'video' | 'audio') => {
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: `${type === 'video' ? 'ビデオ' : '音声'}会議 ${new Date().toLocaleTimeString('ja-JP')}`,
      date: new Date().toISOString(),
      participants: [CURRENT_USER, MOCK_USERS['u2'], MOCK_USERS['u3']], 
      transcript: '',
      isActive: true,
      type: type
    };
    onAddMeeting(newMeeting);
    setActiveMeetingId(newMeeting.id);
    setIsInCall(true);
    setIsVideoEnabled(type === 'video');
    setTranscript("=== 自動文字起こし開始 ===\n");
  };

  const handleEndCall = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsInCall(false);
    
    if (activeMeeting) {
      const endedMeeting = { ...activeMeeting, isActive: false, transcript: transcript };
      onUpdateMeeting(endedMeeting);
      // Auto analyze
      handleAnalyze(endedMeeting);
    }
    setActiveMeetingId(null);
  };

  const handleAnalyze = async (meetingToAnalyze: Meeting) => {
    setIsAnalyzing(true);
    try {
      // Fallback text if transcript is too short (for demo purposes)
      const textToAnalyze = meetingToAnalyze.transcript.length > 20 
        ? meetingToAnalyze.transcript 
        : meetingToAnalyze.transcript + "\n(デモ用ログ: 本日はプロジェクトAの進捗について議論しました。田中さんはUI実装を完了。佐藤さんはAPI仕様書を来週までに作成することになりました。)";
        
      const minutes = await analyzeMeetingWithAI({ ...meetingToAnalyze, transcript: textToAnalyze });
      onUpdateMeeting({ ...meetingToAnalyze, transcript: textToAnalyze, minutes });
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render Active Call Interface ---
  if (isInCall && activeMeeting) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="h-16 bg-gray-800 flex items-center justify-between px-6 shadow-md shrink-0">
          <div className="flex items-center gap-3 text-white">
             <div className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></div>
             <span className="font-semibold tracking-wide">{activeMeeting.title}</span>
             <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
                {activeMeeting.participants.map(p => (
                   <img key={p.id} src={p.avatar} className="w-8 h-8 rounded-full border-2 border-gray-800" alt={p.name} />
                ))}
             </div>
             <button className="bg-gray-700 p-2 rounded text-white hover:bg-gray-600"><LayoutGrid size={20}/></button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Video Grid */}
          <div className="flex-1 p-4 grid grid-cols-2 gap-4 overflow-y-auto bg-gray-900 relative">
             {/* Self Video */}
             <div className="bg-gray-800 rounded-xl overflow-hidden relative shadow-lg border border-gray-700 aspect-video group">
                {activeMeeting.type === 'video' && isVideoEnabled ? (
                   <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                        {CURRENT_USER.name[0]}
                      </div>
                   </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-white text-xs font-medium flex items-center gap-2">
                  {CURRENT_USER.name} (あなた) {!isAudioEnabled && <MicOff size={12} className="text-red-400"/>}
                </div>
                <div className="absolute inset-0 ring-2 ring-blue-500/0 group-hover:ring-blue-500/50 transition-all rounded-xl pointer-events-none"></div>
             </div>

             {/* Mock Participants */}
             {activeMeeting.participants.filter(p => p.id !== CURRENT_USER.id).map((p) => (
               <div key={p.id} className="bg-gray-800 rounded-xl overflow-hidden relative shadow-lg border border-gray-700 aspect-video">
                  <img src={p.avatar} alt={p.name} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-white text-xs font-medium">
                    {p.name}
                  </div>
                  {/* Mock talking indicator */}
                  <div className="absolute top-3 right-3 bg-green-500 p-1.5 rounded-full animate-pulse">
                    <Mic size={12} className="text-white" />
                  </div>
               </div>
             ))}
          </div>

          {/* AI Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
             <div className="p-4 border-b border-gray-100 bg-indigo-50 flex justify-between items-center">
               <span className="font-bold text-indigo-900 flex items-center gap-2">
                 <Sparkles size={16} /> AI リアルタイム議事録
               </span>
               <span className="text-xs text-indigo-600 animate-pulse">Listening...</span>
             </div>
             <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-sm text-gray-700 space-y-2 whitespace-pre-wrap">
                  {transcript || <span className="text-gray-400 italic">発言するとここに文字起こしされます...</span>}
                </div>
             </div>
          </div>
        </div>

        {/* Controls Footer */}
        <div className="h-20 bg-gray-800 flex justify-center items-center gap-6 shrink-0 border-t border-gray-700 pb-4">
           <button 
             onClick={() => setIsAudioEnabled(!isAudioEnabled)}
             className={`p-4 rounded-full transition-all ${isAudioEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'}`}
           >
             {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
           </button>
           
           {activeMeeting.type === 'video' && (
             <button 
               onClick={() => setIsVideoEnabled(!isVideoEnabled)}
               className={`p-4 rounded-full transition-all ${isVideoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'}`}
             >
               {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
             </button>
           )}

           <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
             <MonitorUp size={24} />
           </button>

           <button className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600">
             <MessageSquare size={24} />
           </button>

           <button 
             onClick={handleEndCall}
             className="px-8 py-4 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 flex items-center gap-2 ml-4"
           >
             <PhoneOff size={24} /> 退出する
           </button>
        </div>
      </div>
    );
  }

  // --- Render Meeting List (Lobby) ---
  return (
    <div className="h-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline Meeting</h2>
          <p className="text-gray-500">Webカメラ・マイクを使用したリアルタイム会議とAI自動議事録。</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => handleStartMeeting('audio')}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Mic size={20} />
            <span>音声会議</span>
          </button>
          <button 
            onClick={() => handleStartMeeting('video')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
          >
            <Video size={20} />
            <span>ビデオ会議を開始</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meetings.map(m => (
          <div key={m.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
               <div className={`p-2 rounded-lg ${m.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                 {m.type === 'video' ? <Video size={20} /> : <Mic size={20} />}
               </div>
               <span className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</span>
            </div>
            
            <h3 className="font-bold text-gray-800 mb-1">{m.title}</h3>
            <div className="flex -space-x-2 mb-4 mt-2">
               {m.participants.map(p => (
                  <img key={p.id} src={p.avatar} className="w-6 h-6 rounded-full border border-white" alt={p.name} />
               ))}
            </div>

            {m.minutes ? (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                 <div className="flex items-center gap-1 text-green-600 font-bold text-xs mb-1">
                   <Check size={12} /> 議事録作成済
                 </div>
                 <p className="text-gray-600 line-clamp-2 text-xs">{m.minutes.summary}</p>
                 <button 
                   onClick={() => {
                      setActiveMeetingId(m.id);
                      setTranscript(m.transcript);
                   }}
                   className="text-blue-600 text-xs font-medium mt-2 hover:underline"
                 >
                   詳細を確認
                 </button>
              </div>
            ) : (
               <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-700 flex items-center justify-center gap-2 border border-yellow-100">
                 <Sparkles size={14} />
                 <span onClick={() => handleAnalyze(m)} className="cursor-pointer hover:underline font-medium">
                   {isAnalyzing ? 'AI生成中...' : 'AI議事録を作成'}
                 </span>
               </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Preview Modal for Ended Meetings */}
      {activeMeetingId && !isInCall && activeMeeting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">{activeMeeting.title}</h3>
                <button onClick={() => setActiveMeetingId(null)} className="p-2 hover:bg-gray-100 rounded-full">X</button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-sm text-gray-500 uppercase mb-2">文字起こしログ</h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap border border-gray-200 max-h-60 overflow-y-auto">
                    {activeMeeting.transcript || "ログがありません"}
                  </div>
                </div>

                {activeMeeting.minutes && (
                  <div className="border-t pt-6">
                    <h4 className="font-bold text-indigo-600 mb-4 flex items-center gap-2">
                      <Sparkles size={18} /> AI生成サマリー
                    </h4>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-4">
                       <div>
                         <strong className="text-sm text-indigo-900">要約:</strong>
                         <p className="text-sm text-indigo-800 mt-1">{activeMeeting.minutes.summary}</p>
                       </div>
                       <div>
                         <strong className="text-sm text-indigo-900">決定事項:</strong>
                         <ul className="list-disc list-inside text-sm text-indigo-800 mt-1">
                           {activeMeeting.minutes.decisions.map((d, i) => <li key={i}>{d}</li>)}
                         </ul>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
