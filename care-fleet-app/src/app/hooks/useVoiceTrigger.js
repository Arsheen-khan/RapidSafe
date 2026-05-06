// Web Speech API hook — listens for emergency phrases like "help" or "call ambulance"
import { useEffect, useRef, useState } from "react";

export default function useVoiceTrigger(onTrigger) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSupported(true);
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase().trim();
        if (
          transcript.includes("help") ||
          transcript.includes("call ambulance") ||
          transcript.includes("emergency")
        ) {
          onTrigger?.(transcript);
        }
      }
    };

    rec.onend = () => {
      // auto restart while listening flag is on
      if (recognitionRef.current?._wantsListening) {
        try {
          rec.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = rec;
    return () => {
      try {
        rec.stop();
      } catch {
        // ignore
      }
    };
  }, [onTrigger]);

  const start = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current._wantsListening = true;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch {
      // already started
    }
  };

  const stop = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current._wantsListening = false;
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
    setListening(false);
  };

  return { listening, supported, start, stop };
}
